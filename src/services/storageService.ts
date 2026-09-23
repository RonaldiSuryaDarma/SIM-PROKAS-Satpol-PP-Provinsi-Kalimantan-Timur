import { DamkarReport, ReportPeriod, ReportStatus, SyncState } from '../types';
import { INITIAL_REPORTS, createCleanReport } from '../data/seedData';
import { REGIONS_KALTIM } from '../data/regions';
import { db, validateFirestoreConnection } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, writeBatch, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY_REPORTS = 'simprokas_kaltim_reports_v6_clean';
const STORAGE_KEY_AUDIT = 'simprokas_kaltim_audit_v6_clean';

const DUMMY_PENGISI_NAMES = new Set([
  'Ahmad Fauzi, S.Kom.',
  'Rian Syahputra, S.Sos.',
  'Bambang Irawan, S.E.',
  'Dedi Kurniawan, S.T.',
  'Hendra Saputra',
  'Zainuddin, S.AP.',
  'Stefanus Huvat',
  'Arif Budiman',
  'Wahyu Ramadhan',
  'Kornelius Yoga',
  'Budi Santoso, S.AP.',
  'Ahmad Faisal, S.AP.'
]);

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  regionId?: string;
}

class StorageService {
  private reportsCache: Map<string, DamkarReport> = new Map();
  private auditLogs: AuditLogItem[] = [];
  private listeners: Set<() => void> = new Set();
  private syncListeners: Set<(state: SyncState) => void> = new Set();
  private saveTimeout: any = null;
  private syncState: SyncState = {
    status: 'synced',
    lastSynced: new Date().toLocaleTimeString('id-ID'),
    pendingCount: 0
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('simprokas_kaltim_reports_v3_clean');
        localStorage.removeItem('simprokas_kaltim_reports_clean_v2');
        localStorage.removeItem('simprokas_kaltim_reports_clean_v1');
        localStorage.removeItem('simprokas_kaltim_reports_v2');
        localStorage.removeItem('simprokas_kaltim_reports');
        localStorage.removeItem('simprokas_kaltim_audit_v3_clean');
        localStorage.removeItem('simprokas_kaltim_audit_clean_v2');
        localStorage.removeItem('simprokas_kaltim_audit_clean_v1');

        const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
        if (stored) {
          try {
            const parsed: DamkarReport[] = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              parsed.forEach(r => {
                if (r && r.id && !r.id.startsWith('kaltim-')) {
                  // If cached report contains legacy dummy names, reject it!
                  if (r.pengisi?.nama && DUMMY_PENGISI_NAMES.has(r.pengisi.nama.trim())) {
                    return;
                  }
                  this.reportsCache.set(r.id, r);
                }
              });
            }
          } catch (e) {
            console.error('Failed to parse cached reports:', e);
          }
        }
      }

      // Ensure all 10 regions have a clean empty template in cache
      INITIAL_REPORTS.forEach(r => {
        if (!this.reportsCache.has(r.id)) {
          this.reportsCache.set(r.id, JSON.parse(JSON.stringify(r)));
        }
      });
      this.persistImmediate();

      if (typeof window !== 'undefined' && window.localStorage) {
        const storedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
        if (storedAudit) {
          try {
            this.auditLogs = JSON.parse(storedAudit);
          } catch {
            this.auditLogs = [];
          }
        }
      }
      if (!this.auditLogs || this.auditLogs.length === 0) {
        this.auditLogs = [];
      }

      // Start Cloud Firestore Synchronization
      this.initFirestoreSync();
    } catch (e) {
      console.warn('Storage initialisation warning:', e);
      INITIAL_REPORTS.forEach(r => this.reportsCache.set(r.id, r));
    }
  }

  private async initFirestoreSync() {
    try {
      // Listen to real-time reports updates from Cloud Firestore
      onSnapshot(collection(db, 'reports'), (snapshot) => {
        if (!snapshot.empty) {
          snapshot.docs.forEach(docSnap => {
            const remoteData = docSnap.data() as DamkarReport;
            if (!remoteData || !remoteData.id || remoteData.id.startsWith('kaltim-') || remoteData.id.startsWith('test_')) {
              deleteDoc(doc(db, 'reports', docSnap.id)).catch(() => {});
              return;
            }

            // If incoming remote report contains dummy test names, auto-overwrite with clean draft!
            if (remoteData.pengisi?.nama && DUMMY_PENGISI_NAMES.has(remoteData.pengisi.nama.trim())) {
              const clean = createCleanReport(remoteData.regionId, remoteData.period, remoteData.year);
              this.reportsCache.set(remoteData.id, clean);
              setDoc(doc(db, 'reports', remoteData.id), clean).catch(() => {});
              return;
            }

            // Accept authoritative remote data
            this.reportsCache.set(remoteData.id, remoteData);
          });

          this.persistImmediate();
          this.setSyncState('synced', 0);
          this.notify();
        } else {
          // If empty in cloud, seed clean empty drafts from current cache
          this.seedFirestoreBatch();
        }
      }, (err) => {
        console.warn('Firestore real-time listener notice (using local cache):', err.message);
      });

      // Listen to real-time audit logs
      onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
        if (!snapshot.empty) {
          const logs: AuditLogItem[] = [];
          snapshot.forEach(docSnap => {
            const logItem = docSnap.data() as AuditLogItem;
            if (logItem && logItem.id) {
              logs.push(logItem);
            }
          });
          logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          this.auditLogs = logs.slice(0, 100);
          this.persistAuditImmediate();
          this.notify();
        }
      }, (err) => {
        console.warn('Audit logs listener notice:', err.message);
      });
    } catch (e) {
      console.warn('Firestore initial sync notice:', e);
    }
  }

  private async seedFirestoreBatch() {
    try {
      const batch = writeBatch(db);
      this.reportsCache.forEach((r, id) => {
        const ref = doc(db, 'reports', id);
        batch.set(ref, r, { merge: true });
      });
      await batch.commit();
      console.log('Seeded reports to Cloud Firestore successfully.');
    } catch (err) {
      console.warn('Error seeding reports to Firestore:', err);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeSync(listener: (state: SyncState) => void): () => void {
    this.syncListeners.add(listener);
    listener(this.syncState);
    return () => this.syncListeners.delete(listener);
  }

  public getSyncState(): SyncState {
    return { ...this.syncState };
  }

  public async forceSync(): Promise<void> {
    try {
      this.setSyncState('saving', 1);
      const snap = await getDocs(collection(db, 'reports'));
      if (!snap.empty) {
        snap.forEach(docSnap => {
          const remoteData = docSnap.data() as DamkarReport;
          if (remoteData && remoteData.id) {
            this.reportsCache.set(remoteData.id, remoteData);
          }
        });
      }
      this.persistImmediate();
      this.setSyncState('synced', 0);
      this.notify();
    } catch (e) {
      console.warn('Manual sync warning:', e);
      this.persistImmediate();
      this.notify();
    }
  }

  public resetToCleanDraft(regionId: string, period: ReportPeriod = 'SEMESTER_1', year = 2026, userContext?: string): DamkarReport {
    const id = `${regionId}-${year}-${period}`;
    const clean = createCleanReport(regionId, period, year);
    clean.lastUpdated = new Date().toISOString();

    this.reportsCache.set(id, JSON.parse(JSON.stringify(clean)));
    this.persistImmediate();
    this.notify();

    // Persist to Firestore
    try {
      const sanitized = JSON.parse(JSON.stringify(clean));
      setDoc(doc(db, 'reports', id), sanitized, { merge: true }).catch(err => {
        console.warn('Firestore reset clean notice:', err);
      });
    } catch (err) {
      console.warn('Firestore clean write notice:', err);
    }

    const reg = REGIONS_KALTIM.find(r => r.id === regionId);
    this.addAuditLog(
      userContext || 'Operator / Admin',
      'Format Bersih Form',
      `Menyiapkan form bersih untuk ${reg?.name || regionId} (${period} ${year})`,
      regionId
    );

    return clean;
  }

  public resetToOfficialBaseline(regionId: string, period: ReportPeriod = 'SEMESTER_1', year = 2026, userContext?: string): DamkarReport {
    return this.resetToCleanDraft(regionId, period, year, userContext);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  private setSyncState(status: 'synced' | 'saving' | 'offline', pendingCount = 0) {
    this.syncState = {
      status,
      lastSynced: new Date().toLocaleTimeString('id-ID'),
      pendingCount
    };
    this.syncListeners.forEach(fn => fn(this.syncState));
  }

  private persistImmediate() {
    try {
      const list = Array.from(this.reportsCache.values());
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(list));
      }
      this.setSyncState('synced', 0);
    } catch (err) {
      console.error('Persist error:', err);
      this.setSyncState('offline', 0);
    }
  }

  private persistAuditImmediate() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs.slice(0, 100)));
      }
    } catch (err) {
      console.error('Audit persist error:', err);
    }
  }

  private schedulePersist() {
    this.setSyncState('saving', 1);
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistImmediate();
      this.saveTimeout = null;
    }, 400); // 400ms debounce for high performance & snappy typing
  }

  public addAuditLog(user: string, action: string, details: string, regionId?: string) {
    const item: AuditLogItem = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      user,
      action,
      details,
      regionId
    };
    this.auditLogs.unshift(item);
    this.persistAuditImmediate();

    try {
      setDoc(doc(db, 'audit_logs', item.id), item, { merge: true }).catch(err => {
        console.warn('Firestore audit log write notice:', err);
      });
    } catch (e) {
      console.warn('Firestore audit log notice:', e);
    }
  }

  public getAuditLogs(): AuditLogItem[] {
    return [...this.auditLogs];
  }

  public getAllReports(): DamkarReport[] {
    return Array.from(this.reportsCache.values());
  }

  public getReport(regionId: string, period: ReportPeriod = 'SEMESTER_1', year = 2026): DamkarReport {
    const id = `${regionId}-${year}-${period}`;
    const existing = this.reportsCache.get(id);
    if (existing) {
      return existing;
    }

    // Check if initial template has this report
    const defaultSeed = INITIAL_REPORTS.find(r => r.id === id);
    if (defaultSeed) {
      const cloned = JSON.parse(JSON.stringify(defaultSeed));
      this.reportsCache.set(id, cloned);
      this.persistImmediate();
      return cloned;
    }

    const cleanReport = createCleanReport(regionId, period, year);
    this.reportsCache.set(id, cleanReport);
    this.persistImmediate();
    return cleanReport;
  }

  public saveReport(report: DamkarReport, userContext?: string): void {
    // Auto calculate totals to ensure data consistency
    report.bagianB.totalPns = (Number(report.bagianB.pnsStruktural) || 0) +
      (Number(report.bagianB.pnsFungsional) || 0) +
      (Number(report.bagianB.pnsPelaksana) || 0);

    report.bagianB.totalPppk = (Number(report.bagianB.pppk) || 0) +
      (Number(report.bagianB.pppkParuhWaktu) || 0);

    report.bagianE.totalKejadian = (Number(report.bagianE.sebabGasKompor) || 0) +
      (Number(report.bagianE.sebabListrik) || 0) +
      (Number(report.bagianE.sebabBahanBakar) || 0) +
      (Number(report.bagianE.sebabKelalaian) || 0) +
      (Number(report.bagianE.sebabLainnya) || 0);

    report.bagianF.totalOperasi = (Number(report.bagianF.kecelakaanTransportasi) || 0) +
      (Number(report.bagianF.waterRescue) || 0) +
      (Number(report.bagianF.animalRescue) || 0) +
      (Number(report.bagianF.ketinggian) || 0) +
      (Number(report.bagianF.bangunanRuntuh) || 0) +
      (Number(report.bagianF.pohonTumbang) || 0) +
      (Number(report.bagianF.percobaanBunuhDiri) || 0) +
      (Number(report.bagianF.pelepasanCincin) || 0) +
      (Number(report.bagianF.operasiLainnya) || 0);

    report.lastUpdated = new Date().toISOString();
    this.reportsCache.set(report.id, { ...report });
    this.persistImmediate();
    this.notify();

    // Persist to Cloud Firestore in real time
    try {
      const sanitized = JSON.parse(JSON.stringify(report));
      setDoc(doc(db, 'reports', report.id), sanitized)
        .then(() => {
          this.setSyncState('synced', 0);
        })
        .catch(err => {
          console.warn('Firestore async sync notice:', err);
        });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }

    if (userContext) {
      this.addAuditLog(userContext, 'Pembaruan Laporan', `Menyimpan data laporan ${report.regionId} (${report.period})`, report.regionId);
    }
  }

  public updateReportStatus(
    reportId: string,
    status: ReportStatus,
    notes?: string,
    verifiedBy?: string,
    userName?: string
  ): boolean {
    const report = this.reportsCache.get(reportId);
    if (!report) return false;

    report.status = status;
    report.lastUpdated = new Date().toISOString();

    if (status === 'submitted') {
      report.submittedAt = new Date().toISOString();
      this.addAuditLog(userName || 'Operator', 'Pengajuan Laporan', `Laporan ${report.regionId} resmi diajukan ke Satpol PP Provinsi Kaltim`, report.regionId);
    } else if (status === 'verified') {
      report.verifiedAt = new Date().toISOString();
      report.verifiedBy = verifiedBy || 'Satpol PP Prov. Kaltim';
      if (notes) report.revisionNotes = notes;
      this.addAuditLog(userName || 'Verifikator Provinsi', 'Verifikasi Diterima', `Laporan ${report.regionId} diverifikasi SAH oleh ${report.verifiedBy}`, report.regionId);
    } else if (status === 'revision_needed') {
      report.revisionNotes = notes || 'Perlu perbaikan data.';
      this.addAuditLog(userName || 'Verifikator Provinsi', 'Perlu Revisi', `Laporan ${report.regionId} dikembalikan untuk revisi: ${notes}`, report.regionId);
    }

    this.reportsCache.set(reportId, { ...report });
    this.persistImmediate();
    this.notify();

    // Persist status change to Cloud Firestore in real time
    try {
      const sanitized = JSON.parse(JSON.stringify(report));
      setDoc(doc(db, 'reports', reportId), sanitized)
        .then(() => {
          this.setSyncState('synced', 0);
        })
        .catch(err => {
          console.warn('Firestore status async notice:', err);
        });
    } catch (err) {
      console.warn('Firestore status write notice:', err);
    }

    return true;
  }

  public getKaltimSummary(period: ReportPeriod = 'SEMESTER_1', year = 2026) {
    const reports = REGIONS_KALTIM.map(reg => this.getReport(reg.id, period, year));
    
    let totalPns = 0;
    let totalPppk = 0;
    let totalNonAsn = 0;
    let totalSertifikasi = 0;
    let totalMobilDamkar = 0;
    let totalMobilTangki = 0;
    let totalMobilTangga = 0;
    let totalMobilRescue = 0;
    let totalRelawan = 0;
    let totalDesa = 0;
    let totalKejadianKebakaran = 0;
    let totalResponse15Menit = 0;
    let totalOperasiRescue = 0;
    let totalJiwaSelamat = 0;
    let totalMeninggal = 0;
    let totalLukaBakar = 0;
    let totalAsetSelamat = 0;
    let totalKerugian = 0;
    let totalBangunanDiinspeksi = 0;
    let totalMako = 0;
    let totalPos = 0;

    let submittedCount = 0;
    let verifiedCount = 0;
    let revisionCount = 0;
    let draftCount = 0;

    reports.forEach(r => {
      totalPns += r.bagianB.totalPns || 0;
      totalPppk += r.bagianB.totalPppk || 0;
      totalNonAsn += r.bagianB.nonAsn || 0;
      totalSertifikasi += (r.bagianB.sertifikasi.instruktur || 0) +
        (r.bagianB.sertifikasi.inspektur || 0) +
        (r.bagianB.sertifikasi.mfr || 0) +
        (r.bagianB.sertifikasi.rescue || 0);

      totalMobilDamkar += r.bagianC.mobilDamkar || 0;
      totalMobilTangki += r.bagianC.mobilTangki || 0;
      totalMobilTangga += r.bagianC.mobilTangga || 0;
      totalMobilRescue += r.bagianC.mobilRescue || 0;

      totalRelawan += r.bagianD.jumlahRelawan || 0;
      totalDesa += r.bagianD.jumlahDesaKelurahan || 0;

      totalKejadianKebakaran += r.bagianE.totalKejadian || 0;
      totalResponse15Menit += r.bagianE.response15Menit || 0;

      totalOperasiRescue += r.bagianF.totalOperasi || 0;

      totalJiwaSelamat += r.bagianG.jiwaSelamat || 0;
      totalMeninggal += r.bagianG.korbanMeninggal || 0;
      totalLukaBakar += r.bagianG.korbanLukaBakar || 0;

      totalAsetSelamat += r.bagianG.taksiranAsetSelamat || 0;
      totalKerugian += r.bagianG.taksiranKerugian || 0;

      totalBangunanDiinspeksi += (r.bagianH.bangunanRendahDiinspeksi || 0) +
        (r.bagianH.bangunanMenengahDiinspeksi || 0) +
        (r.bagianH.bangunanTinggiDiinspeksi || 0);

      totalMako += r.bagianA.jumlahMako || 0;
      totalPos += (r.bagianA.jumlahPosSektor || 0) + (r.bagianA.jumlahPos || 0);

      if (r.status === 'verified') verifiedCount++;
      else if (r.status === 'submitted') submittedCount++;
      else if (r.status === 'revision_needed') revisionCount++;
      else draftCount++;
    });

    const spmResponseRate = totalKejadianKebakaran > 0 
      ? Math.round((totalResponse15Menit / totalKejadianKebakaran) * 100) 
      : 100;

    return {
      period,
      year,
      totalRegions: REGIONS_KALTIM.length,
      statusBreakdown: {
        verified: verifiedCount,
        submitted: submittedCount,
        revision: revisionCount,
        draft: draftCount
      },
      sdm: {
        totalPns,
        totalPppk,
        totalNonAsn,
        totalSertifikasi,
        grandTotalPersonel: totalPns + totalPppk + totalNonAsn
      },
      sarpras: {
        totalMobilDamkar,
        totalMobilTangki,
        totalMobilTangga,
        totalMobilRescue,
        totalArmada: totalMobilDamkar + totalMobilTangki + totalMobilTangga + totalMobilRescue,
        totalMako,
        totalPos
      },
      relawan: {
        totalRelawan,
        totalDesa
      },
      operasional: {
        totalKejadianKebakaran,
        totalResponse15Menit,
        spmResponseRate,
        totalOperasiRescue,
        grandTotalInsiden: totalKejadianKebakaran + totalOperasiRescue
      },
      korbanDanAset: {
        totalJiwaSelamat,
        totalMeninggal,
        totalLukaBakar,
        totalAsetSelamat,
        totalKerugian,
        rasioPenyelamatanAset: totalAsetSelamat + totalKerugian > 0 
          ? Math.round((totalAsetSelamat / (totalAsetSelamat + totalKerugian)) * 100) 
          : 0
      },
      inspeksi: {
        totalBangunanDiinspeksi
      }
    };
  }

  // --- DISKOMINFO PROV KALTIM MIGRATION TOOLING ---

  public generateSQLDump(dialect: 'postgres' | 'mysql' = 'postgres'): string {
    const isPostgres = dialect === 'postgres';
    const timestamp = new Date().toISOString();
    const reports = this.getAllReports();

    let sql = `-- ==========================================================================\n`;
    sql += `-- SIMPROKAS KALTIM - DATABASE MIGRATION DUMP FOR DISKOMINFO PROV KALTIM\n`;
    sql += `-- Generated: ${timestamp}\n`;
    sql += `-- Target Dialect: ${dialect.toUpperCase()}\n`;
    sql += `-- Standard: SPBE Pemprov Kalimantan Timur / UU No. 23 Tahun 2014\n`;
    sql += `-- ==========================================================================\n\n`;

    if (isPostgres) {
      sql += `CREATE TABLE IF NOT EXISTS wilayah_damkar_kaltim (\n`;
      sql += `    id VARCHAR(50) PRIMARY KEY,\n`;
      sql += `    nama VARCHAR(100) NOT NULL,\n`;
      sql += `    tipe VARCHAR(20) NOT NULL,\n`;
      sql += `    instansi VARCHAR(255) NOT NULL,\n`;
      sql += `    tipe_lembaga VARCHAR(5) DEFAULT 'B',\n`;
      sql += `    ibukota VARCHAR(100),\n`;
      sql += `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
      sql += `);\n\n`;

      sql += `CREATE TABLE IF NOT EXISTS laporan_semester_damkar (\n`;
      sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
      sql += `    region_id VARCHAR(50) REFERENCES wilayah_damkar_kaltim(id),\n`;
      sql += `    tahun INT NOT NULL,\n`;
      sql += `    periode VARCHAR(20) NOT NULL,\n`;
      sql += `    status VARCHAR(30) NOT NULL DEFAULT 'draft',\n`;
      sql += `    pengisi_nama VARCHAR(150),\n`;
      sql += `    pengisi_nip VARCHAR(50),\n`;
      sql += `    pengisi_jabatan VARCHAR(150),\n`;
      sql += `    pejabat_nama VARCHAR(150),\n`;
      sql += `    pejabat_nip VARCHAR(50),\n`;
      sql += `    pejabat_jabatan VARCHAR(150),\n`;
      sql += `    total_pns INT DEFAULT 0,\n`;
      sql += `    total_pppk INT DEFAULT 0,\n`;
      sql += `    total_non_asn INT DEFAULT 0,\n`;
      sql += `    total_mobil_damkar INT DEFAULT 0,\n`;
      sql += `    total_mobil_tangki INT DEFAULT 0,\n`;
      sql += `    total_mobil_tangga INT DEFAULT 0,\n`;
      sql += `    total_relawan INT DEFAULT 0,\n`;
      sql += `    kejadian_kebakaran INT DEFAULT 0,\n`;
      sql += `    response_time_15m INT DEFAULT 0,\n`;
      sql += `    operasi_penyelamatan INT DEFAULT 0,\n`;
      sql += `    jiwa_diselamatkan INT DEFAULT 0,\n`;
      sql += `    korban_meninggal INT DEFAULT 0,\n`;
      sql += `    aset_diselamatkan_rp BIGINT DEFAULT 0,\n`;
      sql += `    kerugian_aset_rp BIGINT DEFAULT 0,\n`;
      sql += `    total_inspeksi INT DEFAULT 0,\n`;
      sql += `    payload_json JSONB,\n`;
      sql += `    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
      sql += `);\n\n`;
    } else {
      sql += `CREATE TABLE IF NOT EXISTS wilayah_damkar_kaltim (\n`;
      sql += `    id VARCHAR(50) PRIMARY KEY,\n`;
      sql += `    nama VARCHAR(100) NOT NULL,\n`;
      sql += `    tipe VARCHAR(20) NOT NULL,\n`;
      sql += `    instansi VARCHAR(255) NOT NULL,\n`;
      sql += `    tipe_lembaga VARCHAR(5) DEFAULT 'B',\n`;
      sql += `    ibukota VARCHAR(100),\n`;
      sql += `    created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n`;
      sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

      sql += `CREATE TABLE IF NOT EXISTS laporan_semester_damkar (\n`;
      sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
      sql += `    region_id VARCHAR(50) NOT NULL,\n`;
      sql += `    tahun INT NOT NULL,\n`;
      sql += `    periode VARCHAR(20) NOT NULL,\n`;
      sql += `    status VARCHAR(30) NOT NULL DEFAULT 'draft',\n`;
      sql += `    pengisi_nama VARCHAR(150),\n`;
      sql += `    pengisi_nip VARCHAR(50),\n`;
      sql += `    pengisi_jabatan VARCHAR(150),\n`;
      sql += `    pejabat_nama VARCHAR(150),\n`;
      sql += `    pejabat_nip VARCHAR(50),\n`;
      sql += `    pejabat_jabatan VARCHAR(150),\n`;
      sql += `    total_pns INT DEFAULT 0,\n`;
      sql += `    total_pppk INT DEFAULT 0,\n`;
      sql += `    total_non_asn INT DEFAULT 0,\n`;
      sql += `    total_mobil_damkar INT DEFAULT 0,\n`;
      sql += `    total_mobil_tangki INT DEFAULT 0,\n`;
      sql += `    total_mobil_tangga INT DEFAULT 0,\n`;
      sql += `    total_relawan INT DEFAULT 0,\n`;
      sql += `    kejadian_kebakaran INT DEFAULT 0,\n`;
      sql += `    response_time_15m INT DEFAULT 0,\n`;
      sql += `    operasi_penyelamatan INT DEFAULT 0,\n`;
      sql += `    jiwa_diselamatkan INT DEFAULT 0,\n`;
      sql += `    korban_meninggal INT DEFAULT 0,\n`;
      sql += `    aset_diselamatkan_rp BIGINT DEFAULT 0,\n`;
      sql += `    kerugian_aset_rp BIGINT DEFAULT 0,\n`;
      sql += `    total_inspeksi INT DEFAULT 0,\n`;
      sql += `    payload_json JSON,\n`;
      sql += `    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
      sql += `    FOREIGN KEY (region_id) REFERENCES wilayah_damkar_kaltim(id)\n`;
      sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;
    }

    // Insert Regions
    sql += `-- SEED 10 WILAYAH KABUPATEN/KOTA KALTIM\n`;
    REGIONS_KALTIM.forEach(r => {
      const escape = (s: string) => s.replace(/'/g, "''");
      sql += `INSERT INTO wilayah_damkar_kaltim (id, nama, tipe, instansi, tipe_lembaga, ibukota) VALUES ('${r.id}', '${escape(r.name)}', '${r.type}', '${escape(r.instansiName)}', '${r.tipeDefault}', '${r.ibukota}') ON CONFLICT (id) DO NOTHING;\n`;
    });
    sql += `\n-- SEED DATA LAPORAN\n`;

    reports.forEach(r => {
      const escape = (s?: string) => (s || '').replace(/'/g, "''");
      const jsonString = JSON.stringify(r).replace(/'/g, "''");
      const inspeksiTotal = (r.bagianH.bangunanRendahDiinspeksi || 0) + (r.bagianH.bangunanMenengahDiinspeksi || 0) + (r.bagianH.bangunanTinggiDiinspeksi || 0);

      sql += `INSERT INTO laporan_semester_damkar (id, region_id, tahun, periode, status, pengisi_nama, pengisi_nip, pengisi_jabatan, pejabat_nama, pejabat_nip, pejabat_jabatan, total_pns, total_pppk, total_non_asn, total_mobil_damkar, total_mobil_tangki, total_mobil_tangga, total_relawan, kejadian_kebakaran, response_time_15m, operasi_penyelamatan, jiwa_diselamatkan, korban_meninggal, aset_diselamatkan_rp, kerugian_aset_rp, total_inspeksi, payload_json) VALUES (\n`;
      sql += `  '${r.id}', '${r.regionId}', ${r.year}, '${r.period}', '${r.status}',\n`;
      sql += `  '${escape(r.pengisi.nama)}', '${escape(r.pengisi.nip)}', '${escape(r.pengisi.jabatan)}',\n`;
      sql += `  '${escape(r.pejabat.nama)}', '${escape(r.pejabat.nip)}', '${escape(r.pejabat.jabatan)}',\n`;
      sql += `  ${r.bagianB.totalPns}, ${r.bagianB.totalPppk}, ${r.bagianB.nonAsn},\n`;
      sql += `  ${r.bagianC.mobilDamkar}, ${r.bagianC.mobilTangki}, ${r.bagianC.mobilTangga},\n`;
      sql += `  ${r.bagianD.jumlahRelawan}, ${r.bagianE.totalKejadian}, ${r.bagianE.response15Menit},\n`;
      sql += `  ${r.bagianF.totalOperasi}, ${r.bagianG.jiwaSelamat}, ${r.bagianG.korbanMeninggal},\n`;
      sql += `  ${r.bagianG.taksiranAsetSelamat}, ${r.bagianG.taksiranKerugian}, ${inspeksiTotal},\n`;
      sql += `  '${jsonString}'\n`;
      sql += `);\n\n`;
    });

    return sql;
  }

  public exportJSONBackup(): string {
    const payload = {
      meta: {
        app: 'SIMPROKAS KALTIM',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        regulations: 'UU No. 23/2014 & Surat Edaran Sekda Kaltim No. 300.1/3326/SATPOL.PP-IV'
      },
      reports: this.getAllReports(),
      auditLogs: this.auditLogs
    };
    return JSON.stringify(payload, null, 2);
  }

  public importJSONBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.reports || !Array.isArray(data.reports)) {
        return { success: false, message: 'Format file backup tidak valid.' };
      }
      this.reportsCache.clear();
      data.reports.forEach((r: DamkarReport) => this.reportsCache.set(r.id, r));
      if (data.auditLogs && Array.isArray(data.auditLogs)) {
        this.auditLogs = data.auditLogs;
      }
      this.persistImmediate();
      this.persistAuditImmediate();
      this.notify();
      return { success: true, message: `Berhasil memulihkan ${data.reports.length} data laporan wilayah.` };
    } catch (e: any) {
      return { success: false, message: 'Gagal membaca file JSON: ' + e.message };
    }
  }

  public resetToBimtekDemo(): void {
    this.reportsCache.clear();
    INITIAL_REPORTS.forEach(r => this.reportsCache.set(r.id, r));
    this.auditLogs = [
      {
        id: 'reset-' + Date.now(),
        timestamp: new Date().toISOString(),
        user: 'Instruktur Bimtek',
        action: 'Reset Data Simulasi',
        details: 'Data disetel ulang ke skenario Bimtek Provinsi Kaltim 2026.'
      }
    ];
    this.persistImmediate();
    this.persistAuditImmediate();
    this.notify();
  }

  public exportToCSV(period: ReportPeriod = 'SEMESTER_1', year = 2026): string {
    const reports = REGIONS_KALTIM.map(reg => {
      const r = this.getReport(reg.id, period, year);
      return {
        wilayah: reg.name,
        instansi: r.bagianA.namaInstansi,
        tipe: r.bagianA.tipeKelembagaan,
        status: r.status,
        mako: r.bagianA.jumlahMako,
        pos: (r.bagianA.jumlahPosSektor || 0) + (r.bagianA.jumlahPos || 0),
        pns: r.bagianB.totalPns,
        pppk: r.bagianB.totalPppk,
        nonAsn: r.bagianB.nonAsn,
        mobilDamkar: r.bagianC.mobilDamkar,
        mobilTangki: r.bagianC.mobilTangki,
        mobilTangga: r.bagianC.mobilTangga,
        relawan: r.bagianD.jumlahRelawan,
        kebakaran: r.bagianE.totalKejadian,
        response15m: r.bagianE.response15Menit,
        rescue: r.bagianF.totalOperasi,
        jiwaSelamat: r.bagianG.jiwaSelamat,
        asetSelamatRp: r.bagianG.taksiranAsetSelamat,
        kerugianRp: r.bagianG.taksiranKerugian
      };
    });

    const headers = [
      'Kabupaten/Kota', 'Nama Instansi', 'Tipe Kelembagaan', 'Status Laporan',
      'Jumlah Mako', 'Jumlah Pos Sektor & Pos', 'Total PNS', 'Total PPPK', 'Non-ASN Damkar',
      'Mobil Damkar', 'Mobil Tangki', 'Mobil Tangga', 'Relawan Damkar',
      'Kejadian Kebakaran', 'Response 15 Menit', 'Operasi Rescue',
      'Jiwa Diselamatkan', 'Taksiran Aset Selamat (Rp)', 'Taksiran Kerugian (Rp)'
    ];

    let csv = headers.join(',') + '\n';
    reports.forEach(row => {
      csv += [
        `"${row.wilayah}"`,
        `"${row.instansi}"`,
        `"${row.tipe}"`,
        `"${row.status}"`,
        row.mako,
        row.pos,
        row.pns,
        row.pppk,
        row.nonAsn,
        row.mobilDamkar,
        row.mobilTangki,
        row.mobilTangga,
        row.relawan,
        row.kebakaran,
        row.response15m,
        row.rescue,
        row.jiwaSelamat,
        row.asetSelamatRp,
        row.kerugianRp
      ].join(',') + '\n';
    });

    return csv;
  }
}

export const storageService = new StorageService();

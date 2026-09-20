import { DamkarReport, ReportPeriod, ReportStatus, SyncState } from '../types';
import { INITIAL_REPORTS } from '../data/seedData';
import { REGIONS_KALTIM } from '../data/regions';
import { db, validateFirestoreConnection } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, writeBatch } from 'firebase/firestore';

const STORAGE_KEY_REPORTS = 'simprokas_kaltim_reports_clean_v1';
const STORAGE_KEY_AUDIT = 'simprokas_kaltim_audit_clean_v1';

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
      // Clear legacy storage keys with dummy data
      localStorage.removeItem('simprokas_kaltim_reports_v2');
      localStorage.removeItem('simprokas_kaltim_reports');

      const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (stored) {
        const parsed: DamkarReport[] = JSON.parse(stored);
        // If data contains legacy dummy filler, discard it
        const hasLegacyDummy = parsed.some(r => r.pengisi?.nama === 'Ahmad Faisal, S.AP.' || (r.bagianE && r.bagianE.totalKejadian > 0 && r.pengisi?.nama?.length > 0));
        if (hasLegacyDummy) {
          this.reportsCache.clear();
          INITIAL_REPORTS.forEach(r => this.reportsCache.set(r.id, JSON.parse(JSON.stringify(r))));
          this.persistImmediate();
        } else {
          parsed.forEach(r => this.reportsCache.set(r.id, r));
          let hasNew = false;
          INITIAL_REPORTS.forEach(r => {
            if (!this.reportsCache.has(r.id)) {
              this.reportsCache.set(r.id, JSON.parse(JSON.stringify(r)));
              hasNew = true;
            }
          });
          if (hasNew) {
            this.persistImmediate();
          }
        }
      } else {
        // Seed blank 10 regions
        INITIAL_REPORTS.forEach(r => this.reportsCache.set(r.id, JSON.parse(JSON.stringify(r))));
        this.persistImmediate();
      }

      const storedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      } else {
        this.auditLogs = [
          {
            id: 'init-1',
            timestamp: new Date().toISOString(),
            user: 'Sistem SIMPROKAS',
            action: 'Inisialisasi Database',
            details: 'Database 10 Kabupaten/Kota se-Kalimantan Timur berhasil disiapkan sesuai Surat Edaran No. 300.1/3326/SATPOL.PP-IV.'
          }
        ];
        this.persistAuditImmediate();
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
      await validateFirestoreConnection();

      // Listen to real-time updates from Cloud Firestore
      onSnapshot(collection(db, 'reports'), (snapshot) => {
        if (!snapshot.empty) {
          snapshot.docChanges().forEach(change => {
            const data = change.doc.data() as DamkarReport;
            if (data && data.id) {
              this.reportsCache.set(data.id, data);
            }
          });
          this.setSyncState('synced', 0);
          this.notify();
        } else {
          // If empty in cloud, seed baseline reports
          this.seedFirestoreBatch();
        }
      }, (err) => {
        console.warn('Firestore real-time listener notice (using local cache):', err.message);
      });
    } catch (e) {
      console.warn('Firestore initial sync notice:', e);
    }
  }

  private async seedFirestoreBatch() {
    try {
      const batch = writeBatch(db);
      INITIAL_REPORTS.forEach(r => {
        const ref = doc(db, 'reports', r.id);
        batch.set(ref, r);
      });
      await batch.commit();
      console.log('Seeded initial 10 regions reports to Cloud Firestore successfully.');
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

  public forceSync(): void {
    this.persistImmediate();
    this.notify();
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
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(list));
      this.setSyncState('synced', 0);
    } catch (err) {
      console.error('Persist error:', err);
      this.setSyncState('offline', 0);
    }
  }

  private persistAuditImmediate() {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs.slice(0, 100)));
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

    // Check if initial seed has this report
    const defaultSeed = INITIAL_REPORTS.find(r => r.id === id);
    if (defaultSeed) {
      const cloned = JSON.parse(JSON.stringify(defaultSeed));
      this.reportsCache.set(id, cloned);
      this.persistImmediate();
      return cloned;
    }

    // Build default blank report structure if not existing
    const region = REGIONS_KALTIM.find(r => r.id === regionId) || REGIONS_KALTIM[0];
    const newReport: DamkarReport = {
      id,
      regionId,
      year,
      period,
      status: 'draft',
      pengisi: {
        nama: '',
        nip: '',
        jabatan: '',
        noHp: ''
      },
      pejabat: {
        nama: region.kadisDefault.nama,
        nip: region.kadisDefault.nip,
        jabatan: region.kadisDefault.jabatan
      },
      bagianA: {
        namaInstansi: region.instansiName,
        bentukKelembagaan: region.instansiType,
        tipeKelembagaan: region.tipeDefault,
        jumlahMako: 1,
        jumlahPosSektor: 2,
        jumlahPos: 3
      },
      bagianB: {
        pnsStruktural: 0,
        pnsFungsional: 0,
        pnsPelaksana: 0,
        totalPns: 0,
        pppk: 0,
        pppkParuhWaktu: 0,
        totalPppk: 0,
        nonAsn: 0,
        sertifikasi: {
          instruktur: 0,
          inspektur: 0,
          mfr: 0,
          rescue: 0
        }
      },
      bagianC: {
        mobilDamkar: 0,
        mobilTangki: 0,
        mobilTangga: 0,
        mobilRescue: 0,
        kendaraanLainnya: 0
      },
      bagianD: {
        jumlahRelawan: 0,
        jumlahDesaKelurahan: 0
      },
      bagianE: {
        response15Menit: 0,
        sebabGasKompor: 0,
        sebabListrik: 0,
        sebabBahanBakar: 0,
        sebabKelalaian: 0,
        sebabLainnya: 0,
        totalKejadian: 0
      },
      bagianF: {
        kecelakaanTransportasi: 0,
        waterRescue: 0,
        animalRescue: 0,
        ketinggian: 0,
        bangunanRuntuh: 0,
        pohonTumbang: 0,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 0,
        operasiLainnya: 0,
        totalOperasi: 0
      },
      bagianG: {
        jiwaSelamat: 0,
        korbanMeninggal: 0,
        korbanLukaBakar: 0,
        korbanLukaFisikLainnya: 0,
        taksiranAsetSelamat: 0,
        taksiranKerugian: 0
      },
      bagianH: {
        bangunanRendah: 0,
        bangunanRendahDiinspeksi: 0,
        bangunanMenengah: 0,
        bangunanMenengahDiinspeksi: 0,
        bangunanTinggi: 0,
        bangunanTinggiDiinspeksi: 0
      },
      lastUpdated: new Date().toISOString()
    };

    this.reportsCache.set(id, newReport);
    this.schedulePersist();
    return newReport;
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
    this.schedulePersist();
    this.notify();

    // Persist to Cloud Firestore in real time
    try {
      setDoc(doc(db, 'reports', report.id), report, { merge: true }).catch(err => {
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
    this.schedulePersist();
    this.notify();

    // Persist status change to Cloud Firestore
    try {
      const payload: any = {
        status,
        lastUpdated: report.lastUpdated
      };
      if (report.submittedAt) payload.submittedAt = report.submittedAt;
      if (report.verifiedAt) payload.verifiedAt = report.verifiedAt;
      if (report.verifiedBy) payload.verifiedBy = report.verifiedBy;
      if (report.revisionNotes) payload.revisionNotes = report.revisionNotes;

      setDoc(doc(db, 'reports', reportId), payload, { merge: true }).catch(err => {
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

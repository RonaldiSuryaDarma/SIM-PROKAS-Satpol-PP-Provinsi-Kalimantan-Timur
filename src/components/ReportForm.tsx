import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Send, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Users, 
  Truck, 
  Flame, 
  LifeBuoy, 
  ShieldCheck, 
  Eye, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DamkarReport, ReportPeriod, UserRole, UserSession } from '../types';
import { REGIONS_KALTIM } from '../data/regions';
import { storageService } from '../services/storageService';

interface ReportFormProps {
  regionId: string;
  period: ReportPeriod;
  userRole: UserRole;
  userSession?: UserSession;
  onGoToPdf: () => void;
  onSelectRegion?: (regionId: string) => void;
  onSelectPeriod?: (period: ReportPeriod) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  regionId,
  period,
  userRole,
  userSession,
  onGoToPdf,
  onSelectRegion,
  onSelectPeriod
}) => {
  const [report, setReport] = useState<DamkarReport>(() => 
    storageService.getReport(regionId, period, 2026)
  );
  const [activeSection, setActiveSection] = useState<'all' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'>('all');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState('');
  const [actionFeedbackMsg, setActionFeedbackMsg] = useState<string | null>(null);

  // Sync state if region or period changes or if updated remotely via Firestore
  useEffect(() => {
    const current = storageService.getReport(regionId, period, 2026);
    setReport({ ...current });

    const unsub = storageService.subscribe(() => {
      const refreshed = storageService.getReport(regionId, period, 2026);
      setReport({ ...refreshed });
    });
    return () => unsub();
  }, [regionId, period]);

  const regionInfo = REGIONS_KALTIM.find(r => r.id === regionId) || REGIONS_KALTIM[0];

  const handleFieldChange = (section: string, field: string, value: any, subfield?: string) => {
    setReport(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (subfield) {
        (updated as any)[section][field][subfield] = value;
      } else if (section) {
        (updated as any)[section][field] = value;
      } else {
        (updated as any)[field] = value;
      }

      // Auto-trigger storage save (debounced internally)
      storageService.saveReport(updated, `${userRole} - ${regionInfo.name}`);
      return updated;
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleManualSave = () => {
    storageService.saveReport(report, `${userRole} - ${regionInfo.name}`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSubmitReport = () => {
    storageService.saveReport(report, `${userRole} - ${regionInfo.name}`);
    storageService.updateReportStatus(
      report.id, 
      'submitted', 
      undefined, 
      undefined, 
      userSession?.userName || report.pengisi.nama || 'Operator ' + regionInfo.name
    );
    const refreshed = storageService.getReport(regionId, period, 2026);
    setReport({ ...refreshed });
    setSubmitModalOpen(false);
    setActionFeedbackMsg(`✅ Laporan ${regionInfo.name} BERHASIL DIKIRIM ke Satpol PP Provinsi Kaltim! Data realtime tercatat dan status langsung DIAJUKAN.`);
    setTimeout(() => setActionFeedbackMsg(null), 7000);
  };

  const handleVerifyReport = () => {
    const verifierName = userSession?.userName || 'Satpol PP Prov. Kaltim';
    storageService.updateReportStatus(
      report.id,
      'verified',
      undefined,
      verifierName,
      verifierName
    );
    const refreshed = storageService.getReport(regionId, period, 2026);
    setReport({ ...refreshed });
    setActionFeedbackMsg(`✅ Laporan ${regionInfo.name} BERHASIL DIVERIFIKASI SAH! Data realtime telah resmi masuk ke dalam rekapitulasi provinsi dan dashboard operasional.`);
    setTimeout(() => setActionFeedbackMsg(null), 7000);
  };

  const handleRequestRevision = () => {
    if (!revisionNotesInput.trim()) return;
    const verifierName = userSession?.userName || 'Satpol PP Prov. Kaltim';
    storageService.updateReportStatus(
      report.id,
      'revision_needed',
      revisionNotesInput.trim(),
      verifierName,
      verifierName
    );
    const refreshed = storageService.getReport(regionId, period, 2026);
    setReport({ ...refreshed });
    setRevisionModalOpen(false);
    setRevisionNotesInput('');
  };

  // Calculate completeness
  const calculateCompleteness = () => {
    let fields = 0;
    let filled = 0;

    const check = (val: any) => {
      fields++;
      if (val !== undefined && val !== null && val !== '') filled++;
    };

    check(report.pengisi.nama);
    check(report.pengisi.nip);
    check(report.pengisi.jabatan);
    check(report.pejabat.nama);
    check(report.pejabat.nip);
    check(report.pejabat.jabatan);
    check(report.bagianA.namaInstansi);
    check(report.bagianA.bentukKelembagaan);
    check(report.bagianA.tipeKelembagaan);
    check(report.bagianA.jumlahMako);
    check(report.bagianB.totalPns);
    check(report.bagianC.mobilDamkar);
    check(report.bagianD.jumlahRelawan);
    check(report.bagianE.totalKejadian);
    check(report.bagianF.totalOperasi);
    check(report.bagianG.taksiranKerugian);

    return Math.round((filled / fields) * 100);
  };

  const completeness = calculateCompleteness();

  return (
    <div className="space-y-6 pb-16 report-form-container text-slate-900">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-600 uppercase bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Format Resmi Lampiran {period === 'SEMESTER_1' ? 'II' : 'III'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Surat No. 300.1/3326/SATPOL.PP-IV
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Formulir Laporan Damkar: {regionInfo.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Periode {period === 'SEMESTER_1' ? 'Semester I (Januari s.d Juni 2026)' : 'Semester II (Januari s.d Desember 2026 - Akumulasi)'}
            </p>

            {userRole === 'admin_provinsi' && onSelectRegion && (
              <div className="mt-3 flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  Pilih Wilayah (Super Admin):
                </span>
                <select
                  value={regionId}
                  onChange={(e) => onSelectRegion(e.target.value)}
                  className="text-xs font-bold bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  {REGIONS_KALTIM.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                {onSelectPeriod && (
                  <div className="flex items-center gap-1 sm:ml-auto">
                    <button
                      type="button"
                      onClick={() => onSelectPeriod('SEMESTER_1')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                        period === 'SEMESTER_1'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Sem. I (Lamp. II)
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectPeriod('SEMESTER_2')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                        period === 'SEMESTER_2'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Sem. II (Lamp. III)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold animate-pulse">
                <Check className="w-4 h-4" />
                Data Tersimpan Otomatis
              </span>
            )}

            <button
              type="button"
              onClick={handleManualSave}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              <Save className="w-4 h-4 text-slate-600" />
              Simpan Data
            </button>

            {userRole === 'admin_provinsi' && onGoToPdf && (
              <button
                type="button"
                onClick={onGoToPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
              >
                <Printer className="w-4 h-4" />
                Pratinjau Cetak PDF
              </button>
            )}

            {/* Role: Admin Provinsi Controls */}
            {userRole === 'admin_provinsi' && (
              <>
                {report.status !== 'verified' ? (
                  <button
                    type="button"
                    onClick={handleVerifyReport}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verifikasi & Sahkan Laporan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevisionModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Batalkan Pengesahan / Revisi
                  </button>
                )}

                {report.status === 'submitted' && (
                  <button
                    type="button"
                    onClick={() => setRevisionModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Kembalikan untuk Revisi
                  </button>
                )}
              </>
            )}

            {/* Role: Operator Kab/Kota Controls */}
            {userRole === 'operator_kabkota' && report.status !== 'verified' && (
              <button
                type="button"
                onClick={() => setSubmitModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                {report.status === 'submitted' ? 'Kirim Ulang Laporan' : 'Ajukan ke Satpol PP Prov'}
              </button>
            )}
          </div>
        </div>

        {/* Realtime Feedback Banner */}
        {actionFeedbackMsg && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex items-start gap-3 shadow-md animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-950 font-bold">
              {actionFeedbackMsg}
            </div>
          </div>
        )}

        {/* Status Alert Banner */}
        {report.status === 'verified' && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <span className="font-bold">Laporan Telah Diverifikasi Sah oleh Satpol PP Provinsi Kaltim.</span>
              <p className="text-emerald-700 mt-0.5">
                Dokumen telah disahkan untuk penyusunan Profil Kebakaran dan Penyelamatan Provinsi Kaltim Tahun 2026.
              </p>
            </div>
          </div>
        )}

        {report.status === 'revision_needed' && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900">
              <span className="font-bold">Catatan Perbaikan dari Satpol PP Provinsi Kaltim:</span>
              <p className="text-rose-700 mt-0.5 font-medium">
                "{report.revisionNotes || 'Mohon periksa kembali isian form Anda.'}"
              </p>
            </div>
          </div>
        )}

        {/* PANEL KONTROL VERIFIKASI & CATATAN REVISI LAPORAN (Khusus Admin Provinsi) */}
        {userRole === 'admin_provinsi' && (
          <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border-2 border-amber-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                      Otoritas Verifikasi Satpol PP Prov. Kaltim
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      SE No. 300.1/3326/SATPOL.PP-IV
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                    Panel Verifikasi & Catatan Revisi Laporan {regionInfo.name}
                  </h3>
                </div>
              </div>

              {/* Status Badge in Panel */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status Saat Ini:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                  report.status === 'verified'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : report.status === 'revision_needed'
                    ? 'bg-rose-500 text-white animate-pulse'
                    : report.status === 'submitted'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {report.status === 'verified' && '✓ TELAH DISAHKAN'}
                  {report.status === 'revision_needed' && '⚠ PERLU REVISI'}
                  {report.status === 'submitted' && '✉ TELAH DIAJUKAN'}
                  {report.status === 'draft' && 'DRAFT DAERAH'}
                </span>
              </div>
            </div>

            {/* Verification Metadata & Detail Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block mb-0.5">Pengisi / Kontak Daerah</span>
                <span className="font-bold text-white block truncate">{report.pengisi?.nama || 'Belum Diisi'}</span>
                <span className="text-slate-400 text-[11px] block truncate">{report.pengisi?.noHp || report.pengisi?.jabatan || '-'}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block mb-0.5">Waktu Pengajuan / Update</span>
                <span className="font-bold text-slate-300 block">
                  {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Belum Diajukan'}
                </span>
                <span className="text-slate-400 text-[11px]">Tingkat Kelengkapan: {completeness}%</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block mb-0.5">Penanggung Jawab Validasi</span>
                <span className="font-bold text-amber-300 block">Tim Satpol PP Prov. Kaltim</span>
                <span className="text-slate-400 text-[11px]">Inisiator: Ronaldi Surya Darma</span>
              </div>
            </div>

            {/* Display Active Revision Notes if any */}
            {report.status === 'revision_needed' && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-1">
                <div className="flex items-center justify-between text-rose-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    Catatan Revisi yang Sedang Berlaku:
                  </span>
                  {report.verifiedAt && (
                    <span className="text-[10px] text-slate-400">
                      Dikirim: {new Date(report.verifiedAt).toLocaleDateString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
                <p className="text-rose-200 pl-5 font-mono text-[11px] leading-relaxed">
                  "{report.revisionNotes || 'Harap periksa dan lengkapi bagian yang belum sesuai.'}"
                </p>
              </div>
            )}

            {/* Verification & Revision Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-400 italic">
                *Tindakan pengesahan atau pengembalian revisi akan tersimpan langsung ke riwayat audit resmi.
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Tombol Catatan Revisi */}
                <button
                  type="button"
                  onClick={() => {
                    setRevisionNotesInput(report.revisionNotes || '');
                    setRevisionModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{report.status === 'revision_needed' ? 'Ubah Catatan Revisi' : 'Kembalikan untuk Revisi'}</span>
                </button>

                {/* Tombol Verifikasi & Sahkan */}
                {report.status !== 'verified' ? (
                  <button
                    type="button"
                    onClick={handleVerifyReport}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi & Sahkan Laporan Ini</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Batalkan pengesahan laporan ini dan kembalikan ke status belum disahkan?')) {
                        handleRequestRevision();
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Batalkan Pengesahan (Buka Kunci)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar Completeness */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="w-full">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Kelengkapan Instrumen Pelaporan</span>
              <span className="font-bold text-slate-800">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  completeness >= 80 ? 'bg-emerald-500' : completeness >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sections Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        {[
          { id: 'all', label: 'Tampilkan Semua Bagian' },
          { id: 'A', label: 'A. Kelembagaan & Pos' },
          { id: 'B', label: 'B. Sumber Daya Manusia (SDM)' },
          { id: 'C', label: 'C. Sarana Prasarana' },
          { id: 'D', label: 'D. Relawan Damkar' },
          { id: 'E', label: 'E. Laporan Kebakaran' },
          { id: 'F', label: 'F. Operasi Penyelamatan' },
          { id: 'G', label: 'G. Korban & Kerugian' },
          { id: 'H', label: 'H. Inspeksi Bangunan' }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeSection === item.id
                ? 'bg-slate-900 text-white font-bold shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Form Content: Identitas Pengisi & Kadis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box: Data Yang Mengisi */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span>Data Petugas Yang Mengisi</span>
            </h2>
            <p className="text-[11px] text-slate-400">Petugas teknis/operator penanggung jawab data</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap Petugas</label>
              <input
                type="text"
                value={report.pengisi.nama}
                onChange={(e) => handleFieldChange('pengisi', 'nama', e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">NIP Petugas</label>
              <input
                type="text"
                value={report.pengisi.nip}
                onChange={(e) => handleFieldChange('pengisi', 'nip', e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Jabatan</label>
                <input
                  type="text"
                  value={report.pengisi.jabatan}
                  onChange={(e) => handleFieldChange('pengisi', 'jabatan', e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  value={report.pengisi.noHp || ''}
                  onChange={(e) => handleFieldChange('pengisi', 'noHp', e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Box: Data Kadis / Kasat / Kalak */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Kadis / Kasat / Kalak (Lengkap Dengan Gelar)</span>
            </h2>
            <p className="text-[11px] text-slate-400">Pejabat berwenang yang mengesahkan laporan</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap Beserta Gelar</label>
              <input
                type="text"
                value={report.pejabat.nama}
                onChange={(e) => handleFieldChange('pejabat', 'nama', e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">NIP Pejabat</label>
              <input
                type="text"
                value={report.pejabat.nip}
                onChange={(e) => handleFieldChange('pejabat', 'nip', e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Jabatan Definitif</label>
              <input
                type="text"
                value={report.pejabat.jabatan}
                onChange={(e) => handleFieldChange('pejabat', 'jabatan', e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Bagian A: Kelembagaan & Data Pos */}
      {(activeSection === 'all' || activeSection === 'A') && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">A</span>
            <div>
              <h2 className="font-bold text-base text-slate-900">Data Kapasitas Kelembagaan Penanggulangan Kebakaran dan Data Pos</h2>
              <p className="text-xs text-slate-500">Kapasitas struktur organisasi dan jaringan pos operasional</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">Nama Instansi Perangkat Daerah</label>
              <input
                type="text"
                value={report.bagianA.namaInstansi}
                onChange={(e) => handleFieldChange('bagianA', 'namaInstansi', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Bentuk Kelembagaan (Pilih Salah Satu)</label>
              <select
                value={report.bagianA.bentukKelembagaan}
                onChange={(e) => handleFieldChange('bagianA', 'bentukKelembagaan', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
              >
                <option value="Dinas Pemadam Kebakaran dan Penyelamatan">Dinas Pemadam Kebakaran dan Penyelamatan</option>
                <option value="Dinas Pemadam Kebakaran">Dinas Pemadam Kebakaran</option>
                <option value="Satuan Polisi Pamong Praja">Satuan Polisi Pamong Praja</option>
                <option value="Badan Penanggulangan Bencana Daerah">Badan Penanggulangan Bencana Daerah</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Tipe Kelembagaan</label>
              <div className="flex items-center gap-4 pt-1">
                {(['A', 'B', 'C'] as const).map(tipe => (
                  <label key={tipe} className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="tipeKelembagaan"
                      value={tipe}
                      checked={report.bagianA.tipeKelembagaan === tipe}
                      onChange={() => handleFieldChange('bagianA', 'tipeKelembagaan', tipe)}
                      className="text-amber-500 focus:ring-amber-400 w-4 h-4"
                    />
                    <span>Tipe {tipe}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Jumlah Mako (Markas Komando)</label>
              <input
                type="number"
                min="0"
                value={report.bagianA.jumlahMako}
                onChange={(e) => handleFieldChange('bagianA', 'jumlahMako', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Jumlah Pos Sektor</label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianA.jumlahPosSektor}
                  onChange={(e) => handleFieldChange('bagianA', 'jumlahPosSektor', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Jumlah Pos</label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianA.jumlahPos}
                  onChange={(e) => handleFieldChange('bagianA', 'jumlahPos', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bagian B: Sumber Daya Manusia (SDM) */}
      {(activeSection === 'all' || activeSection === 'B') && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">B</span>
            <div>
              <h2 className="font-bold text-base text-slate-900">Data Sumber Daya Manusia (SDM)</h2>
              <p className="text-xs text-slate-500">Komposisi ASN, PPPK, Non-ASN, serta sertifikasi diklat lanjutan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Kolom Kiri: PNS & PPPK */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                <div className="flex justify-between items-center font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                  <span>Pegawai Negeri Sipil (PNS)</span>
                  <span className="text-amber-600">Total: {report.bagianB.totalPns} Orang</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Struktural</label>
                    <input
                      type="number"
                      min="0"
                      value={report.bagianB.pnsStruktural}
                      onChange={(e) => handleFieldChange('bagianB', 'pnsStruktural', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Fungsional</label>
                    <input
                      type="number"
                      min="0"
                      value={report.bagianB.pnsFungsional}
                      onChange={(e) => handleFieldChange('bagianB', 'pnsFungsional', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Pelaksana</label>
                    <input
                      type="number"
                      min="0"
                      value={report.bagianB.pnsPelaksana}
                      onChange={(e) => handleFieldChange('bagianB', 'pnsPelaksana', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                <div className="flex justify-between items-center font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                  <span>Pegawai Pemerintah dengan Perjanjian Kerja (PPPK)</span>
                  <span className="text-amber-600">Total: {report.bagianB.totalPppk} Orang</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Jumlah PPPK Penuh Waktu</label>
                    <input
                      type="number"
                      min="0"
                      value={report.bagianB.pppk}
                      onChange={(e) => handleFieldChange('bagianB', 'pppk', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Jumlah PPPK Paruh Waktu</label>
                    <input
                      type="number"
                      min="0"
                      value={report.bagianB.pppkParuhWaktu}
                      onChange={(e) => handleFieldChange('bagianB', 'pppkParuhWaktu', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Jumlah Aparatur Damkar Non-ASN (Bukan PNS atau PPPK)
                </label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianB.nonAsn}
                  onChange={(e) => handleFieldChange('bagianB', 'nonAsn', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Kolom Kanan: Sertifikasi Diklat Lanjutan */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                Sertifikasi / Sertifikat Diklat Lanjutan Damkar
              </div>
              <p className="text-[11px] text-slate-500">Jumlah personel yang memiliki sertifikat keahlian resmi</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-slate-600 font-medium">1. Instruktur</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianB.sertifikasi.instruktur}
                    onChange={(e) => handleFieldChange('bagianB', 'sertifikasi', Number(e.target.value), 'instruktur')}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium text-right focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-slate-600 font-medium">2. Inspektur</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianB.sertifikasi.inspektur}
                    onChange={(e) => handleFieldChange('bagianB', 'sertifikasi', Number(e.target.value), 'inspektur')}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium text-right focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-slate-600 font-medium">3. MFR (Medical First Responder)</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianB.sertifikasi.mfr}
                    onChange={(e) => handleFieldChange('bagianB', 'sertifikasi', Number(e.target.value), 'mfr')}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium text-right focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-slate-600 font-medium">4. Rescue</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianB.sertifikasi.rescue}
                    onChange={(e) => handleFieldChange('bagianB', 'sertifikasi', Number(e.target.value), 'rescue')}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium text-right focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Bagian C: Sarana & Prasarana */}
      {(activeSection === 'all' || activeSection === 'C') && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">C</span>
            <div>
              <h2 className="font-bold text-base text-slate-900">Data Sarana dan Prasarana</h2>
              <p className="text-xs text-slate-500">Kesiapan armada kendaraan pemadam kebakaran dan penyelamatan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Mobil Damkar</label>
              <input
                type="number"
                min="0"
                value={report.bagianC.mobilDamkar}
                onChange={(e) => handleFieldChange('bagianC', 'mobilDamkar', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Mobil Tangki</label>
              <input
                type="number"
                min="0"
                value={report.bagianC.mobilTangki}
                onChange={(e) => handleFieldChange('bagianC', 'mobilTangki', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Mobil Tangga</label>
              <input
                type="number"
                min="0"
                value={report.bagianC.mobilTangga}
                onChange={(e) => handleFieldChange('bagianC', 'mobilTangga', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Mobil Rescue</label>
              <input
                type="number"
                min="0"
                value={report.bagianC.mobilRescue}
                onChange={(e) => handleFieldChange('bagianC', 'mobilRescue', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Kendaraan Lainnya</label>
              <input
                type="number"
                min="0"
                value={report.bagianC.kendaraanLainnya}
                onChange={(e) => handleFieldChange('bagianC', 'kendaraanLainnya', Number(e.target.value))}
                placeholder="Roda 2, 3, 4"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bagian D: Relawan Penanggulangan Kebakaran */}
      {(activeSection === 'all' || activeSection === 'D') && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">D</span>
            <div>
              <h2 className="font-bold text-base text-slate-900">Data Relawan Penanggulangan Kebakaran (Redkar)</h2>
              <p className="text-xs text-slate-500">Partisipasi masyarakat relawan damkar tingkat desa dan kelurahan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Jumlah Relawan Pemadam Kebakaran</label>
              <input
                type="number"
                min="0"
                value={report.bagianD.jumlahRelawan}
                onChange={(e) => handleFieldChange('bagianD', 'jumlahRelawan', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Jumlah Desa / Kelurahan yang Terjangkau</label>
              <input
                type="number"
                min="0"
                value={report.bagianD.jumlahDesaKelurahan}
                onChange={(e) => handleFieldChange('bagianD', 'jumlahDesaKelurahan', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bagian E: Data Laporan Kebakaran */}
      {(activeSection === 'all' || activeSection === 'E') && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">E</span>
            <div>
              <h2 className="font-bold text-base text-slate-900">Data Laporan Kebakaran</h2>
              <p className="text-xs text-slate-500">Kepatuhan Standar Pelayanan Minimal (SPM) 15 menit dan penyebab kebakaran</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* SPM 15 Menit Indicator */}
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
              <label className="block text-emerald-950 font-bold text-sm">
                Jumlah Penanganan Kebakaran yang Memenuhi Response Time 15 Menit:
              </label>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Standar SPM Sub-Urusan Kebakaran mengharuskan respon tiba di lokasi maksimal 15 menit sejak diterimanya laporan.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={report.bagianE.response15Menit}
                  onChange={(e) => handleFieldChange('bagianE', 'response15Menit', Number(e.target.value))}
                  className="w-32 px-3 py-2 rounded-lg border border-emerald-300 bg-white font-black text-lg text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-xs text-emerald-800">
                  <span>Tingkat Kepatuhan: </span>
                  <span className="font-bold text-emerald-950">
                    {report.bagianE.totalKejadian > 0 
                      ? Math.round((report.bagianE.response15Menit / report.bagianE.totalKejadian) * 100)
                      : 100}%
                  </span>
                </div>
              </div>
            </div>

            {/* Penyebab Kebakaran */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                <span>Penyebab Kejadian Kebakaran</span>
                <span className="text-amber-600">Total: {report.bagianE.totalKejadian} Kejadian</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1">Tabung Gas / Kompor</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianE.sebabGasKompor}
                    onChange={(e) => handleFieldChange('bagianE', 'sebabGasKompor', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Arus Listrik / Korsleting</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianE.sebabListrik}
                    onChange={(e) => handleFieldChange('bagianE', 'sebabListrik', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Cairan Bahan Bakar (BBM)</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianE.sebabBahanBakar}
                    onChange={(e) => handleFieldChange('bagianE', 'sebabBahanBakar', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Kelalaian Manusia</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianE.sebabKelalaian}
                    onChange={(e) => handleFieldChange('bagianE', 'sebabKelalaian', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-600 mb-1">Penyebab Lainnya</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianE.sebabLainnya}
                    onChange={(e) => handleFieldChange('bagianE', 'sebabLainnya', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Bagian F: Operasi Penyelamatan (Rescue) */}
      {(activeSection === 'all' || activeSection === 'F') && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">F</span>
            <div>
              <h2 className="font-bold text-base text-slate-900">Data Penanggulangan Operasi Penyelamatan (Non-Kebakaran)</h2>
              <p className="text-xs text-slate-500">Rincian operasi evakuasi dan penyelamatan kemanusiaan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Kecelakaan Transportasi</label>
              <input
                type="number"
                min="0"
                value={report.bagianF.kecelakaanTransportasi}
                onChange={(e) => handleFieldChange('bagianF', 'kecelakaanTransportasi', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Water Rescue (Air)</label>
              <input
                type="number"
                min="0"
                value={report.bagianF.waterRescue}
                onChange={(e) => handleFieldChange('bagianF', 'waterRescue', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Animal Rescue</label>
              <input
                type="number"
                min="0"
                value={report.bagianF.animalRescue}
                onChange={(e) => handleFieldChange('bagianF', 'animalRescue', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Penyelamatan Ketinggian</label>
              <input
                type="number"
                min="0"
                value={report.bagianF.ketinggian}
                onChange={(e) => handleFieldChange('bagianF', 'ketinggian', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Bangunan Runtuh</label>
              <input
                type="number"
                min="0"
                value={report.bagianF.bangunanRuntuh}
                onChange={(e) => handleFieldChange('bagianF', 'bangunanRuntuh', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Pohon Tumbang</label>
              <input
                type="number"
                min="0"
                value={report.bagianF.pohonTumbang}
                onChange={(e) => handleFieldChange('bagianF', 'pohonTumbang', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Percobaan Bunuh Diri</label>
              <input
                type="number"
                min="0"
                value={report.bagianF.percobaanBunuhDiri}
                onChange={(e) => handleFieldChange('bagianF', 'percobaanBunuhDiri', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Pelepasan Cincin</label>
              <input
                type="number"
                min="0"
                value={report.bagianF.pelepasanCincin}
                onChange={(e) => handleFieldChange('bagianF', 'pelepasanCincin', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-slate-600 font-semibold mb-1">Operasi Lainnya</label>
              <input
                type="number"
                min="0"
                value={report.bagianF.operasiLainnya}
                onChange={(e) => handleFieldChange('bagianF', 'operasiLainnya', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="text-right text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
            Total Seluruh Operasi Penyelamatan: <span className="text-blue-600">{report.bagianF.totalOperasi} Operasi</span>
          </div>
        </div>
      )}

      {/* Bagian G: Korban & Kerugian Materi */}
      {(activeSection === 'all' || activeSection === 'G') && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">G</span>
            <div>
              <h2 className="font-bold text-base text-slate-900">Data Korban Kebakaran dan Kerugian Materi</h2>
              <p className="text-xs text-slate-500">Dampak insiden kebakaran terhadap korban jiwa dan nilai ekonomi aset</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Korban Jiwa */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                Data Korban Jiwa
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-600">Korban Jiwa Yang Berhasil Diselamatkan</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianG.jiwaSelamat}
                    onChange={(e) => handleFieldChange('bagianG', 'jiwaSelamat', Number(e.target.value))}
                    className="w-24 px-2 py-1 rounded border border-slate-200 bg-white font-bold text-emerald-700 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-slate-600">Korban Meninggal Dunia</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianG.korbanMeninggal}
                    onChange={(e) => handleFieldChange('bagianG', 'korbanMeninggal', Number(e.target.value))}
                    className="w-24 px-2 py-1 rounded border border-slate-200 bg-white font-bold text-rose-700 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-slate-600">Korban Luka Bakar</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianG.korbanLukaBakar}
                    onChange={(e) => handleFieldChange('bagianG', 'korbanLukaBakar', Number(e.target.value))}
                    className="w-24 px-2 py-1 rounded border border-slate-200 bg-white text-slate-900 font-medium text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-slate-600">Korban Luka Fisik Lainnya</label>
                  <input
                    type="number"
                    min="0"
                    value={report.bagianG.korbanLukaFisikLainnya}
                    onChange={(e) => handleFieldChange('bagianG', 'korbanLukaFisikLainnya', Number(e.target.value))}
                    className="w-24 px-2 py-1 rounded border border-slate-200 bg-white text-slate-900 font-medium text-right"
                  />
                </div>
              </div>
            </div>

            {/* Taksiran Nilai Rupiah */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                Taksiran Nilai Ekonomi Aset (Rupiah)
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Jumlah Taksiran Aset Yang Berhasil Diselamatkan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianG.taksiranAsetSelamat}
                  onChange={(e) => handleFieldChange('bagianG', 'taksiranAsetSelamat', Number(e.target.value))}
                  placeholder="Contoh: 42500000000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-emerald-800 font-bold focus:ring-2 focus:ring-emerald-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Format angka penuh tanpa titik. Terbilang: Rp {report.bagianG.taksiranAsetSelamat.toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Jumlah Taksiran Kerugian Aset (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianG.taksiranKerugian}
                  onChange={(e) => handleFieldChange('bagianG', 'taksiranKerugian', Number(e.target.value))}
                  placeholder="Contoh: 14800000000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-rose-800 font-bold focus:ring-2 focus:ring-rose-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Format angka penuh tanpa titik. Terbilang: Rp {report.bagianG.taksiranKerugian.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bagian H: Inspeksi Bangunan atau Gedung */}
      {(activeSection === 'all' || activeSection === 'H') && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">H</span>
            <div>
              <h2 className="font-bold text-base text-slate-900">Data Inspeksi Bangunan atau Gedung</h2>
              <p className="text-xs text-slate-500">Pemeriksaan kelaikan proteksi kebakaran pada bangunan gedung</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Bangunan Rendah */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
              <div className="font-bold text-slate-800">Bangunan Rendah (1-4 Lantai)</div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Jumlah Total Bangunan</label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianH.bangunanRendah}
                  onChange={(e) => handleFieldChange('bagianH', 'bangunanRendah', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Yang Sudah Diinspeksi</label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianH.bangunanRendahDiinspeksi}
                  onChange={(e) => handleFieldChange('bagianH', 'bangunanRendahDiinspeksi', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-emerald-700 font-bold"
                />
              </div>
            </div>

            {/* Bangunan Menengah */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
              <div className="font-bold text-slate-800">Bangunan Menengah (5-8 Lantai)</div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Jumlah Total Bangunan</label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianH.bangunanMenengah}
                  onChange={(e) => handleFieldChange('bagianH', 'bangunanMenengah', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Yang Sudah Diinspeksi</label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianH.bangunanMenengahDiinspeksi}
                  onChange={(e) => handleFieldChange('bagianH', 'bangunanMenengahDiinspeksi', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-emerald-700 font-bold"
                />
              </div>
            </div>

            {/* Bangunan Tinggi */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
              <div className="font-bold text-slate-800">Bangunan Tinggi (Lebih dari 8 Lantai)</div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Jumlah Total Bangunan</label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianH.bangunanTinggi}
                  onChange={(e) => handleFieldChange('bagianH', 'bangunanTinggi', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Yang Sudah Diinspeksi</label>
                <input
                  type="number"
                  min="0"
                  value={report.bagianH.bangunanTinggiDiinspeksi}
                  onChange={(e) => handleFieldChange('bagianH', 'bangunanTinggiDiinspeksi', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-emerald-700 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Submit to Provinsi */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Ajukan Laporan Resmi ke Provinsi Kaltim?</h3>
                <p className="text-xs text-slate-500">Satpol PP Provinsi Kalimantan Timur cq. Bidang Kebakaran</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-600 space-y-2 border border-slate-200">
              <p>
                Anda akan mengajukan laporan resmi <strong>{regionInfo.name}</strong> untuk periode <strong>{period === 'SEMESTER_1' ? 'Semester I Tahun 2026' : 'Semester II Tahun 2026'}</strong>.
              </p>
              <p>
                Pastikan data yang diisi telah disahkan oleh <strong>{report.pejabat.nama || 'Kepala Dinas/Instansi'}</strong>.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-sm"
              >
                Ya, Ajukan Laporan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Revision Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200 text-slate-900">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Kembalikan Laporan untuk Revisi</h3>
                <p className="text-xs text-slate-500">Satpol PP Provinsi Kalimantan Timur • Verifikasi SE Sekda</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Catatan / Instruksi Perbaikan untuk Operator {regionInfo.name}:
              </label>
              <textarea
                rows={4}
                value={revisionNotesInput}
                onChange={(e) => setRevisionNotesInput(e.target.value)}
                placeholder="Tuliskan catatan perbaikan (contoh: Lampiran sarana prasarana Bagian C unit mobil supply mohon disesuaikan dengan BPKB, dan total korban jiwa Bagian G perlu konfirmasi ulang)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRevisionModalOpen(false);
                  setRevisionNotesInput('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRequestRevision}
                disabled={!revisionNotesInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 shadow-sm"
              >
                Kirim Catatan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

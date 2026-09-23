import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileEdit, 
  Clock, 
  Download, 
  Eye, 
  MessageSquare, 
  History,
  FileSpreadsheet,
  Check,
  X,
  ExternalLink,
  Search,
  RefreshCw
} from 'lucide-react';
import { ReportPeriod, ReportStatus, UserRole } from '../types';
import { REGIONS_KALTIM, PROVINSI_INFO } from '../data/regions';
import { storageService, AuditLogItem } from '../services/storageService';

interface ProvinsiVerificationProps {
  period: ReportPeriod;
  onSelectRegion: (regionId: string) => void;
  onGoToPdf: (regionId: string) => void;
  userRole: UserRole;
}

export const ProvinsiVerification: React.FC<ProvinsiVerificationProps> = ({
  period,
  onSelectRegion,
  onGoToPdf,
  userRole
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReportStatus>('ALL');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [activeTab, setActiveTab] = useState<'monitoring' | 'rekapitulasi' | 'audit'>('monitoring');
  const [verificationSuccessMsg, setVerificationSuccessMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsub;
  }, []);

  const handleManualSync = () => {
    setIsRefreshing(true);
    storageService.forceSync();
    setTimeout(() => {
      setIsRefreshing(false);
      setVerificationSuccessMsg('Data telah disinkronkan ulang secara realtime dari Cloud Firestore.');
      setTimeout(() => setVerificationSuccessMsg(null), 4000);
    }, 600);
  };

  const allReports = REGIONS_KALTIM.map(reg => ({
    region: reg,
    report: storageService.getReport(reg.id, period, 2026)
  }));

  const filtered = allReports.filter(({ region, report }) => {
    const matchSearch = region.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      region.instansiName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || report.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleVerify = (reportId: string, status: 'verified' | 'revision_needed') => {
    const reportItem = allReports.find(r => r.report.id === reportId);
    const regionName = reportItem?.region.name || reportId;

    storageService.updateReportStatus(
      reportId,
      status,
      status === 'revision_needed' ? revisionNote : 'Data telah diverifikasi sah oleh Tim Verifikator Provinsi Kaltim.',
      'Tim Verifikator Satpol PP Prov. Kaltim',
      'Super Admin Provinsi'
    );
    setSelectedReportId(null);
    setRevisionNote('');

    if (status === 'verified') {
      setVerificationSuccessMsg(`✅ Laporan ${regionName} BERHASIL DIVERIFIKASI SAH! Seluruh data realtime resmi masuk ke dalam rekapitulasi provinsi, dashboard operasional, dan ringkasan eksekutif.`);
    } else {
      setVerificationSuccessMsg(`⚠️ Laporan ${regionName} dikembalikan ke Operator Daerah dengan catatan revisi.`);
    }
    setTimeout(() => setVerificationSuccessMsg(null), 6000);
  };

  const handleExportCSV = () => {
    const csvContent = storageService.exportToCSV(period, 2026);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekapitulasi_Damkar_Kaltim_${period}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const auditLogs = storageService.getAuditLogs();
  const summary = storageService.getKaltimSummary(period, 2026);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 uppercase">
              Satuan Polisi Pamong Praja Prov. Kaltim
            </span>
            <span className="text-xs text-slate-500 font-medium">Bidang Kebakaran</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Pusat Verifikasi & Rekapitulasi se-Kalimantan Timur
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validasi kepatuhan data laporan Kabupaten/Kota berdasarkan Surat No. 300.1/3326/SATPOL.PP-IV
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            title="Muat ulang dan sinkronkan data secara realtime dari Cloud Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-600' : 'text-slate-600'}`} />
            <span>{isRefreshing ? 'Menyinkronkan...' : 'Sinkronkan Realtime Cloud'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Rekap Excel (CSV)
          </button>
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{verificationSuccessMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setVerificationSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('monitoring')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'monitoring'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Verifikasi Laporan 10 Wilayah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rekapitulasi')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'rekapitulasi'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Tabel Rekapitulasi Provinsi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Audit Transaksi (SPBE)</span>
        </button>
      </div>

      {/* TAB 1: Monitoring & Verifikasi */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          
          {/* Banner Menunggu Verifikasi */}
          {allReports.filter(r => r.report.status === 'submitted').length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-white border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-xs">
                  {allReports.filter(r => r.report.status === 'submitted').length}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Ada {allReports.filter(r => r.report.status === 'submitted').length} Laporan Daerah Menunggu Verifikasi Sah Satpol PP Provinsi
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Data realtime dari operator kabupaten/kota telah masuk ke cloud. Klik tombol "Sahkan" atau "Validasi" untuk mengesahkan data ke rekapitulasi provinsi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusFilter('submitted')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shrink-0"
              >
                Lihat yang Diajukan
              </button>
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari nama kabupaten/kota..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="ALL">Semua Status</option>
                <option value="verified">Terverifikasi Sah</option>
                <option value="submitted">Menunggu Verifikasi</option>
                <option value="revision_needed">Perlu Revisi</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Wilayah & Instansi</th>
                    <th className="px-4 py-3.5">Bentuk Lembaga</th>
                    <th className="px-4 py-3.5">Status Laporan</th>
                    <th className="px-4 py-3.5">Response SPM 15m</th>
                    <th className="px-4 py-3.5">SDM (PNS/PPPK)</th>
                    <th className="px-4 py-3.5">Armada Damkar</th>
                    <th className="px-4 py-3.5 text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(({ region, report }) => {
                    const statusConfig = {
                      verified: { label: 'Terverifikasi Sah', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                      submitted: { label: 'Diajukan', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
                      revision_needed: { label: 'Perlu Revisi', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
                      draft: { label: 'Draft', badge: 'bg-slate-100 text-slate-600 border-slate-200' }
                    }[report.status];

                    const spmRate = report.bagianE.totalKejadian > 0
                      ? Math.round((report.bagianE.response15Menit / report.bagianE.totalKejadian) * 100)
                      : 100;

                    return (
                      <tr key={region.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{region.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{region.instansiName}</div>
                          {report.pengisi.nama && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Pengisi: {report.pengisi.nama} ({report.pengisi.jabatan || 'Operator'})
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{report.bagianA.bentukKelembagaan}</div>
                          <div className="text-[11px] text-slate-500">Tipe {report.bagianA.tipeKelembagaan} • {report.bagianA.jumlahMako} Mako</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[11px] border ${statusConfig.badge}`}>
                            {statusConfig.label}
                          </span>
                          {report.status === 'revision_needed' && report.revisionNotes && (
                            <div className="text-[10px] text-rose-600 mt-1 line-clamp-1 italic">
                              "{report.revisionNotes}"
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{spmRate}%</div>
                          <div className="text-[10px] text-slate-500">{report.bagianE.response15Menit} dari {report.bagianE.totalKejadian} kejadian</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">
                            {report.bagianB.totalPns + report.bagianB.totalPppk + report.bagianB.nonAsn} Personel
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {report.bagianB.totalPns} PNS • {report.bagianB.totalPppk} PPPK
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">
                            {report.bagianC.mobilDamkar + report.bagianC.mobilTangki} Unit
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {report.bagianC.mobilDamkar} Pemadam • {report.bagianC.mobilTangki} Tangki
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {report.status === 'submitted' && (
                              <button
                                type="button"
                                onClick={() => handleVerify(report.id, 'verified')}
                                title="Langsung Sahkan Laporan Ini ke Provinsi"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Sahkan</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                onSelectRegion(region.id);
                                onGoToPdf(region.id);
                              }}
                              title="Lihat Pratinjau Cetak Dokumen Resmi"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedReportId(report.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Validasi</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Tabel Rekapitulasi Provinsi */}
      {activeTab === 'rekapitulasi' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm overflow-x-auto">
            <h2 className="font-bold text-base text-slate-900 mb-1">
              Rekapitulasi Agregat 10 Kabupaten/Kota se-Kalimantan Timur
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Laporan {period === 'SEMESTER_1' ? 'Semester I Tahun 2026' : 'Semester II Tahun 2026'}
            </p>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">No</th>
                  <th className="px-3 py-2">Kabupaten / Kota</th>
                  <th className="px-3 py-2">Mako & Pos</th>
                  <th className="px-3 py-2">Total SDM</th>
                  <th className="px-3 py-2">Mobil Damkar</th>
                  <th className="px-3 py-2">Relawan</th>
                  <th className="px-3 py-2">Kebakaran</th>
                  <th className="px-3 py-2">SPM 15m</th>
                  <th className="px-3 py-2">Rescue</th>
                  <th className="px-3 py-2">Jiwa Selamat</th>
                  <th className="px-3 py-2">Aset Selamat (Rp)</th>
                  <th className="px-3 py-2">Kerugian (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allReports.map(({ region, report }, idx) => (
                  <tr key={region.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">{region.name}</td>
                    <td className="px-3 py-2.5 font-mono">{report.bagianA.jumlahMako} M / {(report.bagianA.jumlahPosSektor || 0) + (report.bagianA.jumlahPos || 0)} P</td>
                    <td className="px-3 py-2.5 font-mono">{report.bagianB.totalPns + report.bagianB.totalPppk + report.bagianB.nonAsn}</td>
                    <td className="px-3 py-2.5 font-mono">{report.bagianC.mobilDamkar}</td>
                    <td className="px-3 py-2.5 font-mono">{report.bagianD.jumlahRelawan}</td>
                    <td className="px-3 py-2.5 font-mono">{report.bagianE.totalKejadian}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-700">{report.bagianE.response15Menit}</td>
                    <td className="px-3 py-2.5 font-mono">{report.bagianF.totalOperasi}</td>
                    <td className="px-3 py-2.5 font-mono text-emerald-700 font-bold">{report.bagianG.jiwaSelamat}</td>
                    <td className="px-3 py-2.5 font-mono text-emerald-700">Rp {(report.bagianG.taksiranAsetSelamat / 1_000_000_000).toFixed(1)} M</td>
                    <td className="px-3 py-2.5 font-mono text-rose-700">Rp {(report.bagianG.taksiranKerugian / 1_000_000_000).toFixed(1)} M</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold text-[11px]">
                <tr>
                  <td colSpan={2} className="px-3 py-2.5 uppercase">TOTAL SE-KALTIM</td>
                  <td className="px-3 py-2.5 font-mono">{summary.sarpras.totalMako} M / {summary.sarpras.totalPos} P</td>
                  <td className="px-3 py-2.5 font-mono">{summary.sdm.grandTotalPersonel}</td>
                  <td className="px-3 py-2.5 font-mono">{summary.sarpras.totalMobilDamkar}</td>
                  <td className="px-3 py-2.5 font-mono">{summary.relawan.totalRelawan}</td>
                  <td className="px-3 py-2.5 font-mono">{summary.operasional.totalKejadianKebakaran}</td>
                  <td className="px-3 py-2.5 font-mono text-emerald-400">{summary.operasional.totalResponse15Menit} ({summary.operasional.spmResponseRate}%)</td>
                  <td className="px-3 py-2.5 font-mono">{summary.operasional.totalOperasiRescue}</td>
                  <td className="px-3 py-2.5 font-mono text-emerald-400">{summary.korbanDanAset.totalJiwaSelamat}</td>
                  <td className="px-3 py-2.5 font-mono text-emerald-400">Rp {(summary.korbanDanAset.totalAsetSelamat / 1_000_000_000).toFixed(1)} M</td>
                  <td className="px-3 py-2.5 font-mono text-rose-400">Rp {(summary.korbanDanAset.totalKerugian / 1_000_000_000).toFixed(1)} M</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Jejak Audit & Integritas Data (SPBE Kaltim)</h2>
              <p className="text-xs text-slate-500">Mencatat setiap transaksi pembaruan, pengajuan, dan verifikasi dokumen</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-amber-700 font-medium">{log.user}</span>
                  </div>
                  <div className="text-slate-600">{log.details}</div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Verifikasi / Sahkan / Minta Revisi */}
      {selectedReportId && (() => {
        const item = allReports.find(r => r.report.id === selectedReportId);
        const rep = item?.report;
        const reg = item?.region;
        const totalSdm = rep ? (rep.bagianB.totalPns + rep.bagianB.totalPppk + rep.bagianB.nonAsn) : 0;
        const spmPercent = rep && rep.bagianE.totalKejadian > 0 
          ? Math.round((rep.bagianE.response15Menit / rep.bagianE.totalKejadian) * 100) 
          : 100;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                    Verifikasi Dokumen Laporan Wilayah
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {reg?.name} - {reg?.instansiName}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedReportId(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Data Summary Grid from Operator Input */}
              {rep && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-slate-500 font-medium">Petugas Pengisi / Operator:</span>
                      <p className="font-bold text-slate-900">
                        {rep.pengisi.nama || 'Operator Belum Mengisi'} ({rep.pengisi.jabatan || 'Staf Operasional'})
                      </p>
                      {rep.pengisi.noHp && (
                        <p className="text-[11px] text-slate-500">Telp/WA: {rep.pengisi.noHp}</p>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                      rep.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : rep.status === 'submitted'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : rep.status === 'revision_needed'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}>
                      {rep.status === 'verified' ? 'TERVERIFIKASI SAH' : rep.status === 'submitted' ? 'DIAJUKAN' : rep.status === 'revision_needed' ? 'PERLU REVISI' : 'DRAFT'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Total SDM</span>
                      <span className="text-base font-black text-slate-900">{totalSdm}</span>
                      <span className="text-[10px] text-slate-500 block">{rep.bagianB.totalPns} PNS • {rep.bagianB.totalPppk} PPPK</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Armada Damkar</span>
                      <span className="text-base font-black text-slate-900">{rep.bagianC.mobilDamkar + rep.bagianC.mobilTangki}</span>
                      <span className="text-[10px] text-slate-500 block">{rep.bagianC.mobilDamkar} Utama • {rep.bagianC.mobilTangki} Tangki</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Kebakaran</span>
                      <span className="text-base font-black text-rose-600">{rep.bagianE.totalKejadian}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">SPM {spmPercent}%</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Rescue</span>
                      <span className="text-base font-black text-blue-600">{rep.bagianF.totalOperasi}</span>
                      <span className="text-[10px] text-slate-500 block">{rep.bagianG.jiwaSelamat} Jiwa Selamat</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">Taksiran Kerugian:</span>
                      <span className="font-bold text-rose-600">
                        Rp {(rep.bagianG.taksiranKerugian || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">Aset Selamat:</span>
                      <span className="font-bold text-emerald-600">
                        Rp {(rep.bagianG.taksiranAsetSelamat || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Verifikasi Satpol PP Provinsi Kaltim
                </label>
                <textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Contoh: Data telah diverifikasi sah dan sesuai dengan instrumen pelaporan resmi."
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
                {reg && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReportId(null);
                      onSelectRegion(reg.id);
                      onGoToPdf(reg.id);
                    }}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Cetak Dokumen PDF</span>
                  </button>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleVerify(selectedReportId, 'revision_needed')}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                  >
                    Minta Revisi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify(selectedReportId, 'verified')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-600 shadow transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui & Sahkan Laporan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Flame, 
  Building2, 
  Zap, 
  AlertTriangle,
  Award,
  LifeBuoy,
  RefreshCw,
  FileCheck,
  Shield,
  FileText
} from 'lucide-react';
import { REGIONS_KALTIM } from '../data/regions';
import { storageService } from '../services/storageService';
import { ReportPeriod, UserRole } from '../types';

interface EksekutifViewProps {
  period?: ReportPeriod;
  onNavigateToReport?: (regionId: string) => void;
  userRole?: UserRole;
}

export const EksekutifView: React.FC<EksekutifViewProps> = ({ 
  period = 'SEMESTER_1',
  onNavigateToReport,
  userRole = 'admin_provinsi'
}) => {
  const [, setTick] = useState(0);

  // Subscribe to real-time report changes in storageService
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsubscribe();
  }, []);

  const summary = storageService.getKaltimSummary(period, 2026);
  const reports = REGIONS_KALTIM.map(reg => storageService.getReport(reg.id, period, 2026));

  // Dynamic calculation of fire causes from actual reports
  let sebabListrik = 0;
  let sebabGasKompor = 0;
  let sebabBahanBakar = 0;
  let sebabKelalaian = 0;
  let sebabLainnya = 0;

  reports.forEach(r => {
    sebabListrik += r.bagianE?.sebabListrik || 0;
    sebabGasKompor += r.bagianE?.sebabGasKompor || 0;
    sebabBahanBakar += r.bagianE?.sebabBahanBakar || 0;
    sebabKelalaian += r.bagianE?.sebabKelalaian || 0;
    sebabLainnya += r.bagianE?.sebabLainnya || 0;
  });

  const totalSebab = sebabListrik + sebabGasKompor + sebabBahanBakar + sebabKelalaian + sebabLainnya;

  const formatRupiah = (val: number) => {
    if (!val || val === 0) return 'Rp 0';
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Miliar`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} Juta`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const totalKejadian = summary.operasional.totalKejadianKebakaran;
  const totalResponse15 = summary.operasional.totalResponse15Menit;
  const spmRate = totalKejadian > 0 
    ? Math.round((totalResponse15 / totalKejadian) * 100)
    : 100;

  return (
    <div className="space-y-6">
      
      {/* Header & Sync Status Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              Tersinkronisasi Otomatis Dari 10 Kab/Kota
            </span>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/30">
              {period === 'SEMESTER_1' ? 'Semester I (Lampiran II)' : 'Semester II (Lampiran III)'} - Tahun 2026
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Ringkasan Eksekutif Damkar Prov. Kalimantan Timur
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rekapitulasi data riil Standar Pelayanan Minimal (SPM) dan operasional berdasarkan input instrumen SE Sekda Prov. Kaltim.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold transition border border-slate-700 shadow-md whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Eksekutif</span>
          </button>
        </div>
      </div>

      {/* Progress Pelaporan 10 Daerah - HANYA UNTUK SUPER ADMIN PROVINSI */}
      {userRole === 'admin_provinsi' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Status Pengisian Laporan 10 Kabupaten / Kota:
              </span>
              <span className="text-[11px] text-slate-400">
                {summary.statusBreakdown.verified} Terverifikasi Sah • {summary.statusBreakdown.submitted} Diajukan • {summary.statusBreakdown.revision} Perlu Revisi • {summary.statusBreakdown.draft} Proses Draft
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
              {summary.statusBreakdown.verified} Sah
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
              {summary.statusBreakdown.submitted} Diajukan
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-bold border border-slate-700">
              {summary.statusBreakdown.draft} Draft
            </span>
          </div>
        </div>
      )}

      {/* 4 Real-time Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Kepatuhan SPM 15 Menit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Kepatuhan SPM 15 Menit</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-400">
              {totalKejadian > 0 ? `${spmRate}%` : '100%'}
            </p>
            <span className="text-xs text-slate-400 font-medium block mt-1">
              {totalKejadian > 0 
                ? `${totalResponse15} dari ${totalKejadian} kejadian ≤ 15 menit`
                : 'Target Permendagri 114/2018 (≥90%)'}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {totalKejadian > 0 
              ? (spmRate >= 90 ? '✓ Memenuhi Standar SPM Nasional' : 'Perlu Peningkatan Waktu Tanggap')
              : 'Menunggu input kejadian dari operator daerah'}
          </div>
        </div>

        {/* Total Operasi Penyelamatan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Operasi Penyelamatan</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white">
              {summary.operasional.totalOperasiRescue} <span className="text-sm font-normal text-slate-400">Giat</span>
            </p>
            <span className="text-xs text-slate-400 font-medium block mt-1">
              Operasi rescue & evakuasi non-kebakaran
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-blue-400 font-semibold">
            {summary.korbanDanAset.totalJiwaSelamat} jiwa terselamatkan dari bahaya
          </div>
        </div>

        {/* Taksiran Aset Selamat */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aset Terselamatkan</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-teal-400">
              {formatRupiah(summary.korbanDanAset.totalAsetSelamat)}
            </p>
            <span className="text-xs text-slate-400 font-medium block mt-1">
              Nilai properti & bangunan terlindungi
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-teal-400 font-semibold">
            Hasil proteksi pemadaman terinput di Bagian G
          </div>
        </div>

        {/* Taksiran Kerugian Fisik */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kerugian Fisik</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-rose-400">
              {formatRupiah(summary.korbanDanAset.totalKerugian)}
            </p>
            <span className="text-xs text-slate-400 font-medium block mt-1">
              Akumulasi dari {totalKejadian} laporan kejadian
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-semibold">
            Sinkron dari formulir resmi Bagian G instrumen
          </div>
        </div>

      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Faktor Penyebab Kebakaran Terbesar - SINKRON DARI HASIL INPUT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Faktor Penyebab Kebakaran (Input Operator 10 Daerah)
            </h4>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Total {totalSebab} Kasus
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Rekapitulasi investigasi penyebab kebakaran terdata di Bagian E oleh Damkar Kab/Kota se-Kaltim.
          </p>

          {totalSebab === 0 ? (
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
              <Flame className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                Belum Ada Data Penyebab Kebakaran Terinput
              </p>
              <p className="text-[11px] text-slate-500">
                Data akan otomatis terkalkulasi saat operator daerah menginputkan rincian di Bagian E Formulir Laporan.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Korsleting / Arus Pendek Listrik
                  </span>
                  <span className="text-amber-400 font-bold">
                    {Math.round((sebabListrik / totalSebab) * 100)}% ({sebabListrik} Kasus)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(sebabListrik / totalSebab) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Kompor Gas & Tabung Elpiji
                  </span>
                  <span className="text-rose-400 font-bold">
                    {Math.round((sebabGasKompor / totalSebab) * 100)}% ({sebabGasKompor} Kasus)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${(sebabGasKompor / totalSebab) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                    Bahan Bakar Minyak / Mudah Terbakar
                  </span>
                  <span className="text-orange-400 font-bold">
                    {Math.round((sebabBahanBakar / totalSebab) * 100)}% ({sebabBahanBakar} Kasus)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${(sebabBahanBakar / totalSebab) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Kelalaian Manusia (Lilin, Obat Nyamuk, Rokok)
                  </span>
                  <span className="text-blue-400 font-bold">
                    {Math.round((sebabKelalaian / totalSebab) * 100)}% ({sebabKelalaian} Kasus)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(sebabKelalaian / totalSebab) * 100}%` }}></div>
                </div>
              </div>

              {sebabLainnya > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      Penyebab Lainnya
                    </span>
                    <span className="text-slate-400 font-bold">
                      {Math.round((sebabLainnya / totalSebab) * 100)}% ({sebabLainnya} Kasus)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-600" style={{ width: `${(sebabLainnya / totalSebab) * 100}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-orange-400" />
              Catatan Pengendalian Operasi:
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Data penyebab kebakaran di atas otomatis terakumulasi dari isian Bagian E seluruh instrumen daerah. Menjadi dasar evaluasi pencegahan dan sosialisasi proteksi kebakaran di pemukiman warga Kaltim.
            </p>
          </div>
        </div>

        {/* Ringkasan Sebaran per Kabupaten/Kota - SINKRON DARI HASIL INPUT - HANYA UNTUK SUPER ADMIN PROVINSI */}
        {userRole === 'admin_provinsi' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-500" />
                Sebaran Data & Status Laporan 10 Kab/Kota
              </h4>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                10 Wilayah
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Data riil insiden kebakaran, penyelamatan, dan kerugian yang diisi oleh masing-masing Pemda.
            </p>

            <div className="space-y-2.5 max-h-84 overflow-y-auto pr-1">
              {REGIONS_KALTIM.map((reg) => {
                const rep = storageService.getReport(reg.id, period, 2026);
                const kebakaranCount = rep.bagianE?.totalKejadian || 0;
                const rescueCount = rep.bagianF?.totalOperasi || 0;
                const kerugianNominal = rep.bagianG?.taksiranKerugian || 0;

                return (
                  <div 
                    key={reg.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition gap-2"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white block">
                          {reg.name}
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${
                          rep.status === 'verified'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : rep.status === 'submitted'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : rep.status === 'revision_needed'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {rep.status === 'verified' ? 'Sah' : rep.status === 'submitted' ? 'Diajukan' : rep.status === 'revision_needed' ? 'Revisi' : 'Draft'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {reg.instansiName}
                      </span>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <span className="font-bold text-rose-400 block font-mono text-xs">
                        {kebakaranCount} Kebakaran • {rescueCount} Rescue
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Kerugian: {formatRupiah(kerugianNominal)}
                      </span>
                      {onNavigateToReport && (
                        <button
                          type="button"
                          onClick={() => onNavigateToReport(reg.id)}
                          className="text-[10px] text-orange-400 hover:text-orange-300 font-bold underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <FileCheck className="w-3 h-3" />
                          Lihat Instrumen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

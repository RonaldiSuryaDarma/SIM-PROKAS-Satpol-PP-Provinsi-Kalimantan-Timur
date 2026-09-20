import React from 'react';
import { 
  Flame, 
  LifeBuoy, 
  Truck, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileEdit, 
  Building, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Printer
} from 'lucide-react';
import { ReportPeriod, UserRole } from '../types';
import { REGIONS_KALTIM } from '../data/regions';
import { storageService } from '../services/storageService';

interface DashboardOverviewProps {
  period: ReportPeriod;
  onSelectRegion: (regionId: string) => void;
  onGoToForm?: () => void;
  onGoToPdf?: (regionId?: string) => void;
  userRole: UserRole;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  period,
  onSelectRegion,
  onGoToForm,
  onGoToPdf,
  userRole
}) => {
  const summary = storageService.getKaltimSummary(period, 2026);
  const reports = REGIONS_KALTIM.map(r => ({
    region: r,
    report: storageService.getReport(r.id, period, 2026)
  }));

  const formatRupiah = (val: number) => {
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(1)} Miliar`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(1)} Juta`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Official Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 rounded-2xl p-6 text-white border border-slate-700/80 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>Surat Edaran Sekda Prov. Kaltim No. 300.1/3326/SATPOL.PP-IV</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pemantauan Data Terpadu Damkar se-Kalimantan Timur
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Integrasi data kelembagaan, personel aparatur, armada sarpras, kepatuhan response time 15 menit (SPM), 
              serta operasi penyelamatan dari 10 Kabupaten/Kota di Provinsi Kalimantan Timur.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-700/60 text-xs space-y-2 shrink-0 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Tahun Anggaran:</span>
              <span className="font-bold text-white">2026</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Periode Aktif:</span>
              <span className="font-bold text-amber-400">
                {period === 'SEMESTER_1' ? 'Semester I (Jan - Jun 2026)' : 'Semester II (Akumulasi Jan - Des)'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Batas Laporan:</span>
              <span className="font-semibold text-rose-300">
                {period === 'SEMESTER_1' ? '13 Juli 2026' : '11 Januari 2027'}
              </span>
            </div>
            <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sistem Pelaporan Mandiri SIMPROKAS Prov. Kaltim Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* High-level KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Response Time 15 Menit SPM */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Kepatuhan SPM 15 Mnt</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {summary.operasional.spmResponseRate}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-bold text-emerald-600">{summary.operasional.totalResponse15Menit}</span> dari {summary.operasional.totalKejadianKebakaran} kejadian
            </div>
          </div>
        </div>

        {/* KPI 2: Total Kebakaran & Rescue */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Operasi Damkar</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {summary.operasional.grandTotalInsiden}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.operasional.totalKejadianKebakaran} Kebakaran • {summary.operasional.totalOperasiRescue} Rescue
            </div>
          </div>
        </div>

        {/* KPI 3: Total Personel Damkar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total SDM Damkar</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {summary.sdm.grandTotalPersonel}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.sdm.totalPns} PNS • {summary.sdm.totalPppk} PPPK • {summary.sdm.totalNonAsn} Non-ASN
            </div>
          </div>
        </div>

        {/* KPI 4: Relawan Kebakaran (Redkar) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Relawan (Redkar)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {summary.relawan.totalRelawan.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Di {summary.relawan.totalDesa} Desa / Kelurahan
            </div>
          </div>
        </div>

        {/* KPI 5: Total Mobil Damkar & Tangki */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Armada Damkar</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {summary.sarpras.totalArmada} Unit
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.sarpras.totalMobilDamkar} Pemadam • {summary.sarpras.totalMobilTangki} Tangki
            </div>
          </div>
        </div>

        {/* KPI 6: Aset Terselamatkan */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Aset Diselamatkan</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-base font-black text-emerald-700 truncate">
              {formatRupiah(summary.korbanDanAset.totalAsetSelamat)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Rasio {summary.korbanDanAset.rasioPenyelamatanAset}% terselamatkan
            </div>
          </div>
        </div>

      </div>

      {/* Progress Pelaporan 10 Kab/Kota */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Status Kepatuhan Pelaporan 10 Kabupaten/Kota
            </h2>
            <p className="text-xs text-slate-500">
              Progres pengumpulan data sesuai format Lampiran II / III Surat Sekda Prov. Kaltim
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              {summary.statusBreakdown.verified} Terverifikasi
            </span>
            <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              <Clock className="w-3.5 h-3.5" />
              {summary.statusBreakdown.submitted} Diajukan
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              {summary.statusBreakdown.revision} Revisi
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              <FileEdit className="w-3.5 h-3.5" />
              {summary.statusBreakdown.draft} Draft
            </span>
          </div>
        </div>

        {/* Progress Bar Visual */}
        <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
          <div 
            className="bg-emerald-500 transition-all duration-500" 
            style={{ width: `${(summary.statusBreakdown.verified / 10) * 100}%` }}
            title={`Terverifikasi: ${summary.statusBreakdown.verified}`}
          />
          <div 
            className="bg-blue-500 transition-all duration-500" 
            style={{ width: `${(summary.statusBreakdown.submitted / 10) * 100}%` }}
            title={`Diajukan: ${summary.statusBreakdown.submitted}`}
          />
          <div 
            className="bg-amber-500 transition-all duration-500" 
            style={{ width: `${(summary.statusBreakdown.revision / 10) * 100}%` }}
            title={`Perlu Revisi: ${summary.statusBreakdown.revision}`}
          />
          <div 
            className="bg-slate-300 transition-all duration-500" 
            style={{ width: `${(summary.statusBreakdown.draft / 10) * 100}%` }}
            title={`Draft: ${summary.statusBreakdown.draft}`}
          />
        </div>
      </div>

      {/* Grid 10 Kabupaten / Kota Kalimantan Timur */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <span>Daftar Wilayah Dinas/Instansi Damkar se-Kaltim</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Klik kartu wilayah untuk meninjau formulir atau cetak laporan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(({ region, report }) => {
            const statusConfig = {
              verified: {
                label: 'Terverifikasi Sah',
                bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: CheckCircle
              },
              submitted: {
                label: 'Menunggu Verifikasi',
                bg: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: Clock
              },
              revision_needed: {
                label: 'Perlu Revisi',
                bg: 'bg-rose-50 text-rose-700 border-rose-200',
                icon: AlertTriangle
              },
              draft: {
                label: 'Dalam Proses / Draft',
                bg: 'bg-slate-100 text-slate-700 border-slate-200',
                icon: FileEdit
              }
            }[report.status];

            const StatusIcon = statusConfig.icon;
            const responseRate = report.bagianE.totalKejadian > 0
              ? Math.round((report.bagianE.response15Menit / report.bagianE.totalKejadian) * 100)
              : 100;

            return (
              <div 
                key={region.id}
                onClick={() => {
                  onSelectRegion(region.id);
                  if (onGoToForm) onGoToForm();
                }}
                className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top: Name & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                        {region.type}
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                        {region.name}
                      </h3>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold border ${statusConfig.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Instansi Label */}
                  <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                    {region.instansiName}
                  </p>

                  {/* Data Highlights Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center text-xs mb-3 border border-slate-100">
                    <div>
                      <div className="text-slate-400 text-[10px] font-medium">Response 15m</div>
                      <div className="font-bold text-slate-800 text-sm">
                        {responseRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-medium">Kejadian</div>
                      <div className="font-bold text-slate-800 text-sm">
                        {report.bagianE.totalKejadian}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-medium">Total SDM</div>
                      <div className="font-bold text-slate-800 text-sm">
                        {report.bagianB.totalPns + report.bagianB.totalPppk + report.bagianB.nonAsn}
                      </div>
                    </div>
                  </div>

                  {/* Secondary Details */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Kelembagaan:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">
                        {report.bagianA.bentukKelembagaan} (Tipe {report.bagianA.tipeKelembagaan})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Armada Damkar:</span>
                      <span className="font-medium text-slate-700">
                        {report.bagianC.mobilDamkar} Pemadam • {report.bagianC.mobilTangki} Tangki
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Operasi Rescue:</span>
                      <span className="font-medium text-slate-700">
                        {report.bagianF.totalOperasi} Penyelamatan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-600 group-hover:text-amber-700 flex items-center gap-1">
                    <span>Isi Formulir (A-H)</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRegion(region.id);
                      if (onGoToPdf) onGoToPdf();
                    }}
                    className="font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition border border-slate-200"
                    title={`Lihat cetak resmi ${period === 'SEMESTER_1' ? 'Lampiran II' : 'Lampiran III'}`}
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-700" />
                    <span>Cetak {period === 'SEMESTER_1' ? 'Lamp. II' : 'Lamp. III'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operasional Insights: Analisis Penyebab Kebakaran & Penyelamatan Kaltim */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box 1: Distribusi Penyebab Kebakaran se-Kaltim */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Analisis Faktor Penyebab Kebakaran se-Kaltim</span>
              </h3>
              <p className="text-xs text-slate-500">Agregat Semester I & II Tahun 2026</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
              {summary.operasional.totalKejadianKebakaran} Kasus
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {(() => {
              const gas = reports.reduce((acc, r) => acc + (r.report.bagianE.sebabGasKompor || 0), 0);
              const listrik = reports.reduce((acc, r) => acc + (r.report.bagianE.sebabListrik || 0), 0);
              const bbm = reports.reduce((acc, r) => acc + (r.report.bagianE.sebabBahanBakar || 0), 0);
              const kelalaian = reports.reduce((acc, r) => acc + (r.report.bagianE.sebabKelalaian || 0), 0);
              const lainnya = reports.reduce((acc, r) => acc + (r.report.bagianE.sebabLainnya || 0), 0);
              const total = summary.operasional.totalKejadianKebakaran || 1;

              const causes = [
                { label: 'Korsleting / Arus Listrik', count: listrik, color: 'bg-rose-500' },
                { label: 'Kelalaian Manusia (Human Error)', count: kelalaian, color: 'bg-amber-500' },
                { label: 'Kebocoran Tabung Gas / Kompor', count: gas, color: 'bg-orange-500' },
                { label: 'Cairan Bahan Bakar (BBM / Minyak)', count: bbm, color: 'bg-red-600' },
                { label: 'Penyebab Lainnya / Investigasi', count: lainnya, color: 'bg-slate-400' }
              ];

              return causes.map(c => {
                const pct = Math.round((c.count / total) * 100);
                return (
                  <div key={c.label}>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-slate-700">{c.label}</span>
                      <span className="text-slate-900 font-bold">{c.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${c.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Box 2: Ragam Operasi Penyelamatan / Rescue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-blue-500" />
                <span>Ragam Operasi Penyelamatan (Non-Kebakaran)</span>
              </h3>
              <p className="text-xs text-slate-500">Tugas Penyelamatan Damkar Sesuai UU No. 23/2014</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
              {summary.operasional.totalOperasiRescue} Operasi
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {(() => {
              const animal = reports.reduce((acc, r) => acc + (r.report.bagianF.animalRescue || 0), 0);
              const pohon = reports.reduce((acc, r) => acc + (r.report.bagianF.pohonTumbang || 0), 0);
              const cincin = reports.reduce((acc, r) => acc + (r.report.bagianF.pelepasanCincin || 0), 0);
              const water = reports.reduce((acc, r) => acc + (r.report.bagianF.waterRescue || 0), 0);
              const laka = reports.reduce((acc, r) => acc + (r.report.bagianF.kecelakaanTransportasi || 0), 0);
              const total = summary.operasional.totalOperasiRescue || 1;

              const rescues = [
                { label: 'Animal Rescue (Evakuasi Ular, Tawon, dll)', count: animal, color: 'bg-emerald-500' },
                { label: 'Evakuasi Cincin / Pelepasan Cincin', count: cincin, color: 'bg-sky-500' },
                { label: 'Penanganan Pohon Tumbang', count: pohon, color: 'bg-amber-500' },
                { label: 'Water Rescue (Sungai Mahakam / Pesisir)', count: water, color: 'bg-blue-600' },
                { label: 'Penyelamatan Kecelakaan Transportasi', count: laka, color: 'bg-indigo-500' }
              ];

              return rescues.map(r => {
                const pct = Math.round((r.count / total) * 100);
                return (
                  <div key={r.label}>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-slate-700">{r.label}</span>
                      <span className="text-slate-900 font-bold">{r.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${r.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

      </div>
    </div>
  );
};

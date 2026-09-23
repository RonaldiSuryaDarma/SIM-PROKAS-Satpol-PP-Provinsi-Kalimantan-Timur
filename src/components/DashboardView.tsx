import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Flame, 
  Truck, 
  Building2, 
  ShieldCheck, 
  DollarSign, 
  Radio, 
  MapPin, 
  Clock, 
  Send, 
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Award,
  X,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { GasIncident } from '../data/gasAppData';
import { OperationsMap } from './OperationsMap';
import { REGIONS_KALTIM } from '../data/regions';
import { storageService } from '../services/storageService';
import { ReportPeriod, UserRole, UserSession } from '../types';

interface DashboardViewProps {
  incidents: GasIncident[];
  onAddIncident: (inc: GasIncident) => void;
  onTriggerSimulation: () => void;
  onNavigateToTab: (tab: any) => void;
  flyToCoords?: [number, number] | null;
  selectedRegionId?: string;
  onSelectRegion?: (id: string) => void;
  period?: ReportPeriod;
  onSelectPeriod?: (period: ReportPeriod) => void;
  userRole?: UserRole;
  userSession?: UserSession | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  incidents,
  onAddIncident,
  onTriggerSimulation,
  onNavigateToTab,
  flyToCoords,
  selectedRegionId = 'samarinda',
  onSelectRegion,
  period = 'SEMESTER_1',
  onSelectPeriod,
  userRole = 'admin_provinsi',
  userSession
}) => {
  const isOperator = userRole === 'operator_kabkota';
  const operatorRegion = userSession?.regionId || selectedRegionId;

  const [mapFilter, setMapFilter] = useState<string>('Semua');
  const [dataScope, setDataScope] = useState<'kaltim' | 'kabkota'>(isOperator ? 'kabkota' : 'kaltim');
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>(period);
  const [activeRegionId, setActiveRegionId] = useState<string>(isOperator ? operatorRegion : selectedRegionId);
  const [activeModal, setActiveModal] = useState<'personil' | 'kejadian' | 'armada' | 'posko' | 'jiwa' | 'kerugian' | null>(null);
  const [tick, setTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // If operator, strictly lock scope to kabkota and their region
  useEffect(() => {
    if (isOperator) {
      setDataScope('kabkota');
      setActiveRegionId(operatorRegion);
    }
  }, [isOperator, operatorRegion]);

  // Sync with prop changes if passed from Header/App
  useEffect(() => {
    if (period) setActivePeriod(period);
  }, [period]);

  useEffect(() => {
    if (selectedRegionId) setActiveRegionId(selectedRegionId);
  }, [selectedRegionId]);

  // Subscribe to storage changes so dashboard updates immediately when reports or incidents change
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
      setSyncNotice('Data telah disinkronkan secara realtime dengan Cloud Firestore.');
      setTimeout(() => setSyncNotice(null), 4000);
    }, 600);
  };

  const handlePeriodChange = (p: ReportPeriod) => {
    setActivePeriod(p);
    if (onSelectPeriod) onSelectPeriod(p);
  };

  const handleRegionChange = (regId: string) => {
    setActiveRegionId(regId);
    if (onSelectRegion) onSelectRegion(regId);
  };

  // Quick Report Form state
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [incidentType, setIncidentType] = useState('Kebakaran Rumah');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('samarinda');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeIncidents = incidents.filter(i => i.status === 'Aktif');

  // Compute stats according to Lampiran II & III format
  const stats = useMemo(() => {
    if (dataScope === 'kaltim') {
      const summary = storageService.getKaltimSummary(activePeriod, 2026);
      const allReports = REGIONS_KALTIM.map(r => storageService.getReport(r.id, activePeriod, 2026));
      
      const totalKendaraanLainnya = allReports.reduce((acc, r) => acc + (r.bagianC.kendaraanLainnya || 0), 0);
      const totalPosSektor = allReports.reduce((acc, r) => acc + (r.bagianA.jumlahPosSektor || 0), 0);
      const totalPosJaga = allReports.reduce((acc, r) => acc + (r.bagianA.jumlahPos || 0), 0);
      const totalLukaFisik = allReports.reduce((acc, r) => acc + (r.bagianG.korbanLukaFisikLainnya || 0), 0);

      return {
        scopeLabel: 'Provinsi Kalimantan Timur (Agregat 10 Kab/Kota)',
        totalPersonil: summary.sdm.grandTotalPersonel + summary.relawan.totalRelawan,
        personilAparatur: summary.sdm.grandTotalPersonel,
        pns: summary.sdm.totalPns,
        pppk: summary.sdm.totalPppk,
        nonAsn: summary.sdm.totalNonAsn,
        relawan: summary.relawan.totalRelawan,
        desaRelawan: summary.relawan.totalDesa,
        sertifikasi: summary.sdm.totalSertifikasi,

        totalKejadianSemua: summary.operasional.grandTotalInsiden,
        kebakaran: summary.operasional.totalKejadianKebakaran,
        response15: summary.operasional.totalResponse15Menit,
        spmRate: summary.operasional.spmResponseRate,
        rescue: summary.operasional.totalOperasiRescue,

        totalArmada: summary.sarpras.totalArmada + totalKendaraanLainnya,
        armadaUtama: summary.sarpras.totalArmada,
        mobilDamkar: summary.sarpras.totalMobilDamkar,
        mobilTangki: summary.sarpras.totalMobilTangki,
        mobilTangga: summary.sarpras.totalMobilTangga,
        mobilRescue: summary.sarpras.totalMobilRescue,
        kendaraanLainnya: totalKendaraanLainnya,

        totalPosko: summary.sarpras.totalMako + totalPosSektor + totalPosJaga,
        mako: summary.sarpras.totalMako,
        posSektor: totalPosSektor,
        posJaga: totalPosJaga,
        kelembagaanInfo: '10 Kab/Kota Terdata (Tipe A/B/C)',

        jiwaSelamat: summary.korbanDanAset.totalJiwaSelamat,
        meninggal: summary.korbanDanAset.totalMeninggal,
        lukaBakar: summary.korbanDanAset.totalLukaBakar,
        lukaFisik: totalLukaFisik,

        kerugianFisik: summary.korbanDanAset.totalKerugian,
        asetSelamat: summary.korbanDanAset.totalAsetSelamat,
        rasioAset: summary.korbanDanAset.rasioPenyelamatanAset
      };
    } else {
      const rep = storageService.getReport(activeRegionId, activePeriod, 2026);
      const reg = REGIONS_KALTIM.find(r => r.id === activeRegionId) || REGIONS_KALTIM[0];

      const totalSDM = (rep.bagianB.totalPns || 0) + (rep.bagianB.totalPppk || 0) + (rep.bagianB.nonAsn || 0);
      const totalArmada = (rep.bagianC.mobilDamkar || 0) + (rep.bagianC.mobilTangki || 0) + (rep.bagianC.mobilTangga || 0) + (rep.bagianC.mobilRescue || 0) + (rep.bagianC.kendaraanLainnya || 0);
      const totalKejadian = (rep.bagianE.totalKejadian || 0) + (rep.bagianF.totalOperasi || 0);
      const totalPosko = (rep.bagianA.jumlahMako || 0) + (rep.bagianA.jumlahPosSektor || 0) + (rep.bagianA.jumlahPos || 0);
      const spmRate = rep.bagianE.totalKejadian > 0 ? Math.round((rep.bagianE.response15Menit / rep.bagianE.totalKejadian) * 100) : 100;
      const totalAset = (rep.bagianG.taksiranAsetSelamat || 0) + (rep.bagianG.taksiranKerugian || 0);
      const rasioAset = totalAset > 0 ? Math.round((rep.bagianG.taksiranAsetSelamat / totalAset) * 100) : 0;
      const totalSertif = (rep.bagianB.sertifikasi.instruktur || 0) + (rep.bagianB.sertifikasi.inspektur || 0) + (rep.bagianB.sertifikasi.mfr || 0) + (rep.bagianB.sertifikasi.rescue || 0);

      return {
        scopeLabel: reg.name,
        totalPersonil: totalSDM + (rep.bagianD.jumlahRelawan || 0),
        personilAparatur: totalSDM,
        pns: rep.bagianB.totalPns || 0,
        pppk: rep.bagianB.totalPppk || 0,
        nonAsn: rep.bagianB.nonAsn || 0,
        relawan: rep.bagianD.jumlahRelawan || 0,
        desaRelawan: rep.bagianD.jumlahDesaKelurahan || 0,
        sertifikasi: totalSertif,

        totalKejadianSemua: totalKejadian,
        kebakaran: rep.bagianE.totalKejadian || 0,
        response15: rep.bagianE.response15Menit || 0,
        spmRate,
        rescue: rep.bagianF.totalOperasi || 0,

        totalArmada,
        armadaUtama: (rep.bagianC.mobilDamkar || 0) + (rep.bagianC.mobilTangki || 0) + (rep.bagianC.mobilTangga || 0) + (rep.bagianC.mobilRescue || 0),
        mobilDamkar: rep.bagianC.mobilDamkar || 0,
        mobilTangki: rep.bagianC.mobilTangki || 0,
        mobilTangga: rep.bagianC.mobilTangga || 0,
        mobilRescue: rep.bagianC.mobilRescue || 0,
        kendaraanLainnya: rep.bagianC.kendaraanLainnya || 0,

        totalPosko,
        mako: rep.bagianA.jumlahMako || 0,
        posSektor: rep.bagianA.jumlahPosSektor || 0,
        posJaga: rep.bagianA.jumlahPos || 0,
        kelembagaanInfo: `Tipe ${rep.bagianA.tipeKelembagaan || reg.tipeDefault} (${rep.bagianA.bentukKelembagaan || reg.instansiType})`,

        jiwaSelamat: rep.bagianG.jiwaSelamat || 0,
        meninggal: rep.bagianG.korbanMeninggal || 0,
        lukaBakar: rep.bagianG.korbanLukaBakar || 0,
        lukaFisik: rep.bagianG.korbanLukaFisikLainnya || 0,

        kerugianFisik: rep.bagianG.taksiranKerugian || 0,
        asetSelamat: rep.bagianG.taksiranAsetSelamat || 0,
        rasioAset
      };
    }
  }, [dataScope, activePeriod, activeRegionId, tick]);

  const regionReportsList = useMemo(() => {
    return REGIONS_KALTIM.map(reg => {
      const rep = storageService.getReport(reg.id, activePeriod, 2026);
      const totalSdm = (rep.bagianB.totalPns || 0) + (rep.bagianB.totalPppk || 0) + (rep.bagianB.nonAsn || 0);
      const totalArmada = (rep.bagianC.mobilDamkar || 0) + (rep.bagianC.mobilTangki || 0) + (rep.bagianC.mobilRescue || 0);
      const spmRate = rep.bagianE.totalKejadian > 0 
        ? Math.round((rep.bagianE.response15Menit / rep.bagianE.totalKejadian) * 100) 
        : 100;
      return {
        region: reg,
        report: rep,
        totalSdm,
        totalArmada,
        spmRate
      };
    });
  }, [activePeriod, tick]);

  const verifiedCount = regionReportsList.filter(r => r.report.status === 'verified').length;
  const submittedCount = regionReportsList.filter(r => r.report.status === 'submitted').length;
  const revisionCount = regionReportsList.filter(r => r.report.status === 'revision_needed').length;
  const draftCount = regionReportsList.filter(r => r.report.status === 'draft').length;

  const currentRegionReport = storageService.getReport(activeRegionId, activePeriod, 2026);
  const currentRegionInfo = REGIONS_KALTIM.find(r => r.id === activeRegionId) || REGIONS_KALTIM[0];

  const formatRupiah = (val: number): string => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  const formatRupiahSingkat = (val: number): string => {
    const num = Number(val || 0);
    if (num >= 1_000_000_000) {
      return `Rp ${(num / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`;
    }
    if (num >= 1_000_000) {
      return `Rp ${(num / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Jt`;
    }
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const handleSubmitQuickReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentLocation || !reporterName) return;

    setIsSubmitting(true);
    
    // Determine coordinate base on region or defaults
    const reg = REGIONS_KALTIM.find(r => r.id === selectedRegion);
    const coordsMap: Record<string, [number, number]> = {
      samarinda: [-0.5022, 117.1536],
      balikpapan: [-1.2379, 116.8529],
      bontang: [0.1333, 117.4833],
      kukar: [-0.4144, 116.9856],
      kutim: [0.4933, 117.5500],
      berau: [2.1500, 117.4833],
      paser: [-1.8333, 116.1667],
      kubar: [-0.2333, 115.7000],
      mahulu: [0.5500, 115.1000],
      ppu: [-1.3000, 116.7167]
    };
    const baseCoords = coordsMap[selectedRegion] || [-0.4912, 117.1856];
    const coords: [number, number] = [
      baseCoords[0] + (Math.random() - 0.5) * 0.02,
      baseCoords[1] + (Math.random() - 0.5) * 0.02
    ];

    const newInc: GasIncident = {
      id: `ID-DMK-2026-${String(incidents.length + 1).padStart(3, '0')}`,
      title: `${incidentType} - ${incidentLocation}`,
      type: incidentType,
      status: 'Aktif',
      priority: incidentType.includes('Rumah') || incidentType.includes('Gedung') ? 'Tinggi' : 'Sedang',
      location: `${incidentLocation}, ${reg?.name || 'Prov. Kaltim'}`,
      coords: coords,
      reporter: `${reporterName} (${reporterPhone || 'Call Center 112'})`,
      desc: incidentDesc || 'Laporan darurat diterima pos komando pusat pengendalian operasi.',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA',
      loss: 50000000,
      regionId: selectedRegion,
      responseTimeMinutes: 7
    };

    setTimeout(() => {
      onAddIncident(newInc);
      setIsSubmitting(false);
      setReporterName('');
      setReporterPhone('');
      setIncidentLocation('');
      setIncidentDesc('');
    }, 300);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            Dashboard Bidang Kebakaran Satuan Polisi Pamong Praja Provinsi Kalimantan Timur
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sistem Informasi Manajemen Pemadam Kebakaran & Kebencanaan terintegrasi 10 Kabupaten/Kota se-Kalimantan Timur.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl shrink-0 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-black tracking-wider text-slate-300">
            PUSDATIN AKTIF
          </span>
        </div>
      </div>

      {/* Top Filter & Official Reference Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {isOperator ? (
            // Operator is locked to their own region, no switching to other kab/kota
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">
                  {REGIONS_KALTIM.find(r => r.id === activeRegionId)?.name || activeRegionId}
                </span>
                <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-bold border border-slate-700/80">
                  Daerah Terkunci
                </span>
              </div>
            </div>
          ) : (
            // Admin Provinsi oversight
            <>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Layers className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold text-slate-400">Cakupan Data:</span>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDataScope('kaltim')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      dataScope === 'kaltim'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Seluruh Kaltim (10 Kab/Kota)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDataScope('kabkota')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      dataScope === 'kabkota'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Per Wilayah
                  </button>
                </div>
              </div>

              {dataScope === 'kabkota' && (
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Wilayah:</span>
                  <select
                    value={activeRegionId}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded border border-slate-800 focus:outline-none focus:border-rose-500"
                  >
                    {REGIONS_KALTIM.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.instansiType})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-400">Format Periode:</span>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => handlePeriodChange('SEMESTER_1')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  activePeriod === 'SEMESTER_1'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Format Lampiran II (Januari s.d. Juni)"
              >
                Semester I (Lampiran II)
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('SEMESTER_2')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  activePeriod === 'SEMESTER_2'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Format Lampiran III (Akumulasi Jan s.d. Des)"
              >
                Semester II (Lampiran III)
              </button>
            </div>
          </div>

          {/* Quick Realtime Cloud Refresh */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition shrink-0"
            title="Sinkronkan data secara realtime dari Cloud Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-500' : 'text-slate-400'}`} />
            <span>{isRefreshing ? 'Menyinkronkan...' : 'Sinkron Realtime Cloud'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
          <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Format Resmi: <strong>SE Sekda Prov. Kaltim No. 300.1/3326/SATPOL.PP-IV</strong></span>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncNotice && (
        <div className="bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSyncNotice(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Scope Status Notice Banner */}
      {dataScope === 'kabkota' ? (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg transition ${
          currentRegionReport.status === 'verified'
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : currentRegionReport.status === 'submitted'
              ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
              : currentRegionReport.status === 'revision_needed'
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              currentRegionReport.status === 'verified'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : currentRegionReport.status === 'submitted'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : currentRegionReport.status === 'revision_needed'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {currentRegionReport.status === 'verified' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : currentRegionReport.status === 'submitted' ? (
                <Clock className="w-5 h-5 text-blue-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Wilayah: {currentRegionInfo.name}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                  currentRegionReport.status === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : currentRegionReport.status === 'submitted'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : currentRegionReport.status === 'revision_needed'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {currentRegionReport.status === 'verified'
                    ? 'TERVERIFIKASI SAH OLEH SATPOL PP PROVINSI'
                    : currentRegionReport.status === 'submitted'
                      ? 'MENUNGGU VERIFIKASI PROVINSI'
                      : currentRegionReport.status === 'revision_needed'
                        ? 'PERLU PERBAIKAN / REVISI'
                        : 'STATUS DRAFT (BELUM DIAJUKAN)'}
                </span>
              </div>

              <p className="text-xs mt-1 text-slate-300">
                {currentRegionReport.status === 'verified' && (
                  <span>
                    Laporan telah disahkan resmi oleh <strong>{currentRegionReport.verifiedBy || 'Satpol PP Prov. Kaltim'}</strong> pada {new Date(currentRegionReport.verifiedAt || '').toLocaleString('id-ID')}. Seluruh data resmi masuk ke dalam rekapitulasi agregat provinsi.
                  </span>
                )}
                {currentRegionReport.status === 'submitted' && (
                  <span>
                    Operator daerah telah merampungkan pengisian dan mengajukan laporan ke Satpol PP Provinsi Kaltim.
                  </span>
                )}
                {currentRegionReport.status === 'revision_needed' && (
                  <span className="text-rose-300 font-semibold">
                    Catatan Revisi: "{currentRegionReport.revisionNotes || 'Periksa kembali kelengkapan instrumen pelaporan.'}"
                  </span>
                )}
                {currentRegionReport.status === 'draft' && (
                  <span>
                    Data masih berupa draf kerja di tingkat operator instansi ({currentRegionInfo.instansiName}).
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {userRole === 'admin_provinsi' && currentRegionReport.status !== 'verified' && (
              <button
                type="button"
                onClick={() => {
                  if (onSelectRegion) onSelectRegion(currentRegionInfo.id);
                  onNavigateToTab('laporan');
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verifikasi Laporan Ini</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (userRole === 'admin_provinsi') {
                  if (onSelectRegion) onSelectRegion(currentRegionInfo.id);
                  onNavigateToTab('laporan');
                } else {
                  onNavigateToTab('form_kabkota');
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{userRole === 'admin_provinsi' ? 'Buka Dokumen PDF' : 'Edit Formulir Daerah'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-white">Status Pelaporan Terverifikasi se-Kalimantan Timur</span>
              <p className="text-[11px] text-slate-400">
                Monitoring kepatuhan pengisian 10 Kabupaten/Kota sesuai batas waktu pelaporan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {verifiedCount} Terverifikasi Sah
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {submittedCount} Menunggu Verifikasi
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-medium text-[11px]">
              {draftCount + revisionCount} Draf / Belum Diajukan
            </span>
          </div>
        </div>
      )}

      {/* 6 Key Stat Cards: Strictly matching Lampiran II & III */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        
        {/* CARD 1: Total Personil (Format Bagian B & D) */}
        <div 
          onClick={() => setActiveModal('personil')}
          className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg group hover:translate-y-[-2px] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400/90 bg-rose-500/10 px-1.5 py-0.5 rounded">
                Bagian B & D
              </span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition">
                <Users className="w-4 h-4" />
              </div>
            </div>
            
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wide">
              Total Personil
            </h4>
            
            <div className="mt-2 mb-2">
              <p className="text-2xl font-black text-white tracking-tight">
                {stats.totalPersonil.toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">
                {stats.personilAparatur} Aparatur + {stats.relawan.toLocaleString('id-ID')} Redkar
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>PNS (Strukt/Fung/Pel):</span>
              <span className="text-white font-bold">{stats.pns}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>PPPK:</span>
              <span className="text-white font-bold">{stats.pppk}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Aparatur Non-ASN:</span>
              <span className="text-white font-bold">{stats.nonAsn}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Relawan (Redkar):</span>
              <span className="text-emerald-400 font-bold">{stats.relawan.toLocaleString('id-ID')} ({stats.desaRelawan} Desa)</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-0.5 border-t border-slate-800/40">
              <span>Sertifikasi Diklat:</span>
              <span className="text-amber-400 font-bold">{stats.sertifikasi} Org</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Total Kejadian (Format Bagian E & F) */}
        <div 
          onClick={() => setActiveModal('kejadian')}
          className="bg-slate-900/90 border border-slate-800 hover:border-orange-500/60 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg group hover:translate-y-[-2px] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400/90 bg-orange-500/10 px-1.5 py-0.5 rounded">
                Bagian E & F
              </span>
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wide">
              Total Kejadian
            </h4>
            
            <div className="mt-2 mb-2">
              <p className="text-2xl font-black text-white tracking-tight">
                {stats.totalKejadianSemua.toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-orange-400 font-bold">
                {stats.kebakaran} Kebakaran + {stats.rescue} Rescue
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Kebakaran (Bagian E):</span>
              <span className="text-white font-bold">{stats.kebakaran} Kasus</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SPM Response ≤15 mnt:</span>
              <span className="text-emerald-400 font-bold">{stats.response15} ({stats.spmRate}%)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Penyelamatan / Rescue (Bagian F):</span>
              <span className="text-blue-400 font-bold">{stats.rescue} Operasi</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Penyebab Utama:</span>
              <span className="text-slate-300 font-bold truncate max-w-[90px]">Listrik, Kompor</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-0.5 border-t border-slate-800/40">
              <span>Status Operasi:</span>
              <span className="text-rose-400 font-bold">{activeIncidents.length} Aktif Realtime</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Armada Siaga (Format Bagian C) */}
        <div 
          onClick={() => setActiveModal('armada')}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg group hover:translate-y-[-2px] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Bagian C: Sarpras
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wide">
              Armada Siaga
            </h4>
            
            <div className="mt-2 mb-2">
              <p className="text-2xl font-black text-white tracking-tight">
                {stats.totalArmada.toLocaleString('id-ID')} Unit
              </p>
              <span className="text-[10px] text-emerald-400 font-bold">
                {stats.armadaUtama} Armada Khusus Damkar
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Mobil Damkar Utama:</span>
              <span className="text-white font-bold">{stats.mobilDamkar} Unit</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mobil Tangki Suplai:</span>
              <span className="text-white font-bold">{stats.mobilTangki} Unit</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mobil Tangga (Ladder):</span>
              <span className="text-white font-bold">{stats.mobilTangga} Unit</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mobil Rescue:</span>
              <span className="text-white font-bold">{stats.mobilRescue} Unit</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-0.5 border-t border-slate-800/40">
              <span>Kendaraan Lain (R2/R3/R4):</span>
              <span className="text-slate-300 font-bold">{stats.kendaraanLainnya} Unit</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Total Posko (Format Bagian A) */}
        <div 
          onClick={() => setActiveModal('posko')}
          className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg group hover:translate-y-[-2px] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400/90 bg-blue-500/10 px-1.5 py-0.5 rounded">
                Bagian A: Posko
              </span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wide">
              Total Posko
            </h4>
            
            <div className="mt-2 mb-2">
              <p className="text-2xl font-black text-white tracking-tight">
                {stats.totalPosko.toLocaleString('id-ID')} Pos
              </p>
              <span className="text-[10px] text-blue-400 font-medium line-clamp-1">
                {stats.mako} Mako + {stats.posSektor} Sektor + {stats.posJaga} Pos Jaga
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Markas Komando (Mako):</span>
              <span className="text-white font-bold">{stats.mako} Unit</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pos Sektor Wilayah:</span>
              <span className="text-white font-bold">{stats.posSektor} Unit</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pos Jaga Standby:</span>
              <span className="text-white font-bold">{stats.posJaga} Unit</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Kelembagaan:</span>
              <span className="text-slate-300 font-bold truncate max-w-[90px]" title={stats.kelembagaanInfo}>
                {stats.kelembagaanInfo}
              </span>
            </div>
            <div className="flex justify-between text-slate-400 pt-0.5 border-t border-slate-800/40">
              <span>Standar Wilayah:</span>
              <span className="text-emerald-400 font-bold">SPM 15 Menit</span>
            </div>
          </div>
        </div>

        {/* CARD 5: Jiwa Selamat (Format Bagian G) */}
        <div 
          onClick={() => setActiveModal('jiwa')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg group hover:translate-y-[-2px] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded">
                Bagian G: Korban
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wide">
              Jiwa Selamat
            </h4>
            
            <div className="mt-2 mb-2">
              <p className="text-2xl font-black text-white tracking-tight">
                {stats.jiwaSelamat.toLocaleString('id-ID')} Jiwa
              </p>
              <span className="text-[10px] text-emerald-400 font-bold">
                Berhasil Diselamatkan Petugas
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Diselamatkan:</span>
              <span className="text-emerald-400 font-bold">{stats.jiwaSelamat} Jiwa</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Meninggal Dunia:</span>
              <span className={`font-bold ${stats.meninggal > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {stats.meninggal} Jiwa
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Luka Bakar:</span>
              <span className="text-amber-400 font-bold">{stats.lukaBakar} Orang</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Luka Fisik Lain:</span>
              <span className="text-slate-300 font-bold">{stats.lukaFisik} Orang</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-0.5 border-t border-slate-800/40">
              <span>Tingkat Keberhasilan:</span>
              <span className="text-emerald-400 font-bold">
                {stats.jiwaSelamat + stats.meninggal > 0 
                  ? Math.round((stats.jiwaSelamat / (stats.jiwaSelamat + stats.meninggal)) * 100)
                  : 100}%
              </span>
            </div>
          </div>
        </div>

        {/* CARD 6: Kerugian Fisik (Format Bagian G) */}
        <div 
          onClick={() => setActiveModal('kerugian')}
          className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg group hover:translate-y-[-2px] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400/90 bg-rose-500/10 px-1.5 py-0.5 rounded">
                Bagian G: Kerugian
              </span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wide">
              Kerugian Fisik
            </h4>
            
            <div className="mt-2 mb-2">
              <p className="text-2xl font-black text-white tracking-tight">
                {formatRupiahSingkat(stats.kerugianFisik)}
              </p>
              <span className="text-[10px] text-emerald-400 font-bold">
                Aset Selamat {formatRupiahSingkat(stats.asetSelamat)}
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Taksiran Kerugian:</span>
              <span className="text-rose-400 font-bold">{formatRupiahSingkat(stats.kerugianFisik)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Aset Diselamatkan:</span>
              <span className="text-emerald-400 font-bold">{formatRupiahSingkat(stats.asetSelamat)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Rasio Perlindungan:</span>
              <span className="text-emerald-400 font-bold">{stats.rasioAset}% Terlindungi</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Penetapan Nilai:</span>
              <span className="text-slate-300 font-bold">BA Lapangan</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-0.5 border-t border-slate-800/40">
              <span>Evaluasi Kerugian:</span>
              <span className="text-amber-400 font-bold">Format Bagian G</span>
            </div>
          </div>
        </div>

      </div>

      {/* Official Lampiran II & III Detail Breakdown Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    SE Sekda No. 300.1/3326/SATPOL.PP-IV
                  </span>
                  <span className="text-xs text-slate-400">
                    {activePeriod === 'SEMESTER_1' ? 'Lampiran II (Semester I)' : 'Lampiran III (Semester II)'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {activeModal === 'personil' && 'Rincian Data Bagian B & D: Sumber Daya Manusia (SDM) & Redkar'}
                  {activeModal === 'kejadian' && 'Rincian Data Bagian E & F: Laporan Kebakaran & Operasi Penyelamatan (Rescue)'}
                  {activeModal === 'armada' && 'Rincian Data Bagian C: Sarana dan Prasarana Armada Operasional'}
                  {activeModal === 'posko' && 'Rincian Data Bagian A: Kapasitas Kelembagaan & Persebaran Pos'}
                  {activeModal === 'jiwa' && 'Rincian Data Bagian G: Korban Jiwa Yang Berhasil Diselamatkan & Terdampak'}
                  {activeModal === 'kerugian' && 'Rincian Data Bagian G: Taksiran Kerugian Aset & Aset Berhasil Diselamatkan'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cakupan: {stats.scopeLabel}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {activeModal === 'personil' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Total PNS Damkar</span>
                      <span className="text-xl font-black text-white">{stats.pns}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Struktural, Fungsional, Pelaksana</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Total PPPK</span>
                      <span className="text-xl font-black text-white">{stats.pppk}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Penuh & Paruh Waktu</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Non-ASN Damkar</span>
                      <span className="text-xl font-black text-white">{stats.nonAsn}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Aparatur Penunjang Operasi</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Relawan Redkar</span>
                      <span className="text-xl font-black text-emerald-400">{stats.relawan.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{stats.desaRelawan} Desa / Kelurahan</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      Sertifikasi Diklat Teknis Pemadam Kebakaran (Bagian B Form Resmi)
                    </h5>
                    <p className="text-slate-400 text-xs mb-3">
                      Total <strong>{stats.sertifikasi} personil</strong> telah memiliki kompetensi bersertifikat nasional:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[11px]">Instruktur Damkar</span>
                        <span className="font-bold text-white text-sm">Tersertifikasi</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[11px]">Inspektur Kebakaran</span>
                        <span className="font-bold text-white text-sm">Tersertifikasi</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[11px]">Medical First Resp.</span>
                        <span className="font-bold text-white text-sm">Tersertifikasi</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[11px]">Sub-Rescue Teknis</span>
                        <span className="font-bold text-white text-sm">Tersertifikasi</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'kejadian' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Laporan Kebakaran (Bagian E)</span>
                      <span className="text-2xl font-black text-rose-500">{stats.kebakaran}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Penanganan Kebakaran Terdata</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Kepatuhan SPM 15 Menit</span>
                      <span className="text-2xl font-black text-emerald-400">{stats.response15} ({stats.spmRate}%)</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Response Time di Bawah 15 Menit</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Operasi Rescue (Bagian F)</span>
                      <span className="text-2xl font-black text-blue-400">{stats.rescue}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Penyelamatan & Evakuasi Non-Kebakaran</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-white mb-2">Klasifikasi Operasi Penyelamatan (Bagian F Lampiran II/III):</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">1. Kecelakaan Transportasi</div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">2. Penyelamatan di Air (Water Rescue)</div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">3. Penanganan Hewan Berbahaya (Animal Rescue)</div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">4. Penyelamatan di Ketinggian</div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">5. Evakuasi Pohon Tumbang</div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">6. Pelepasan Cincin & Lain-lain</div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'armada' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Mobil Damkar</span>
                      <span className="text-xl font-black text-white">{stats.mobilDamkar}</span>
                      <span className="text-[10px] text-slate-500 block">Unit Utama</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Mobil Tangki</span>
                      <span className="text-xl font-black text-white">{stats.mobilTangki}</span>
                      <span className="text-[10px] text-slate-500 block">Suplai Air</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Mobil Tangga</span>
                      <span className="text-xl font-black text-white">{stats.mobilTangga}</span>
                      <span className="text-[10px] text-slate-500 block">High Ladder</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Mobil Rescue</span>
                      <span className="text-xl font-black text-white">{stats.mobilRescue}</span>
                      <span className="text-[10px] text-slate-500 block">Penyelamatan</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Kendaraan Lain</span>
                      <span className="text-xl font-black text-white">{stats.kendaraanLainnya}</span>
                      <span className="text-[10px] text-slate-500 block">R2/R3/R4 Ops</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-slate-300">
                    <p className="leading-relaxed">
                      Sesuai format <strong>Bagian C (Data Sarana dan Prasarana)</strong>, seluruh armada di atas adalah unit siap gerak pada posko induk dan pos sektor di wilayah 10 Kabupaten/Kota se-Kalimantan Timur.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'posko' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Jumlah Mako (Pusat Komando)</span>
                      <span className="text-2xl font-black text-white">{stats.mako} Mako</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Pusat Pengendalian Operasi</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Jumlah Pos Sektor</span>
                      <span className="text-2xl font-black text-white">{stats.posSektor} Sektor</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Pos Distribusi Kewilayahan</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Jumlah Pos Jaga / Pelayanan</span>
                      <span className="text-2xl font-black text-white">{stats.posJaga} Pos</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Pos Penunjang Jangkauan SPM</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-slate-300">
                    <p className="leading-relaxed">
                      Format <strong>Bagian A (Data Kapasitas Kelembagaan & Data Pos)</strong> mencakup kelembagaan Dinas Pemadam Kebakaran dan Penyelamatan (Tipe A/B/C) atau Satuan Polisi Pamong Praja Provinsi/Kabupaten/Kota.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'jiwa' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Jiwa Diselamatkan</span>
                      <span className="text-2xl font-black text-emerald-400">{stats.jiwaSelamat}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Berhasil Dievakuasi</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Meninggal Dunia</span>
                      <span className="text-2xl font-black text-rose-400">{stats.meninggal}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Korban Jiwa Fatality</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Korban Luka Bakar</span>
                      <span className="text-2xl font-black text-amber-400">{stats.lukaBakar}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Luka Bakar Ringan/Berat</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Luka Fisik Lainnya</span>
                      <span className="text-2xl font-black text-slate-300">{stats.lukaFisik}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Tertimpa Puing/Trauma</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-slate-300">
                    <p className="leading-relaxed">
                      Sesuai <strong>Bagian G (Data Korban Kebakaran dan Kerugian Materi)</strong>, prioritas utama setiap operasi adalah perlindungan korban jiwa (Life Safety Priority) dengan response time di bawah 15 menit.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'kerugian' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Taksiran Kerugian Aset</span>
                      <span className="text-xl font-black text-rose-500">{formatRupiah(stats.kerugianFisik)}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Bangunan, Perabot & Fasilitas Terbakar</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Aset Berhasil Diselamatkan</span>
                      <span className="text-xl font-black text-emerald-400">{formatRupiah(stats.asetSelamat)}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Harta Benda & Bangunan Terselamatkan</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Rasio Efisiensi Penyelamatan</span>
                      <span className="text-2xl font-black text-emerald-400">{stats.rasioAset}%</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Dari Total Aset Terpapar Api</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-slate-300">
                    <p className="leading-relaxed">
                      Format <strong>Bagian G (Taksiran Kerugian Aset)</strong> dihitung berdasarkan estimasi nilai bangunan (NJOP/Standar PU) dan inventaris barang sesuai Berita Acara Pemeriksaan Lapangan oleh Penyidik Pegawai Negeri Sipil (PPNS) Damkar.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Data terintegrasi realtime dengan database pelaporan 10 Kab/Kota.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    if (userRole === 'admin_provinsi') {
                      onNavigateToTab('laporan');
                    } else {
                      onNavigateToTab('form_kabkota');
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition"
                >
                  <span>{userRole === 'admin_provinsi' ? 'Buka Formulir Laporan Resmi' : 'Buka Instrumen Pengisian Data'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10 Kabupaten/Kota Real-time Status & Oversight Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Status Keterisian & Verifikasi 10 Kab/Kota se-Kaltim (Real-Time)
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {verifiedCount} dari 10 Wilayah Sah
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantauan langsung input data operator Kabupaten/Kota dan status verifikasi resmi Satpol PP Prov. Kaltim.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-500' : 'text-slate-400'}`} />
              <span>{isRefreshing ? 'Menyinkron...' : 'Sinkron Cloud'}</span>
            </button>
            {userRole === 'admin_provinsi' && (
              <button
                type="button"
                onClick={() => onNavigateToTab('laporan')}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Buka Menu Verifikasi Provinsi</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Kabupaten / Kota</th>
                <th className="py-3 px-3 text-center">Status Verifikasi</th>
                <th className="py-3 px-3 text-center">SDM Personel</th>
                <th className="py-3 px-3 text-center">Armada Damkar</th>
                <th className="py-3 px-3 text-center">Kebakaran & SPM 15m</th>
                <th className="py-3 px-3 text-center">Rescue</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {regionReportsList.map((item, idx) => {
                const isSelected = activeRegionId === item.region.id && dataScope === 'kabkota';
                const isVerified = item.report.status === 'verified';
                const isSubmitted = item.report.status === 'submitted';
                const isRevision = item.report.status === 'revision_needed';

                return (
                  <tr 
                    key={item.region.id}
                    className={`hover:bg-slate-800/50 transition cursor-pointer ${
                      isSelected ? 'bg-rose-950/20 border-l-2 border-rose-500' : ''
                    }`}
                    onClick={() => {
                      if (!isOperator) {
                        setDataScope('kabkota');
                        setActiveRegionId(item.region.id);
                        if (onSelectRegion) onSelectRegion(item.region.id);
                      }
                    }}
                  >
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{item.region.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {item.region.instansiName}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isVerified
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : isSubmitted
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                            : isRevision
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Terverifikasi Sah</span>
                          </>
                        ) : isSubmitted ? (
                          <>
                            <Clock className="w-3 h-3 text-blue-400" />
                            <span>Menunggu Verifikasi</span>
                          </>
                        ) : isRevision ? (
                          <>
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            <span>Perlu Revisi</span>
                          </>
                        ) : (
                          <span>Draft</span>
                        )}
                      </span>
                      {item.report.lastUpdated && item.report.lastUpdated !== '1970-01-01T00:00:00.000Z' && (
                        <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                          {new Date(item.report.lastUpdated).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span className="text-white font-bold">{item.totalSdm}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {item.report.bagianB.totalPns}P / {item.report.bagianB.totalPppk}K / {item.report.bagianB.nonAsn}N
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span className="text-white font-bold">{item.totalArmada}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {item.report.bagianC.mobilDamkar} Damkar / {item.report.bagianC.mobilTangki} Tangki
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span className="text-rose-400 font-bold">{item.report.bagianE.totalKejadian}</span>
                      <span className="text-[10px] text-emerald-400 block font-semibold">
                        SPM {item.spmRate}% ({item.report.bagianE.response15Menit})
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span className="text-blue-400 font-bold">{item.report.bagianF.totalOperasi}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {item.report.bagianG.jiwaSelamat} Selamat
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {userRole === 'admin_provinsi' ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectRegion) onSelectRegion(item.region.id);
                            onNavigateToTab('laporan');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 ${
                            !isVerified
                              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {!isVerified ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verifikasi</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Dokumen PDF</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectRegion) onSelectRegion(item.region.id);
                            onNavigateToTab('form_kabkota');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition inline-flex items-center gap-1"
                        >
                          <span>Rincian</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map & Quick Report Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2/3 width): Spatial Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Peta Spasial Operasi Kebakaran Kaltim
              </h4>
              <p className="text-xs text-slate-400">
                Monitoring real-time sebaran insiden aktif, pemukiman, dan operasi rescue.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {['Semua', 'Kebakaran Rumah', 'Bangunan Gedung / Komersial', 'Penyelamatan & Evakuasi'].map((filterName) => (
                <button
                  key={filterName}
                  type="button"
                  onClick={() => setMapFilter(filterName)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                    mapFilter === filterName
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filterName === 'Bangunan Gedung / Komersial' ? 'Gedung' : filterName === 'Penyelamatan & Evakuasi' ? 'Rescue' : filterName}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <OperationsMap
            incidents={incidents}
            activeFilter={mapFilter}
            flyToCoords={flyToCoords}
          />

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                Insiden Aktif (Pulsing)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Monitoring Bara
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Selesai / Terkendali
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Koordinat Datum: WGS84 Prov. Kaltim
            </span>
          </div>

        </div>

        {/* Right (1/3 width): Quick Incident Report Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Form Laporan Cepat
              </h4>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                DISPATCH 112
              </span>
            </div>

            <form onSubmit={handleSubmitQuickReport} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Nama Pelapor
                </label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Contoh: Burhan (Warga)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Jenis Kejadian
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-2.5 py-2 text-white focus:outline-none transition text-xs"
                  >
                    <option value="Kebakaran Rumah">Kebakaran Rumah / Pemukiman</option>
                    <option value="Kebakaran Bangunan Publik">Bangunan Gedung / Komersial</option>
                    <option value="Penyelamatan & Evakuasi">Penyelamatan / Rescue</option>
                    <option value="Kebocoran Gas">Kebocoran Gas / B3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Wilayah Kab/Kota
                  </label>
                  {isOperator ? (
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-bold text-xs flex items-center justify-between">
                      <span>{REGIONS_KALTIM.find(r => r.id === activeRegionId)?.name || activeRegionId}</span>
                      <span className="text-[10px] text-amber-400 font-semibold">Terkunci</span>
                    </div>
                  ) : (
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-2.5 py-2 text-white focus:outline-none transition text-xs"
                    >
                      {REGIONS_KALTIM.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Lokasi / Alamat Spesifik
                </label>
                <input
                  type="text"
                  required
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  placeholder="Contoh: Jl. Pelita 7 Gang 3, Kel. Sambutan"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Keterangan Kejadian
                </label>
                <textarea
                  rows={2}
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Sumber api, jumlah bangunan terancam, armada yang dibutuhkan..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 mt-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirim Laporan...' : 'Luncurkan Laporan Kejadian'}</span>
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <span>Terhubung ke Sistem Dispatcher 10 Kab/Kota Kaltim</span>
          </div>

        </div>

      </div>

      {/* Bottom Section: Real-time Activity Feed & Incident Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Real-time Activity Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-orange-400" />
              Aktivitas Real-Time & Log Kejadian
            </h4>
            <span className="text-xs text-slate-400 font-mono">Live Sync</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {incidents.slice(0, 5).map((inc) => (
              <div 
                key={inc.id}
                className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-start justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      inc.status === 'Aktif' 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                        : inc.status === 'Monitoring'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {inc.status}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {inc.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    📍 {inc.location}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {inc.desc}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {inc.time}
                  </span>
                  <span className="text-[10px] text-rose-400 font-bold block mt-1">
                    SPM {inc.responseTimeMinutes || 8} mnt
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SPM Compliance & Category Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Kepatuhan SPM 15 Menit & Kategori
            </h4>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {stats.spmRate}% Standar SPM Terpenuhi
            </span>
          </div>

          {/* SPM Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1.5">
              <span>Tingkat Response Time di bawah 15 Menit</span>
              <span className="text-emerald-400 font-bold">{stats.spmRate}% ({stats.response15} dari {stats.kebakaran} Kejadian Kebakaran)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, stats.spmRate))}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Sesuai Permendagri No. 114 Tahun 2018 tentang SPM Sub-Urusan Kebakaran (Maksimal 15 Menit sejak laporan diterima Posko).
            </p>
          </div>

          {/* Category breakdown bars */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>Kebakaran Pemukiman / Bangunan</span>
                <span className="text-slate-400 font-bold">{Math.round(stats.kebakaran * 0.7)} Kasus Terdata</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>Kebakaran Gedung, Industri & Komersial</span>
                <span className="text-slate-400 font-bold">{Math.round(stats.kebakaran * 0.3)} Kasus Terdata</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>Operasi Penyelamatan (Rescue & Non-Kebakaran)</span>
                <span className="text-slate-400 font-bold">{stats.rescue} Operasi Terdata</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (stats.rescue / (stats.totalKejadianSemua || 1)) * 100)}%` }}></div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

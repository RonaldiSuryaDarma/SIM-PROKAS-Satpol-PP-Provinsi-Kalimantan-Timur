import React from 'react';
import { 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Server, 
  GraduationCap, 
  FileText, 
  Building2, 
  RefreshCw,
  UserCheck,
  MapPin
} from 'lucide-react';
import { UserRole, ReportPeriod, SyncState } from '../types';
import { REGIONS_KALTIM } from '../data/regions';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  period: ReportPeriod;
  setPeriod: (p: ReportPeriod) => void;
  syncState: SyncState;
  onForceSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  selectedRegionId,
  setSelectedRegionId,
  period,
  setPeriod,
  syncState,
  onForceSync
}) => {
  const currentRegion = REGIONS_KALTIM.find(r => r.id === selectedRegionId) || REGIONS_KALTIM[0];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 print:hidden border-b border-slate-800">
      {/* Top Bar: Identity & Quick Switchers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-red-600 to-rose-600 flex items-center justify-center shadow-md shadow-red-900/30 ring-2 ring-amber-400/30">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">SIMPROKAS</span>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  PROV. KALTIM
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Tahun 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                Sistem Informasi Profil & Pelaporan Damkar se-Kalimantan Timur
              </p>
            </div>
          </div>

          {/* Right Controls: Role Switcher & Sync State */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            
            {/* Periode Switcher */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setPeriod('SEMESTER_1')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  period === 'SEMESTER_1'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Laporan Kinerja Semester I (Format Lampiran II Surat Edaran)"
              >
                Semester I (Lamp. II)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('SEMESTER_2')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  period === 'SEMESTER_2'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Laporan Kinerja Semester II Akumulasi Tahunan (Format Lampiran III Surat Edaran)"
              >
                Semester II (Lamp. III)
              </button>
            </div>

            {/* BIMTEK Role Switcher - Critical for testing / demonstration */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Hak Akses:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent font-semibold text-amber-300 border-none focus:ring-0 focus:outline-none cursor-pointer pr-2"
                title="Ganti peran pengguna untuk simulasi Bimtek"
              >
                <option value="operator_kabkota" className="bg-slate-900 text-white">
                  Operator Kab/Kota
                </option>
                <option value="admin_provinsi" className="bg-slate-900 text-white">
                  Satpol PP Prov. Kaltim (Admin)
                </option>
                <option value="eksekutif" className="bg-slate-900 text-white">
                  Pimpinan / Eksekutif
                </option>
              </select>
            </div>

            {/* Region Selector (Active when operator) */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="bg-transparent font-medium text-white border-none focus:ring-0 focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                {REGIONS_KALTIM.map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Realtime Sync Status Indicator */}
            <button
              onClick={onForceSync}
              title="Status sinkronisasi data instan. Klik untuk memaksa sinkronisasi ulang."
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition border border-slate-700 text-slate-300"
            >
              {syncState.status === 'saving' ? (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-amber-300 font-medium">Menyimpan...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400 font-medium hidden sm:inline">Tersinkron 0ms</span>
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-950/60 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Dashboard Wilayah</span>
          </button>

          <button
            onClick={() => setCurrentTab('form')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentTab === 'form'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Formulir Laporan (A - H)</span>
            {userRole === 'operator_kabkota' && (
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded text-amber-200">
                {currentRegion.name}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('pdf_preview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentTab === 'pdf_preview'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Dokumen Cetak (Lampiran I, II, III)</span>
          </button>

          <button
            onClick={() => setCurrentTab('provinsi')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentTab === 'provinsi'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Verifikasi & Rekap Provinsi</span>
            {userRole === 'admin_provinsi' && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('bimtek')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentTab === 'bimtek'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Panduan & Latihan BIMTEK</span>
          </button>

          <button
            onClick={() => setCurrentTab('diskominfo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentTab === 'diskominfo'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Migrasi & Hosting Diskominfo</span>
            <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
              SPBE
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

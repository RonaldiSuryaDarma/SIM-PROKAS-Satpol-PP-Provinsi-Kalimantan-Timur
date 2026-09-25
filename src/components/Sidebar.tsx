import React from 'react';
import { 
  Flame, 
  Users, 
  Truck, 
  ShieldAlert, 
  Printer, 
  TrendingUp, 
  ClipboardEdit, 
  FileText, 
  GraduationCap, 
  Server,
  X,
  CheckCircle2,
  Lock,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { UserRole, UserSession } from '../types';

export type GasTabType = 
  | 'dashboard'
  | 'personel'
  | 'kejadian'
  | 'kendaraan'
  | 'eksekutif'
  | 'laporan'
  | 'form_kabkota'
  | 'bimtek_diskominfo'
  | 'manajemen_akun';

interface SidebarProps {
  currentTab: GasTabType;
  onSelectTab: (tab: GasTabType) => void;
  isOpen: boolean;
  onClose: () => void;
  personnelCount?: number;
  activeIncidentsCount?: number;
  readyVehiclesCount?: number;
  userRole: UserRole;
  userSession?: UserSession | null;
  onChangeUserRole?: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  personnelCount = 5,
  activeIncidentsCount = 3,
  readyVehiclesCount = 5,
  userRole,
  userSession,
  onChangeUserRole
}) => {
  const handleItemClick = (tab: GasTabType) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 bg-slate-900 text-white w-80 z-50 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col border-r border-slate-800 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-600 via-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-600/30 beacon-pulse shrink-0">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white leading-none">
                  SIM-PROKAS
                </h1>
                <span className="text-[10px] font-extrabold text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded border border-orange-500/30 whitespace-nowrap">
                  Prov. Kaltim
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtitle di bawah Logo SIMPROKAS - Rapi, Sejajar, Tidak Terpotong */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80">
            <p className="text-xs font-semibold text-slate-300 leading-snug tracking-wide">
              Bidang Kebakaran Satpol PP Provinsi Kalimantan Timur
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
          
          <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
            MENU UTAMA
          </p>

          <button
            type="button"
            onClick={() => handleItemClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group text-left ${
              currentTab === 'dashboard'
                ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-sm font-bold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <TrendingUp className={`w-4 h-4 shrink-0 transition-colors ${
              currentTab === 'dashboard' ? 'text-rose-500' : 'group-hover:text-rose-400'
            }`} />
            <span className="font-semibold text-sm">Dashboard Operasional</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('personel')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group text-left ${
              currentTab === 'personel'
                ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-sm font-bold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Users className={`w-4 h-4 shrink-0 transition-colors ${
              currentTab === 'personel' ? 'text-rose-500' : 'group-hover:text-rose-400'
            }`} />
            <span className="font-semibold text-sm">Manajemen Personil</span>
            <span className="ml-auto bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {personnelCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('kejadian')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group text-left ${
              currentTab === 'kejadian'
                ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-sm font-bold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Flame className={`w-4 h-4 shrink-0 transition-colors ${
              currentTab === 'kejadian' ? 'text-rose-500' : 'group-hover:text-rose-400'
            }`} />
            <span className="font-semibold text-sm">Manajemen Kejadian</span>
            <span className="ml-auto bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {activeIncidentsCount} AKTIF
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('kendaraan')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group text-left ${
              currentTab === 'kendaraan'
                ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-sm font-bold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Truck className={`w-4 h-4 shrink-0 transition-colors ${
              currentTab === 'kendaraan' ? 'text-rose-500' : 'group-hover:text-rose-400'
            }`} />
            <span className="font-semibold text-sm">Manajemen Kendaraan</span>
            <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              {readyVehiclesCount} SIAP
            </span>
          </button>

          <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-6 mb-2">
            RISPK & MANAJERIAL
          </p>

          <button
            type="button"
            onClick={() => handleItemClick('eksekutif')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group text-left ${
              currentTab === 'eksekutif'
                ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-sm font-bold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 shrink-0 transition-colors ${
              currentTab === 'eksekutif' ? 'text-rose-500' : 'group-hover:text-rose-400'
            }`} />
            <span className="font-semibold text-sm">Ringkasan Eksekutif</span>
          </button>

          {/* Menu Laporan Resmi (SE Sekda) - Dihapus pada Akun Operator Kab/Kota, Hanya Muncul untuk Super Admin Provinsi */}
          {userRole === 'admin_provinsi' && (
            <button
              type="button"
              onClick={() => handleItemClick('laporan')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group text-left ${
                currentTab === 'laporan'
                  ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-sm font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Printer className={`w-4 h-4 shrink-0 transition-colors ${
                currentTab === 'laporan' ? 'text-rose-500' : 'group-hover:text-rose-400'
              }`} />
              <span className="font-semibold text-sm">Laporan Resmi (SE Sekda)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 ml-auto" />
            </button>
          )}

          <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-6 mb-2">
            INSTRUMEN 10 KAB/KOTA
          </p>

          <button
            type="button"
            onClick={() => handleItemClick('form_kabkota')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group text-left ${
              currentTab === 'form_kabkota'
                ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-sm font-bold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <ClipboardEdit className={`w-4 h-4 shrink-0 transition-colors ${
              currentTab === 'form_kabkota' ? 'text-rose-500' : 'group-hover:text-rose-400'
            }`} />
            <span className="font-semibold text-sm">Pengisian Data Kab/Kota</span>
          </button>

          {/* Menu Khusus Super Admin & Inisiator Provinsi */}
          {userRole === 'admin_provinsi' && (
            <>
              <p className="px-3 text-[10px] font-extrabold text-amber-500 uppercase tracking-widest mt-6 mb-2">
                SUPER ADMIN & INISIATOR
              </p>

              <button
                type="button"
                onClick={() => handleItemClick('manajemen_akun')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group text-left ${
                  currentTab === 'manajemen_akun'
                    ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-sm font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <KeyRound className={`w-4 h-4 shrink-0 transition-colors ${
                  currentTab === 'manajemen_akun' ? 'text-rose-500' : 'group-hover:text-rose-400'
                }`} />
                <span className="font-semibold text-sm">Manajemen Akun Operator</span>
                <span className="ml-auto bg-amber-500/20 text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-500/30">
                  SUPER
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('bimtek_diskominfo')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group text-left ${
                  currentTab === 'bimtek_diskominfo'
                    ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-sm font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Server className={`w-4 h-4 shrink-0 transition-colors ${
                  currentTab === 'bimtek_diskominfo' ? 'text-rose-500' : 'group-hover:text-rose-400'
                }`} />
                <span className="font-semibold text-sm">Bimtek & Diskominfo</span>
              </button>
            </>
          )}

        </nav>

        {/* Profile Card at bottom - Rapi, Tidak Terpotong, Tanpa Logo Huruf */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 shrink-0">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                userSession?.role === 'admin_provinsi'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}>
                {userSession?.role === 'admin_provinsi' ? 'Super Admin Provinsi' : 'Operator Kab/Kota'}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
              </span>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white leading-snug break-words">
                {userSession?.userName || (userRole === 'admin_provinsi' ? 'Satpol PP Provinsi Kalimantan Timur' : 'Operator Daerah')}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight break-words font-medium">
                {userSession?.instansi || (userRole === 'admin_provinsi' ? 'Pusat Pengendali Operasi Penyelamatan' : 'Kabupaten / Kota')}
              </p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};

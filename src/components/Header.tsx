import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Radio, 
  Bell, 
  Calendar, 
  MapPin, 
  Layers, 
  Clock,
  Sparkles,
  ShieldAlert,
  Building2, 
  ChevronDown,
  Database,
  LogOut,
  Lock
} from 'lucide-react';
import { ReportPeriod, UserRole, UserSession } from '../types';
import { REGIONS_KALTIM } from '../data/regions';

interface HeaderProps {
  onToggleSidebar: () => void;
  onTriggerSimulation: () => void;
  selectedRegionId: string;
  onSelectRegion: (id: string) => void;
  period: ReportPeriod;
  onSelectPeriod: (p: ReportPeriod) => void;
  userRole: UserRole;
  userSession?: UserSession | null;
  onLogout?: () => void;
  onChangeUserRole?: (role: UserRole) => void;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onTriggerSimulation,
  selectedRegionId,
  onSelectRegion,
  period,
  onSelectPeriod,
  userRole,
  userSession,
  onLogout,
  unreadAlertsCount = 3
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // WITA is UTC+8
      const witaString = now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateString = now.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Makassar',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setTimeStr(`${witaString} WITA • ${dateString}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeRegion = REGIONS_KALTIM.find(r => r.id === selectedRegionId) || REGIONS_KALTIM[0];

  return (
    <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 sticky top-0 shadow-md">
      
      {/* Left: Mobile Toggle & System Title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/80 border border-slate-700 transition"
          aria-label="Buka Menu Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5 leading-none">
              <span>SIM-PROKAS</span>
            </h2>
            <span className="text-[10px] font-extrabold text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded border border-orange-500/30 whitespace-nowrap">
              Prov. Kaltim
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight mt-1 hidden sm:block whitespace-normal">
            Bidang Kebakaran Satpol PP Provinsi Kalimantan Timur
          </span>
        </div>
      </div>

      {/* Center/Right: Period, Region, Simulation Button, Clock, Alerts */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* Period Switcher */}
        <div className="hidden xl:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onSelectPeriod('SEMESTER_1')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              period === 'SEMESTER_1'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sem. I (Lampiran II)
          </button>
          <button
            type="button"
            onClick={() => onSelectPeriod('SEMESTER_2')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              period === 'SEMESTER_2'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sem. II (Lampiran III)
          </button>
        </div>

        {/* Region Indicator / Switcher */}
        {userRole === 'operator_kabkota' ? (
          // Operator Daerah is strictly locked to their own assigned Kab/Kota
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="font-bold text-slate-200">{activeRegion.name}</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-orange-400" />
              Daerah
            </span>
          </div>
        ) : (
          // Admin Satpol PP Provinsi has full oversight of all 10 regions
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <select
              value={selectedRegionId}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
            >
              {REGIONS_KALTIM.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Simulation Alert Trigger Button - HANYA untuk Admin Provinsi, HAPUS pada Akun Operator */}
        {userRole === 'admin_provinsi' && (
          <button
            type="button"
            onClick={onTriggerSimulation}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-gradient-to-r from-rose-600/25 to-orange-600/25 hover:from-rose-600 hover:to-orange-500 border border-rose-500/40 hover:border-rose-500 text-rose-400 hover:text-white rounded-xl text-xs font-extrabold transition-all shadow-md hover:shadow-rose-600/30"
            title="Klik untuk memicu simulasi insiden kebakaran darurat baru"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            <span className="hidden sm:inline">SIMULASI KEJADIAN BARU</span>
            <span className="sm:hidden">SIMULASI</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative p-2 text-slate-400 hover:text-white transition cursor-pointer bg-slate-800/60 rounded-xl border border-slate-700/60">
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-[9px] font-black border-2 border-slate-900 rounded-full flex items-center justify-center text-white animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </div>

        {/* Real-time Clock (WITA) */}
        <div className="hidden lg:flex flex-col items-end border-l border-slate-800 pl-3.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs font-bold">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>{timeStr || '12:00:00 WITA'}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <Database className="w-2.5 h-2.5 text-emerald-400" />
            Firestore Cloud Aktif
          </span>
        </div>

        {/* Keluar Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition shadow-sm group"
            title="Keluar dari sistem SIM-PROKAS"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition" />
            <span>Keluar</span>
          </button>
        )}

      </div>

    </header>
  );
};

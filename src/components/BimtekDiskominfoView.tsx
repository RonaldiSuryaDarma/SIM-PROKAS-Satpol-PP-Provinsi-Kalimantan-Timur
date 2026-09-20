import React, { useState } from 'react';
import { GraduationCap, Server } from 'lucide-react';
import { BimtekGuide } from './BimtekGuide';
import { DiskominfoMigrationHub } from './DiskominfoMigrationHub';

interface BimtekDiskominfoViewProps {
  onStartSimulation: () => void;
}

export const BimtekDiskominfoView: React.FC<BimtekDiskominfoViewProps> = ({
  onStartSimulation
}) => {
  const [subTab, setSubTab] = useState<'bimtek' | 'diskominfo'>('bimtek');

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm print:hidden">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Bimtek & Kesiapan Hosting Diskominfo
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Panduan teknis pengisian 10 Kab/Kota serta infrastruktur server Pemerintah Provinsi Kalimantan Timur.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSubTab('bimtek')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-extrabold transition ${
              subTab === 'bimtek'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Panduan Bimtek 2026</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('diskominfo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-extrabold transition ${
              subTab === 'diskominfo'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Hosting & Domain Diskominfo</span>
          </button>
        </div>
      </div>

      {/* Subtab Content */}
      {subTab === 'bimtek' && (
        <BimtekGuide onStartSimulation={onStartSimulation} />
      )}

      {subTab === 'diskominfo' && (
        <DiskominfoMigrationHub />
      )}

    </div>
  );
};

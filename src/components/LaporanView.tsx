import React, { useState } from 'react';
import { OfficialPdfPreview } from './OfficialPdfPreview';
import { ProvinsiVerification } from './ProvinsiVerification';
import { ReportPeriod, UserRole } from '../types';
import { FileCheck, Printer } from 'lucide-react';

interface LaporanViewProps {
  regionId: string;
  period: ReportPeriod;
  userRole?: UserRole;
  onSelectRegion?: (regionId: string) => void;
  onNavigateToForm?: () => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  regionId,
  period,
  userRole = 'admin_provinsi',
  onSelectRegion,
  onNavigateToForm
}) => {
  const [subTab, setSubTab] = useState<'verifikasi' | 'cetak_pdf'>('verifikasi');

  const handleGoToPdfForRegion = (selectedId: string) => {
    if (onSelectRegion) onSelectRegion(selectedId);
    setSubTab('cetak_pdf');
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation for Super Admin */}
      {userRole === 'admin_provinsi' && (
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md">
          <button
            type="button"
            onClick={() => setSubTab('verifikasi')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              subTab === 'verifikasi'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Pusat Verifikasi & Rekap 10 Kab/Kota</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('cetak_pdf')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              subTab === 'cetak_pdf'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi PDF SE Sekda</span>
          </button>
        </div>
      )}

      {subTab === 'verifikasi' && userRole === 'admin_provinsi' ? (
        <ProvinsiVerification
          period={period}
          userRole={userRole}
          onSelectRegion={onSelectRegion || (() => {})}
          onGoToPdf={handleGoToPdfForRegion}
        />
      ) : (
        <OfficialPdfPreview
          regionId={regionId}
          period={period}
          onBackToForm={onNavigateToForm || (() => {})}
          onSelectRegion={onSelectRegion}
        />
      )}
    </div>
  );
};

import React from 'react';
import { OfficialPdfPreview } from './OfficialPdfPreview';
import { ReportPeriod } from '../types';

interface LaporanViewProps {
  regionId: string;
  period: ReportPeriod;
  onSelectRegion?: (regionId: string) => void;
  onNavigateToForm?: () => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  regionId,
  period,
  onSelectRegion,
  onNavigateToForm
}) => {
  return (
    <div className="space-y-6">
      <OfficialPdfPreview
        regionId={regionId}
        period={period}
        onBackToForm={onNavigateToForm || (() => {})}
        onSelectRegion={onSelectRegion}
      />
    </div>
  );
};

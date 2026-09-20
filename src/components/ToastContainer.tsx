import React from 'react';
import { CheckCircle2, AlertTriangle, Flame, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((t) => {
        let borderBg = 'bg-slate-900/95 border-slate-700 text-slate-100';
        let icon = <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />;

        if (t.type === 'success') {
          borderBg = 'bg-slate-900/95 border-emerald-500/50 text-slate-100';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
        } else if (t.type === 'warning') {
          borderBg = 'bg-slate-900/95 border-amber-500/50 text-slate-100';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
        } else if (t.type === 'danger') {
          borderBg = 'bg-rose-950/95 border-rose-600 text-white shadow-rose-900/40 animate-bounce';
          icon = <Flame className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl border ${borderBg} shadow-2xl transition-all duration-300 pointer-events-auto backdrop-blur-md`}
          >
            {icon}
            <div className="space-y-1 flex-1 min-w-0">
              <h5 className="font-extrabold text-xs uppercase tracking-wider">{t.title}</h5>
              <p className="text-[12px] text-slate-300 leading-relaxed break-words">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-white shrink-0 ml-1 p-1 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

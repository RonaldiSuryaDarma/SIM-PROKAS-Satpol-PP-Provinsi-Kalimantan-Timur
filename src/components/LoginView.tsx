import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { authService } from '../services/authService';
import { UserSession } from '../types';

interface LoginViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await authService.login(username, password);
      if (result.success) {
        setSuccessMsg(result.message);
        const session = authService.getSession();
        if (session) {
          setTimeout(() => {
            onLoginSuccess(session);
          }, 350);
        }
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card matching image.png */}
      <div className="w-full max-w-[420px] bg-[#0c1322] border border-slate-800/90 rounded-[28px] p-7 sm:p-9 shadow-2xl relative backdrop-blur-xl z-10 text-slate-100">
        
        {/* Top Logo Container */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
          {/* Fire Extinguisher Icon as shown in image */}
          <svg 
            className="w-9 h-9 text-white fill-white" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M10.5 2h3a1 1 0 0 1 1 1v1.1c1.55.38 2.5 1.74 2.5 3.42v.48h.5a1.5 1.5 0 0 1 1.5 1.5v.5a1.5 1.5 0 0 1-1.5 1.5H17v8a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-8H6.5A1.5 1.5 0 0 1 5 9.5V9A1.5 1.5 0 0 1 6.5 7.5H7v-.48c0-1.68.95-3.04 2.5-3.42V3a1 1 0 0 1 1-1zm-.5 7.5v3h4v-3h-4zm0-2.5c-.83 0-1.5.67-1.5 1.5H15c0-.83-.67-1.5-1.5-1.5h-3.5z" />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mt-5 mb-7">
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
            Masuk SIM-PROKAS
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Bidang Kebakaran Satpol PP Provinsi Kalimantan Timur
          </p>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* NAMA PENGGUNA */}
          <div>
            <label className="text-[11px] font-extrabold text-slate-300 tracking-wider block uppercase mb-1.5">
              NAMA PENGGUNA
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan nama pengguna..."
              autoComplete="username"
              className="w-full bg-[#070b16] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 transition font-medium"
              required
            />
          </div>

          {/* KATA SANDI */}
          <div>
            <label className="text-[11px] font-extrabold text-slate-300 tracking-wider block uppercase mb-1.5">
              KATA SANDI
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                autoComplete="current-password"
                className="w-full bg-[#070b16] border border-slate-700/80 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 transition font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#e11d48] via-[#f97316] to-[#ea580c] hover:brightness-110 active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-orange-900/30 transition-all cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>MASUK KE SISTEM</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-[11px] text-slate-500 text-center mt-6">
          Sesi login berakhir ketika tab browser ditutup.
        </p>

      </div>

    </div>
  );
};

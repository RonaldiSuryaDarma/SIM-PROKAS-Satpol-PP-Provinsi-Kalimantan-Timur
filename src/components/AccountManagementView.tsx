import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  RotateCcw, 
  Search, 
  Building2, 
  UserCheck, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { authService, OfficialAccount } from '../services/authService';

interface AccountManagementViewProps {
  onShowToast?: (title: string, message: string, type?: 'success' | 'danger' | 'info') => void;
}

export const AccountManagementView: React.FC<AccountManagementViewProps> = ({ onShowToast }) => {
  const [accounts, setAccounts] = useState(() => authService.getAccounts());
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Modal Edit Password State
  const [editingAccount, setEditingAccount] = useState<OfficialAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const refreshAccounts = () => {
    setAccounts(authService.getAccounts());
  };

  const toggleShowPassword = (username: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    if (onShowToast) {
      onShowToast('BERHASIL DISALIN', `${label} disalin ke papan klip.`, 'info');
    }
  };

  const handleOpenEdit = (acc: OfficialAccount) => {
    setEditingAccount(acc);
    setNewPasswordInput(acc.password);
    setEditError(null);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    if (!newPasswordInput.trim()) {
      setEditError('Kata sandi baru tidak boleh kosong.');
      return;
    }

    if (newPasswordInput.trim().length < 6) {
      setEditError('Kata sandi minimal 6 karakter demi keamanan akun dinas.');
      return;
    }

    const res = authService.updatePassword(editingAccount.username, newPasswordInput);
    if (res.success) {
      refreshAccounts();
      setEditingAccount(null);
      if (onShowToast) {
        onShowToast('KATA SANDI DIPERBARUI', res.message, 'success');
      }
    } else {
      setEditError(res.message);
    }
  };

  const handleResetToDefault = (acc: OfficialAccount) => {
    if (window.confirm(`Reset kata sandi ${acc.session.userName} kembali ke pengaturan bawaan dinas?`)) {
      const res = authService.resetPasswordToDefault(acc.username);
      refreshAccounts();
      if (onShowToast) {
        onShowToast('RESET SANDI BERHASIL', res.message, 'info');
      }
    }
  };

  const handleCopyAllCredentials = () => {
    const headerText = `*DAFTAR AKUN RESMI OPERATOR SIM-PROKAS 2026*\n*Satuan Polisi Pamong Praja Provinsi Kalimantan Timur*\n_Sifat: Rahasia & Tertutup bagi Operator Dinas Kebakaran Kab/Kota_\n\n`;
    const bodyText = accounts
      .filter(a => a.session.role === 'operator_kabkota')
      .map((a, idx) => {
        return `${idx + 1}. *${a.session.userName}*\n   • Kab/Kota: ${a.session.instansi}\n   • Username: \`${a.username}\`\n   • Password: \`${a.password}\`\n`;
      })
      .join('\n');
    const footerText = `\n_Tautan Akses Aplikasi:_ ${window.location.origin}\n_Harap tidak membagikan kredensial ini kepada pihak yang tidak berkepentingan._`;

    const fullText = headerText + bodyText + footerText;
    navigator.clipboard.writeText(fullText);
    setCopiedKey('all_credentials');
    setTimeout(() => setCopiedKey(null), 3000);
    if (onShowToast) {
      onShowToast(
        'REKAP AKUN DISALIN',
        'Format pesan WhatsApp berisi daftar 10 akun operator Kab/Kota berhasil disalin.',
        'success'
      );
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const q = searchTerm.toLowerCase();
    return (
      acc.username.toLowerCase().includes(q) ||
      acc.session.userName.toLowerCase().includes(q) ||
      acc.session.instansi.toLowerCase().includes(q)
    );
  });

  const kabKotaAccounts = filteredAccounts.filter(a => a.session.role === 'operator_kabkota');
  const adminAccounts = filteredAccounts.filter(a => a.session.role === 'admin_provinsi');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Otoritas Super Admin & Inisiator Prov. Kaltim</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Manajemen Akun Operator 10 Kab/Kota
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Kelola akses resmi operator Dinas Pemadam Kebakaran & Satpol PP se-Kalimantan Timur. Anda dapat memantau kredensial, mengganti kata sandi secara instan, serta menyalin format pengumuman akun tertutup.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyAllCredentials}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20"
            >
              {copiedKey === 'all_credentials' ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Format Pesan Disalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Salin Rekap Akun (Format WhatsApp)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800">
            <span className="text-slate-400 block mb-1">Total Akun Kab/Kota</span>
            <span className="text-xl font-black text-white">10 Daerah</span>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800">
            <span className="text-slate-400 block mb-1">Hak Akses Daerah</span>
            <span className="text-xl font-black text-emerald-400">Terisolasi</span>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800">
            <span className="text-slate-400 block mb-1">Akun Super Admin</span>
            <span className="text-xl font-black text-amber-400">1 Mako Prov</span>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800">
            <span className="text-slate-400 block mb-1">Status Keamanan</span>
            <span className="text-xl font-black text-rose-400">Enkripsi Sesi</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari daerah, username, atau instansi..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="text-xs text-slate-400 self-end sm:self-center">
          Menampilkan <strong className="text-white">{filteredAccounts.length}</strong> akun terdaftar
        </div>
      </div>

      {/* Super Admin Account Card */}
      {adminAccounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Akun Inisiator & Super Admin Provinsi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminAccounts.map((acc) => {
              const isShow = showPasswordMap[acc.username];
              return (
                <div 
                  key={acc.username}
                  className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        SUPER ADMIN PROVINSI
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-1.5">{acc.session.userName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{acc.session.instansi}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] mb-1">Username Login</span>
                      <div className="flex items-center justify-between font-mono font-bold text-white">
                        <span>{acc.username}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.username, `user_${acc.username}`, 'Username')}
                          className="text-slate-400 hover:text-white p-1"
                          title="Salin Username"
                        >
                          {copiedKey === `user_${acc.username}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 text-[10px]">Kata Sandi</span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(acc.username)}
                          className="text-slate-400 hover:text-white text-[10px] flex items-center gap-1"
                        >
                          {isShow ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isShow ? 'Tutup' : 'Lihat'}</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between font-mono font-bold text-amber-400">
                        <span>{isShow ? acc.password : '••••••••••••'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.password, `pass_${acc.username}`, 'Kata Sandi')}
                          className="text-slate-400 hover:text-white p-1"
                          title="Salin Password"
                        >
                          {copiedKey === `pass_${acc.username}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(acc)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition"
                    >
                      Ubah Kata Sandi Admin
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Operator Kab/Kota Accounts Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-rose-500" />
          Daftar Akun Operator 10 Kabupaten / Kota
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kabKotaAccounts.map((acc) => {
            const isShow = showPasswordMap[acc.username];
            return (
              <div 
                key={acc.username}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-4 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                          {acc.session.regionId?.toUpperCase()}
                        </span>
                        {acc.isCustomPassword && (
                          <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                            Sandi Kustom Aktif
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold text-white mt-1.5">{acc.session.userName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{acc.session.instansi}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
                    {/* Username */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] mb-1">Username Login</span>
                      <div className="flex items-center justify-between font-mono font-bold text-white">
                        <span className="truncate">{acc.username}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.username, `user_${acc.username}`, 'Username')}
                          className="text-slate-400 hover:text-white p-1 shrink-0"
                          title="Salin Username"
                        >
                          {copiedKey === `user_${acc.username}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 text-[10px]">Kata Sandi</span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(acc.username)}
                          className="text-slate-400 hover:text-white text-[10px] flex items-center gap-1"
                        >
                          {isShow ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isShow ? 'Tutup' : 'Lihat'}</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between font-mono font-bold text-rose-400">
                        <span className="truncate">{isShow ? acc.password : '••••••••••••'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.password, `pass_${acc.username}`, 'Kata Sandi')}
                          className="text-slate-400 hover:text-white p-1 shrink-0"
                          title="Salin Password"
                        >
                          {copiedKey === `pass_${acc.username}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs">
                  {acc.isCustomPassword ? (
                    <button
                      type="button"
                      onClick={() => handleResetToDefault(acc)}
                      className="text-slate-400 hover:text-amber-400 text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset ke Standar</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Sandi standar dinas</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(acc)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                  >
                    Ganti Kata Sandi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panduan Distribusi Akses */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Petunjuk Distribusi Akun kepada Dinas Damkar Kab/Kota</span>
        </div>
        <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-slate-300">Akses Tertutup:</strong> Kredensial di atas dibuat khusus untuk operator resmi yang ditunjuk oleh Kepala Dinas Damkar / Kasatpol PP Kabupaten/Kota.
          </li>
          <li>
            <strong className="text-slate-300">Kemandirian Wilayah:</strong> Operator yang masuk hanya memiliki izin untuk menginput, mengubah, dan mengajukan laporan wilayah Kabupaten/Kotanya sendiri. Mereka tidak dapat mengubah data daerah lain.
          </li>
          <li>
            <strong className="text-slate-300">Penggantian Berkala:</strong> Jika terjadi mutasi atau pergantian pejabat/operator di daerah, Anda cukup menekan tombol <em>"Ganti Kata Sandi"</em> untuk memperbarui kata sandi baru secara instan tanpa perlu bantuan teknis programmer.
          </li>
        </ul>
      </div>

      {/* Modal Edit Password */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base">Ubah Kata Sandi Operator</h3>
                <p className="text-xs text-slate-400 truncate">{editingAccount.session.userName}</p>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nama Pengguna (Username)</label>
                <input
                  type="text"
                  disabled
                  value={editingAccount.username}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Masukkan Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Contoh: Kaltim2026!Smd"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Minimal 6 karakter. Pastikan mudah diingat oleh petugas operator daerah.
                </span>
              </div>

              {editError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20"
                >
                  Simpan Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

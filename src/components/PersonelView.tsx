import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Award, 
  CheckCircle2, 
  Clock, 
  X,
  ShieldAlert,
  IdCard
} from 'lucide-react';
import { GasPersonel } from '../data/gasAppData';

interface PersonelViewProps {
  personnel: GasPersonel[];
  onAddPersonel: (p: GasPersonel) => void;
}

export const PersonelView: React.FC<PersonelViewProps> = ({
  personnel,
  onAddPersonel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New personnel form state
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Cuti' | 'Non-Aktif'>('Aktif');
  const [kategori, setKategori] = useState<'Struktural' | 'Fungsional' | 'Pelaksana' | 'PPPK' | 'Relawan'>('Fungsional');
  const [sertifikasiStr, setSertifikasiStr] = useState('Firefighter I, MFR');

  const filtered = personnel.filter(p => {
    const matchSearch = 
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = statusFilter === 'Semua' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPersonel = personnel.length;
  const fungsionalCount = personnel.filter(p => p.kategori === 'Fungsional').length;
  const relawanCount = personnel.filter(p => p.kategori === 'Relawan').length;
  const pelaksanaCount = personnel.filter(p => p.kategori === 'Pelaksana').length;
  const strukturalCount = personnel.filter(p => p.kategori === 'Struktural' || p.kategori === 'PPPK').length;

  const pct = (cnt: number) => totalPersonel > 0 ? Math.round((cnt / totalPersonel) * 100) : 0;

  const activeCount = personnel.filter(p => p.status === 'Aktif').length;
  const cutiCount = personnel.filter(p => p.status === 'Cuti').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !jabatan) return;

    const initials = nama.split(' ')
      .filter(w => !w.includes('.') && !w.includes(','))
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || 'DM';

    const newP: GasPersonel = {
      id: Date.now(),
      nama,
      nip: nip || '-',
      jabatan,
      status,
      phone: phone || '0812-0000-0000',
      email: email || `${initials.toLowerCase()}@damkar.kaltim.go.id`,
      avatar: initials,
      kategori,
      sertifikasi: sertifikasiStr.split(',').map(s => s.trim()).filter(Boolean)
    };

    onAddPersonel(newP);
    setIsModalOpen(false);
    setNama('');
    setNip('');
    setJabatan('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">Manajemen Personil Damkar Kaltim</h3>
          <p className="text-sm text-slate-400">
            Total Personil Terdaftar: <span className="text-orange-400 font-bold">{personnel.length}</span> personil ({activeCount} Aktif Siaga)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-rose-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Personil Baru</span>
        </button>
      </div>

      {/* Distribution Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Distribusi Berdasarkan Jabatan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <h4 className="font-bold text-slate-300 text-sm mb-4 flex items-center gap-2">
            <IdCard className="w-4 h-4 text-orange-400" />
            Distribusi Jabatan & Kategori Personil
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Fungsional Pemadam Kebakaran & Penyelamat</span>
                <span className="text-rose-400 font-bold">{pct(fungsionalCount)}% ({fungsionalCount} Personil)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${pct(fungsionalCount)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Relawan Pemadam Kebakaran (Redkar)</span>
                <span className="text-orange-400 font-bold">{pct(relawanCount)}% ({relawanCount} Personil)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${pct(relawanCount)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Petugas Pelaksana & Operator 112</span>
                <span className="text-blue-400 font-bold">{pct(pelaksanaCount)}% ({pelaksanaCount} Personil)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${pct(pelaksanaCount)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Pejabat Struktural / PPPK</span>
                <span className="text-emerald-400 font-bold">{pct(strukturalCount)}% ({strukturalCount} Personil)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${pct(strukturalCount)}%` }}></div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4">
            Total {totalPersonel} personil terdaftar dari input instansi Damkar & Satpol PP se-Kaltim.
          </p>
        </div>

        {/* Status Keaktifan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <h4 className="font-bold text-slate-300 text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Kesiapsiagaan & Status Keaktifan
          </h4>

          <div className="grid grid-cols-2 gap-4 my-auto">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-3xl font-black text-emerald-400">{activeCount}</span>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">Personil Aktif Siaga</p>
              <span className="text-[10px] text-slate-500 block mt-1">Siap penugasan 24/7</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-3xl font-black text-amber-400">{cutiCount}</span>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">Cuti / Diklat</p>
              <span className="text-[10px] text-slate-500 block mt-1">Regu cadangan</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2 mt-4">
            <ShieldAlert className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Kesiapan personil memenuhi rasio tanggap darurat 1 regu / posko sektor Kaltim.</span>
          </div>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama personil, NIP, atau jabatan..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none"
        >
          <option value="Semua">Semua Status Keaktifan</option>
          <option value="Aktif">Aktif Siaga</option>
          <option value="Cuti">Cuti / Diklat</option>
          <option value="Non-Aktif">Non-Aktif</option>
        </select>
      </div>

      {/* Personnel Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h4 className="text-lg font-bold text-white mb-1.5">Belum Ada Data Personil Terdaftar</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seluruh data dummy telah dibersihkan. Operator Kab/Kota atau Admin dapat menambahkan data personil riil pemadam kebakaran dan penyelamatan melalui tombol di bawah.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Personil Baru Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-rose-400 font-black text-base shrink-0 shadow-inner">
                  {p.avatar}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-extrabold text-white truncate" title={p.nama}>
                      {p.nama}
                    </h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      p.status === 'Aktif'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    NIP: {p.nip}
                  </p>

                  <p className="text-xs text-orange-400/90 font-medium mt-1 line-clamp-2">
                    {p.jabatan}
                  </p>
                </div>
              </div>

              {/* Sertifikasi Badges */}
              {p.sertifikasi && p.sertifikasi.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {p.sertifikasi.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <Award className="w-3 h-3 text-rose-500 shrink-0" />
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Contact Information */}
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-2 truncate">
                  <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                  <a href={`tel:${p.phone}`} className="hover:text-white transition">
                    {p.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{p.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Personnel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-500" />
                Tambah Personil Damkar Baru
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Kom."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">NIP (atau NIK Relawan)</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19890101 201212 1 001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status Keaktifan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Aktif">Aktif Siaga</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Jabatan Penugasan</label>
                <input
                  type="text"
                  required
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Komandan Regu Rescue / Pemadam Terampil"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nomor Telepon / WA</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Kedinasan</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kaltimprov.go.id"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Sertifikasi & Kualifikasi (Pisahkan Koma)</label>
                <input
                  type="text"
                  value={sertifikasiStr}
                  onChange={(e) => setSertifikasiStr(e.target.value)}
                  placeholder="Firefighter I, MFR, Water Rescue"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition shadow-lg shadow-rose-600/20"
                >
                  Simpan Personil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

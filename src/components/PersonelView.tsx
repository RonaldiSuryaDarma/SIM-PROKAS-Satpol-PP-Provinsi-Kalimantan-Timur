import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Award, 
  Clock, 
  X, 
  IdCard,
  Building2,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { GasPersonel } from '../data/gasAppData';
import { storageService } from '../services/storageService';
import { REGIONS_KALTIM } from '../data/regions';
import { DamkarReport, UserRole, UserSession } from '../types';

interface PersonelViewProps {
  personnel: GasPersonel[];
  onAddPersonel: (p: GasPersonel) => void;
  userRole?: UserRole;
  userSession?: UserSession | null;
}

export const PersonelView: React.FC<PersonelViewProps> = ({
  personnel,
  onAddPersonel,
  userRole = 'admin_provinsi',
  userSession
}) => {
  const isProvinsi = userRole === 'admin_provinsi';
  const [activeTab, setActiveTab] = useState<'rekap_daerah' | 'daftar_petugas'>(
    isProvinsi ? 'rekap_daerah' : 'daftar_petugas'
  );
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isProvinsi && activeTab === 'rekap_daerah') {
      setActiveTab('daftar_petugas');
    }
  }, [isProvinsi, activeTab]);

  // Live reports from 10 Kab/Kota
  const [reports, setReports] = useState<DamkarReport[]>(() => 
    REGIONS_KALTIM.map(r => storageService.getReport(r.id, 'SEMESTER_1', 2026))
  );

  useEffect(() => {
    const update = () => {
      setReports(REGIONS_KALTIM.map(r => storageService.getReport(r.id, 'SEMESTER_1', 2026)));
    };
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, []);

  // Compute live aggregates across 10 regions
  const totalPnsProv = reports.reduce((acc, r) => acc + (Number(r.bagianB.totalPns) || 0), 0);
  const totalPppkProv = reports.reduce((acc, r) => acc + (Number(r.bagianB.totalPppk) || 0), 0);
  const totalNonAsnProv = reports.reduce((acc, r) => acc + (Number(r.bagianB.nonAsn) || 0), 0);
  const totalAparaturProv = totalPnsProv + totalPppkProv + totalNonAsnProv;
  const totalRelawanProv = reports.reduce((acc, r) => acc + (Number(r.bagianD.jumlahRelawan) || 0), 0);
  const totalSertifikasiProv = reports.reduce((acc, r) => {
    const s = r.bagianB.sertifikasi;
    return acc + (Number(s.instruktur) || 0) + (Number(s.inspektur) || 0) + (Number(s.mfr) || 0) + (Number(s.rescue) || 0);
  }, 0);

  const operatorRegionId = userSession?.regionId || 'samarinda';
  const operatorRegionInfo = REGIONS_KALTIM.find(r => r.id === operatorRegionId) || REGIONS_KALTIM[0];
  const operatorReport = reports.find(r => r.regionId === operatorRegionId) || storageService.getReport(operatorRegionId, 'SEMESTER_1', 2026);

  const opPns = Number(operatorReport.bagianB.totalPns) || 0;
  const opPppk = Number(operatorReport.bagianB.totalPppk) || 0;
  const opNonAsn = Number(operatorReport.bagianB.nonAsn) || 0;
  const opAparatur = opPns + opPppk + opNonAsn;
  const opRelawan = Number(operatorReport.bagianD.jumlahRelawan) || 0;
  const opSertifikasi = (() => {
    const s = operatorReport.bagianB.sertifikasi;
    return (Number(s.instruktur) || 0) + (Number(s.inspektur) || 0) + (Number(s.mfr) || 0) + (Number(s.rescue) || 0);
  })();

  const displayedReports = selectedRegionFilter === 'all' 
    ? reports 
    : reports.filter(r => r.regionId === selectedRegionFilter);

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
          <h3 className="text-2xl font-black text-white">Data SDM & Personil Damkar Kaltim</h3>
          <p className="text-sm text-slate-400">
            Terhubung langsung ke data inputan <strong className="text-rose-400 font-bold">10 Kabupaten/Kota</strong> (SE Sekda Bagian B & D)
          </p>
        </div>

        {/* View Switcher Tabs */}
        {isProvinsi ? (
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('rekap_daerah')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'rekap_daerah'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Matriks SDM 10 Kab/Kota (Admin Provinsi)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('daftar_petugas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'daftar_petugas'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Roster Petugas Lapangan</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Users className="w-4 h-4 text-rose-500" />
            <span className="font-bold">Roster Petugas Lapangan Daerah</span>
          </div>
        )}
      </div>

      {/* TAB 1: REKAPITULASI SDM DARI 10 KAB/KOTA (KHUSUS SUPER ADMIN PROVINSI) */}
      {isProvinsi && activeTab === 'rekap_daerah' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Aparatur Damkar</div>
              <div className="text-3xl font-black text-white">{totalAparaturProv.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">{totalPnsProv} PNS</span> •
                <span className="text-blue-400 font-semibold">{totalPppkProv} PPPK</span> •
                <span className="text-amber-400 font-semibold">{totalNonAsnProv} Non-ASN</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Aparatur PNS Damkar</div>
              <div className="text-3xl font-black text-emerald-400">{totalPnsProv.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2">Struktural, Fungsional & Pelaksana</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Relawan Redkar (Bgn D)</div>
              <div className="text-3xl font-black text-orange-400">{totalRelawanProv.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2">Mitra partisipasi masyarakat aktif</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tersertifikasi Kemendagri</div>
              <div className="text-3xl font-black text-rose-400">{totalSertifikasiProv.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2">Instruktur, Inspektur, MFR & Rescue</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-bold text-white">Filter Wilayah Kabupaten / Kota:</span>
            </div>
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-rose-500"
            >
              <option value="all">Seluruh Kalimantan Timur (10 Daerah)</option>
              {REGIONS_KALTIM.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.instansiType})</option>
              ))}
            </select>
          </div>

          {/* 10 Regions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-black text-white text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-rose-500" />
                Matriks Rincian SDM per Daerah (Lampiran II Format SE Sekda)
              </h4>
              <span className="text-xs text-slate-400">Update Real-time Cloud</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Kabupaten / Kota</th>
                    <th className="px-4 py-3 text-center">PNS</th>
                    <th className="px-4 py-3 text-center">PPPK</th>
                    <th className="px-4 py-3 text-center">Non-ASN</th>
                    <th className="px-4 py-3 text-center font-bold text-white">Total SDM</th>
                    <th className="px-4 py-3 text-center">Relawan (D)</th>
                    <th className="px-4 py-3 text-center">Sertifikasi</th>
                    <th className="px-4 py-3 text-center">Status Laporan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {displayedReports.map((rep, idx) => {
                    const reg = REGIONS_KALTIM.find(r => r.id === rep.regionId) || REGIONS_KALTIM[0];
                    const certTotal = (Number(rep.bagianB.sertifikasi.instruktur) || 0) +
                      (Number(rep.bagianB.sertifikasi.inspektur) || 0) +
                      (Number(rep.bagianB.sertifikasi.mfr) || 0) +
                      (Number(rep.bagianB.sertifikasi.rescue) || 0);
                    const grandTotal = (Number(rep.bagianB.totalPns) || 0) +
                      (Number(rep.bagianB.totalPppk) || 0) +
                      (Number(rep.bagianB.nonAsn) || 0);

                    return (
                      <tr key={rep.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3.5 text-xs text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{reg.name}</div>
                          <div className="text-xs text-slate-400">{reg.instansiName}</div>
                          {rep.pengisi?.nama && (
                            <div className="text-[11px] text-rose-400">Pengisi: {rep.pengisi.nama}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-emerald-400">
                          {rep.bagianB.totalPns || 0}
                          <div className="text-[10px] text-slate-500 font-normal">
                            Str: {rep.bagianB.pnsStruktural || 0} | Fung: {rep.bagianB.pnsFungsional || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-blue-400">
                          {rep.bagianB.totalPppk || 0}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-amber-400">
                          {rep.bagianB.nonAsn || 0}
                        </td>
                        <td className="px-4 py-3.5 text-center font-black text-white text-base">
                          {grandTotal}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-orange-400">
                          {rep.bagianD.jumlahRelawan || 0} org
                          <div className="text-[10px] text-slate-500 font-normal">
                            {rep.bagianD.jumlahDesaKelurahan || 0} desa
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-purple-400">
                          {certTotal}
                          <div className="text-[10px] text-slate-500 font-normal">
                            MFR: {rep.bagianB.sertifikasi.mfr || 0} | Resc: {rep.bagianB.sertifikasi.rescue || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {rep.status === 'verified' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Terverifikasi
                            </span>
                          )}
                          {rep.status === 'submitted' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Diajukan
                            </span>
                          )}
                          {rep.status === 'revision_needed' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Perlu Revisi
                            </span>
                          )}
                          {(!rep.status || rep.status === 'draft') && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-700/50 text-slate-400 border border-slate-700">
                              Draft
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROSTER DAFTAR PETUGAS LAPANGAN */}
      {activeTab === 'daftar_petugas' && (
        <div className="space-y-6">
          <div className="flex justify-end">
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
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <h4 className="font-bold text-slate-300 text-sm mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Status Kesiapsiagaan Pos Jaga Hari Ini
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col items-center text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 mb-2 beacon-pulse"></div>
                  <span className="text-3xl font-black text-white">{activeCount}</span>
                  <span className="text-xs text-slate-400 font-bold mt-1">Personil Aktif / Piket</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col items-center text-center">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mb-2"></div>
                  <span className="text-3xl font-black text-amber-400">{cutiCount}</span>
                  <span className="text-xs text-slate-400 font-bold mt-1">Cuti / Cadangan</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic mt-4 text-center">
                *Standar Operasional Prosedur (SOP) menjamin minimal 80% kekuatan regu selalu dalam status siaga tanggap darurat 15 menit.
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari berdasarkan Nama, NIP, atau Jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500 transition placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold shrink-0">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-500 transition"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          {/* Personnel Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Petugas Damkar</th>
                    <th className="px-6 py-4">Kategori & Jabatan</th>
                    <th className="px-6 py-4">Sertifikasi Keahlian</th>
                    <th className="px-6 py-4">Kontak Darurat</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.length > 0 ? (
                    filtered.map((person) => (
                      <tr key={person.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-rose-400 text-sm shrink-0">
                              {person.avatar}
                            </div>
                            <div>
                              <div className="font-bold text-white">{person.nama}</div>
                              <div className="text-xs text-slate-500 font-mono">NIP: {person.nip}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{person.jabatan}</div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                            person.kategori === 'Fungsional' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            person.kategori === 'Relawan' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            person.kategori === 'Pelaksana' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {person.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(person.sertifikasi || []).map((cert, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                                <Award className="w-3 h-3 text-orange-400" />
                                {cert}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{person.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span>{person.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            person.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            person.status === 'Cuti' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-slate-700/40 text-slate-400 border border-slate-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              person.status === 'Aktif' ? 'bg-emerald-400' :
                              person.status === 'Cuti' ? 'bg-amber-400' :
                              'bg-slate-400'
                            }`} />
                            {person.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        Tidak ada personil yang sesuai dengan kriteria pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Personil */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-rose-500" />
              Pendaftaran Personil Damkar Baru
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Tambahkan personil ke dalam database operasional kesiapsiagaan darurat Provinsi Kaltim.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nama Lengkap *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="cth: M. Ridwan Hakim, S.Sos."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    NIP / NIK
                  </label>
                  <input 
                    type="text" 
                    placeholder="19920815..."
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Kategori Personil
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    <option value="Fungsional">Fungsional Damkar</option>
                    <option value="Pelaksana">Pelaksana / Operator 112</option>
                    <option value="Struktural">Struktural</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Relawan">Relawan Redkar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Jabatan Tugas *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="cth: Komandan Regu A Pos Sektor 1"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input 
                    type="text" 
                    placeholder="0812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status Tugas
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    <option value="Aktif">Aktif Siaga</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Sertifikasi Kemendagri (Pisahkan dengan koma)
                </label>
                <input 
                  type="text" 
                  placeholder="Firefighter I, MFR, SCBA Specialist"
                  value={sertifikasiStr}
                  onChange={(e) => setSertifikasiStr(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-rose-600/30"
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

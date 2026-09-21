import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Plus, 
  Search, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  MapPin, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  X,
  Radio,
  FileCheck,
  Building2,
  FileSpreadsheet,
  Layers,
  LifeBuoy,
  ShieldAlert
} from 'lucide-react';
import { GasIncident } from '../data/gasAppData';
import { storageService } from '../services/storageService';
import { REGIONS_KALTIM } from '../data/regions';
import { DamkarReport } from '../types';

interface KejadianViewProps {
  incidents: GasIncident[];
  onAddIncident: (inc: GasIncident) => void;
  onCompleteIncident: (id: string) => void;
  onDeleteIncident: (id: string) => void;
  onFlyTo?: (lat: number, lng: number) => void;
}

export const KejadianView: React.FC<KejadianViewProps> = ({
  incidents,
  onAddIncident,
  onCompleteIncident,
  onDeleteIncident,
  onFlyTo
}) => {
  const [activeTab, setActiveTab] = useState<'rekap_daerah' | 'panggilan_112'>('rekap_daerah');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [priorityFilter, setPriorityFilter] = useState('Semua');
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<GasIncident | null>(null);

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

  // Compute live aggregates across 10 regions from Bagian E, F, G
  const totalKebakaran = reports.reduce((acc, r) => acc + (Number(r.bagianE.totalKejadian) || 0), 0);
  const totalResponse15 = reports.reduce((acc, r) => acc + (Number(r.bagianE.response15Menit) || 0), 0);
  const spmRate = totalKebakaran > 0 ? ((totalResponse15 / totalKebakaran) * 100).toFixed(1) : '100.0';
  const totalRescue = reports.reduce((acc, r) => acc + (Number(r.bagianF.totalOperasi) || 0), 0);
  const totalJiwaSelamat = reports.reduce((acc, r) => acc + (Number(r.bagianG.jiwaSelamat) || 0), 0);
  const totalKerugian = reports.reduce((acc, r) => acc + (Number(r.bagianG.taksiranKerugian) || 0), 0);

  const displayedReports = selectedRegionFilter === 'all' 
    ? reports 
    : reports.filter(r => r.regionId === selectedRegionFilter);

  // Form state for 112 Dispatch
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Kebakaran Rumah');
  const [priority, setPriority] = useState<'Tinggi' | 'Sedang' | 'Rendah'>('Tinggi');
  const [location, setLocation] = useState('');
  const [reporter, setReporter] = useState('');
  const [desc, setDesc] = useState('');
  const [loss, setLoss] = useState<number>(50000000);

  const filtered = incidents.filter(inc => {
    const matchSearch = 
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'Semua' || inc.status === statusFilter;
    const matchPriority = priorityFilter === 'Semua' || inc.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    const newInc: GasIncident = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      title,
      type,
      status: 'Aktif',
      priority,
      location,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      reporter: reporter || 'Masyarakat (Call 112)',
      loss: Number(loss),
      desc: desc || 'Panggilan darurat masuk ke command center 112',
      coords: [0.5022, 117.1536]
    };

    onAddIncident(newInc);
    setIsAddModalOpen(false);
    setTitle('');
    setLocation('');
    setReporter('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">Laporan Kejadian Kebakaran & Rescue Kaltim</h3>
          <p className="text-sm text-slate-400">
            Terhubung langsung ke rekapitulasi data <strong className="text-rose-400 font-bold">10 Kabupaten/Kota</strong> (SE Sekda Bagian E, F, G)
          </p>
        </div>

        {/* View Switcher Tabs */}
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
            <span>Rekap 10 Kab/Kota (SE Sekda)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('panggilan_112')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'panggilan_112'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Pusat Panggilan Darurat 112</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REKAPITULASI KEJADIAN 10 KAB/KOTA (DATA OPERATOR) */}
      {activeTab === 'rekap_daerah' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Kebakaran (Bgn E)</div>
              <div className="text-3xl font-black text-rose-500">{totalKebakaran.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2 font-semibold">Kejadian Kebakaran</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Respon Cepat SPM ≤15 Mnt</div>
              <div className="text-3xl font-black text-emerald-400">{totalResponse15.toLocaleString('id-ID')}</div>
              <div className="text-xs text-emerald-400 mt-2 font-semibold">Kepatuhan SPM: {spmRate}%</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Operasi Rescue (Bgn F)</div>
              <div className="text-3xl font-black text-blue-400">{totalRescue.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2">Penyelamatan & Evakuasi</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Jiwa Diselamatkan (Bgn G)</div>
              <div className="text-3xl font-black text-amber-400">{totalJiwaSelamat.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2">Warga Terdampak Selamat</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taksiran Kerugian (Rp)</div>
              <div className="text-xl font-black text-purple-400 mt-1">
                Rp {totalKerugian > 1000000000 
                  ? (totalKerugian / 1000000000).toFixed(2) + ' M' 
                  : (totalKerugian / 1000000).toFixed(0) + ' Jt'}
              </div>
              <div className="text-xs text-slate-400 mt-2">Estimasi Nilai Materiil</div>
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
                Matriks Kejadian Kebakaran & Operasi Penyelamatan (Lampiran II & III SE Sekda)
              </h4>
              <span className="text-xs text-slate-400">Update Real-time Cloud</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Kabupaten / Kota</th>
                    <th className="px-4 py-3 text-center">Kejadian Kebakaran</th>
                    <th className="px-4 py-3 text-center">Respon ≤15 Menit</th>
                    <th className="px-4 py-3 text-center">Capaian SPM (%)</th>
                    <th className="px-4 py-3 text-center">Operasi Rescue</th>
                    <th className="px-4 py-3 text-center">Jiwa Selamat</th>
                    <th className="px-4 py-3 text-center">Taksiran Kerugian</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {displayedReports.map((rep, idx) => {
                    const reg = REGIONS_KALTIM.find(r => r.id === rep.regionId) || REGIONS_KALTIM[0];
                    const fires = Number(rep.bagianE.totalKejadian) || 0;
                    const resp15 = Number(rep.bagianE.response15Menit) || 0;
                    const regionSpm = fires > 0 ? Math.min(100, Math.round((resp15 / fires) * 100)) : 100;
                    const rescues = Number(rep.bagianF.totalOperasi) || 0;
                    const jiwa = Number(rep.bagianG.jiwaSelamat) || 0;
                    const lossVal = Number(rep.bagianG.taksiranKerugian) || 0;

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
                        <td className="px-4 py-3.5 text-center font-bold text-rose-400">
                          {fires} kali
                          <div className="text-[10px] text-slate-500 font-normal">
                            Listrik: {rep.bagianE.sebabListrik || 0} | Gas: {rep.bagianE.sebabGasKompor || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-emerald-400">
                          {resp15} kali
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            regionSpm >= 85 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            regionSpm >= 70 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {regionSpm}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-blue-400">
                          {rescues} kali
                          <div className="text-[10px] text-slate-500 font-normal">
                            Satwa: {rep.bagianF.animalRescue || 0} | Air: {rep.bagianF.waterRescue || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-amber-400">
                          {jiwa} jiwa
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-300">
                          Rp {lossVal.toLocaleString('id-ID')}
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

      {/* TAB 2: PUSAT PANGGILAN DARURAT 112 */}
      {activeTab === 'panggilan_112' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Input Panggilan 112 Baru</span>
            </button>
          </div>

          {/* Incident Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari ID Kejadian, Lokasi, atau Judul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500 transition placeholder:text-slate-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif Penanganan</option>
                <option value="Selesai">Selesai / Terkendali</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="Semua">Semua Prioritas</option>
                <option value="Tinggi">Tinggi / Urgent</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Kejadian & ID</th>
                    <th className="px-6 py-4">Lokasi & Jam Lapor</th>
                    <th className="px-6 py-4">Pelapor & Deskripsi</th>
                    <th className="px-6 py-4">Prioritas & Status</th>
                    <th className="px-6 py-4 text-right">Aksi Respon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.length > 0 ? (
                    filtered.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                              <Flame className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-base">{inc.title}</div>
                              <span className="text-xs font-mono text-slate-500">{inc.id} • {inc.type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{inc.location}</span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span>Lapor: {inc.time} WITA</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-slate-300">{inc.reporter}</div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{inc.desc}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                              inc.priority === 'Tinggi' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              inc.priority === 'Sedang' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              Prioritas: {inc.priority}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                              inc.status === 'Aktif' ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${inc.status === 'Aktif' ? 'bg-rose-500 beacon-pulse' : 'bg-emerald-500'}`} />
                              {inc.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {inc.status === 'Aktif' && (
                              <button
                                type="button"
                                onClick={() => onCompleteIncident(inc.id)}
                                title="Tandai Selesai"
                                className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl transition"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedDetail(inc)}
                              title="Lihat Detail"
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteIncident(inc.id)}
                              title="Hapus"
                              className="p-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        Tidak ada catatan panggilan 112 yang sesuai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Panggilan 112 */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button 
              type="button"
              onClick={() => setSelectedDetail(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedDetail.title}</h3>
                <span className="text-xs font-mono text-slate-400">{selectedDetail.id} • {selectedDetail.type}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Lokasi:</span>
                <span className="text-white font-semibold">{selectedDetail.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Waktu Laporan:</span>
                <span className="text-white font-semibold">{selectedDetail.time} WITA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pelapor:</span>
                <span className="text-white font-semibold">{selectedDetail.reporter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taksiran Kerugian:</span>
                <span className="text-rose-400 font-bold">Rp {selectedDetail.loss.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-1">Kronologi & Keterangan:</span>
                <p className="text-slate-200 text-xs leading-relaxed">{selectedDetail.desc}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Panggilan 112 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button 
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500" />
              Input Laporan Darurat Call Center 112
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Catat panggilan darurat masuk dan siapkan dispatch unit respon 15 menit.
            </p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Judul Insiden *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="cth: Kebakaran Ruko 2 Pintu Jl. Pahlawan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Klasifikasi Kejadian
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    <option value="Kebakaran Rumah">Kebakaran Pemukiman / Rumah</option>
                    <option value="Kebakaran Ruko/Gedung">Kebakaran Gedung / Usaha</option>
                    <option value="Kebakaran Lahan">Kebakaran Hutan & Lahan (Karhutla)</option>
                    <option value="Evakuasi Satwa">Operasi Penyelamatan Satwa (Ular/Tawon)</option>
                    <option value="Pohon Tumbang">Operasi Pohon Tumbang</option>
                    <option value="Water Rescue">Operasi SAR Air / Tenggelam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Prioritas Penanganan
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    <option value="Tinggi">Tinggi (Merah - Response 15 Mnt)</option>
                    <option value="Sedang">Sedang (Kuning)</option>
                    <option value="Rendah">Rendah (Hijau)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Alamat / Titik Lokasi *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Jl. Antasari No. 45 RT 12, Kel. Air Putih"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nama Pelapor (112)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Warga / Ketua RT"
                    value={reporter}
                    onChange={(e) => setReporter(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Estimasi Kerugian Awal (Rp)
                  </label>
                  <input 
                    type="number" 
                    placeholder="50000000"
                    value={loss}
                    onChange={(e) => setLoss(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Keterangan Kejadian
                </label>
                <textarea 
                  rows={2}
                  placeholder="Asap tebal terlihat dari lantai 2, warga meminta bantuan mobil damkar..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-rose-600/30"
                >
                  Kirim Laporan 112
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

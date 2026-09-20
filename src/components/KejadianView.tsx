import React, { useState } from 'react';
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
  FileCheck
} from 'lucide-react';
import { GasIncident } from '../data/gasAppData';
import { REGIONS_KALTIM } from '../data/regions';

interface KejadianViewProps {
  incidents: GasIncident[];
  onAddIncident: (inc: GasIncident) => void;
  onCompleteIncident: (id: string) => void;
  onDeleteIncident: (id: string) => void;
}

export const KejadianView: React.FC<KejadianViewProps> = ({
  incidents,
  onAddIncident,
  onCompleteIncident,
  onDeleteIncident
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [priorityFilter, setPriorityFilter] = useState('Semua');
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<GasIncident | null>(null);

  // Form state
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

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    const newInc: GasIncident = {
      id: `ID-DMK-2026-${String(incidents.length + 1).padStart(3, '0')}`,
      title,
      type,
      status: 'Aktif',
      priority,
      location,
      coords: [-0.5022 + (Math.random() - 0.5) * 0.1, 117.1536 + (Math.random() - 0.5) * 0.1],
      reporter: reporter || 'Warga Sekitar',
      desc: desc || 'Laporan darurat pemadam kebakaran diteruskan ke posko terdekat.',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA',
      loss: Number(loss) || 0,
      responseTimeMinutes: Math.floor(Math.random() * 6) + 5
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">Manajemen Kejadian (RISPK)</h3>
          <p className="text-sm text-slate-400">
            Pusat penanganan bencana kebakaran dan penyelamatan darurat 10 Kab/Kota Kaltim.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-rose-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Laporan Kejadian</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID laporan, nama kejadian, atau lokasi..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif Penanganan</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Selesai">Selesai / Terkendali</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none"
          >
            <option value="Semua">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <th className="p-4">ID & Jenis</th>
                <th className="p-4">Judul & Lokasi</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Prioritas</th>
                <th className="p-4 text-center">Response SPM</th>
                <th className="p-4 text-right">Taksiran Kerugian</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <span className="font-mono text-xs font-black text-white block">
                      {inc.id}
                    </span>
                    <span className="text-[10px] text-orange-400 font-medium">
                      {inc.type}
                    </span>
                  </td>

                  <td className="p-4 max-w-xs">
                    <p className="font-bold text-white text-xs sm:text-sm truncate">
                      {inc.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      {inc.location}
                    </p>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                      inc.status === 'Aktif'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : inc.status === 'Monitoring'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {inc.status}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      inc.priority === 'Tinggi'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : inc.priority === 'Sedang'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-400'
                    }`}>
                      {inc.priority}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {inc.responseTimeMinutes || 8} Menit
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      SPM ≤ 15 mnt
                    </span>
                  </td>

                  <td className="p-4 text-right font-mono font-bold text-slate-200">
                    Rp {(inc.loss || 0).toLocaleString('id-ID')}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {inc.status !== 'Selesai' && (
                        <button
                          type="button"
                          onClick={() => onCompleteIncident(inc.id)}
                          title="Tandai Sudah Selesai / Terkendali"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedDetail(inc)}
                        title="Lihat Detail Laporan"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteIncident(inc.id)}
                        title="Hapus Laporan"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Incident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                Tambah Laporan Kejadian Baru
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Judul Kejadian</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Kebakaran Rumah Tinggal 2 Lantai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Jenis Bencana</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Kebakaran Rumah">Kebakaran Rumah</option>
                    <option value="Kebakaran Bangunan Publik">Bangunan Gedung / Komersial</option>
                    <option value="Penyelamatan & Evakuasi">Rescue / Evakuasi</option>
                    <option value="Kebocoran Gas">Kebocoran Gas / B3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tingkat Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Tinggi">Tinggi (Darurat Jiwa)</option>
                    <option value="Sedang">Sedang (Terisolir)</option>
                    <option value="Rendah">Rendah (Penyelamatan Hewan/Ringan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Alamat / Lokasi Kejadian</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Jl. Ahmad Yani No. 12, Samarinda Ulu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nama / Kontak Pelapor</label>
                  <input
                    type="text"
                    value={reporter}
                    onChange={(e) => setReporter(e.target.value)}
                    placeholder="Budi (0812-3456-7890)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Taksiran Kerugian (Rp)</label>
                  <input
                    type="number"
                    value={loss}
                    onChange={(e) => setLoss(Number(e.target.value))}
                    placeholder="50000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Kronologi singkat dan unit posko yang diterjunkan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition shadow-lg shadow-rose-600/20"
                >
                  Terbitkan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  {selectedDetail.id}
                </span>
                <h4 className="text-base font-black text-white truncate max-w-xs">
                  {selectedDetail.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jenis Bencana:</span>
                  <span className="text-white font-bold">{selectedDetail.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Penanganan:</span>
                  <span className="text-emerald-400 font-black">{selectedDetail.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tingkat Prioritas:</span>
                  <span className="text-rose-400 font-bold">{selectedDetail.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu Laporan Masuk:</span>
                  <span className="text-slate-200 font-mono">{selectedDetail.time}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Lokasi Kejadian:</span>
                <p className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  {selectedDetail.location}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Pelapor & Sumber Informasi:</span>
                <p className="text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {selectedDetail.reporter}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Uraian / Kronologi Lapangan:</span>
                <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedDetail.desc}
                </p>
              </div>

              <div className="flex justify-between items-center p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl">
                <span className="text-slate-300 font-bold">Estimasi Kerugian Fisik:</span>
                <span className="text-rose-400 font-mono text-sm font-black">
                  Rp {(selectedDetail.loss || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

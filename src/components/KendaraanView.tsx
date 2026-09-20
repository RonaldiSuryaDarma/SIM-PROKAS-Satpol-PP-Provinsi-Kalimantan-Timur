import React, { useState } from 'react';
import { 
  Truck, 
  Fuel, 
  Wrench, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Plus,
  X
} from 'lucide-react';
import { GasVehicle } from '../data/gasAppData';

interface KendaraanViewProps {
  vehicles: GasVehicle[];
  onRefillFuel: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onAddVehicle?: (v: GasVehicle) => void;
}

export const KendaraanView: React.FC<KendaraanViewProps> = ({
  vehicles,
  onRefillFuel,
  onToggleStatus,
  onAddVehicle
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [plat, setPlat] = useState('');
  const [tipe, setTipe] = useState('Fire Truck (4000L)');
  const [driver, setDriver] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<'Excellent' | 'Good' | 'Fair'>('Excellent');
  const [age, setAge] = useState<number>(3);
  const [bensin, setBensin] = useState<number>(100);

  const readyCount = vehicles.filter(v => v.status === 'Siap').length;
  const onDutyCount = vehicles.filter(v => v.status === 'Bertugas').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'Servis').length;

  const avgBensin = vehicles.length > 0 
    ? Math.round(vehicles.reduce((acc, v) => acc + v.bensin, 0) / vehicles.length)
    : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plat || !onAddVehicle) return;

    const newVehicle: GasVehicle = {
      id: Date.now(),
      name,
      plat,
      tipe,
      status: 'Siap',
      condition,
      bensin,
      driver: driver || 'Regu Piket Posko',
      location: location || 'Mako / Pos Sektor',
      age
    };

    onAddVehicle(newVehicle);
    setIsModalOpen(false);
    setName('');
    setPlat('');
    setDriver('');
    setLocation('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">Manajemen Kendaraan & Logistik Armada</h3>
          <p className="text-sm text-slate-400">
            Monitoring status operasional armada pemadam pos sektor se-Kalimantan Timur.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap gap-2">
            <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
              {readyCount} Siaga
            </span>
            <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span>
              {onDutyCount} Bertugas
            </span>
            <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
              {maintenanceCount} Servis
            </span>
          </div>

          {onAddVehicle && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Armada</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Fleet Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tingkat Bahan Bakar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <h4 className="font-bold text-slate-300 text-xs mb-3 uppercase tracking-wider flex items-center gap-2">
              <Fuel className="w-4 h-4 text-orange-400" />
              Tingkat Bahan Bakar Armada (%)
            </h4>
            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 italic">Belum ada armada tercatat untuk monitoring BBM.</p>
            ) : (
              <div className="space-y-2.5">
                {vehicles.map(v => (
                  <div key={v.id} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="truncate max-w-[170px]">{v.name}</span>
                      <span className="font-mono font-bold text-orange-400">{v.bensin}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          v.bensin > 70 ? 'bg-emerald-500' : v.bensin > 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} 
                        style={{ width: `${v.bensin}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-4 block">
            Rata-rata kesiapan BBM posko: {avgBensin}%
          </span>
        </div>

        {/* Kondisi Mekanis Kendaraan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <h4 className="font-bold text-slate-300 text-xs mb-3 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              Fisik & Kondisi Mekanis Kendaraan
            </h4>
            <div className="space-y-3 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Prima / Excellent (Siap Tempur)</span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {vehicles.filter(v => v.condition === 'Excellent').length} Unit
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Baik / Good (Operasional Normal)</span>
                <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {vehicles.filter(v => v.condition === 'Good').length} Unit
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Butuh Perbaikan / Fair (Servis)</span>
                <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {vehicles.filter(v => v.condition === 'Fair').length} Unit
                </span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-4 block">
            Jadwal uji emisi dan pompa berkala per triwulan.
          </span>
        </div>

        {/* Masa Usia Pakai */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <h4 className="font-bold text-slate-300 text-xs mb-3 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400" />
              Masa Usia Pakai Kendaraan (Tahun)
            </h4>
            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 italic">Belum ada armada tercatat untuk data usia pakai.</p>
            ) : (
              <div className="space-y-2.5">
                {vehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-slate-300 truncate max-w-[180px]">{v.name}</span>
                    <span className="font-mono text-slate-400">
                      <strong className="text-white font-bold">{v.age}</strong> Tahun
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-4 block">
            Standar peremajaan armada rescue: ≤ 10 Tahun.
          </span>
        </div>

      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-inner">
            <Truck className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h4 className="text-lg font-bold text-white mb-1.5">Belum Ada Armada Tercatat</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seluruh data dummy telah dibersihkan. Operator Kab/Kota atau Admin dapat mendaftarkan armada pemadam kebakaran, mobil tangki, ambulans rescue, atau ladder truck melalui tombol di bawah.
            </p>
          </div>
          {onAddVehicle && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Armada Baru Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600/20 to-orange-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0 shadow-inner">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white">{v.name}</h4>
                      <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        {v.plat}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      v.status === 'Siap'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : v.status === 'Bertugas'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {v.status}
                    </span>

                    <span className="text-[10px] text-slate-400 font-medium">
                      Kondisi: <strong className="text-slate-200">{v.condition}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{v.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="truncate">Driver: {v.driver}</span>
                  </div>
                </div>

                {/* Fuel Level */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-orange-400" />
                      Bahan Bakar Tangki
                    </span>
                    <span className="font-mono font-bold text-white">{v.bensin}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        v.bensin > 70 ? 'bg-emerald-500' : v.bensin > 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${v.bensin}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => onRefillFuel(v.id)}
                  className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Fuel className="w-3.5 h-3.5 text-orange-400" />
                  <span>Isi Bahan Bakar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleStatus(v.id)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ganti Status ({v.status})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-rose-500" />
                Tambah Armada Pemadam Baru
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nama / Unit Armada</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Fire Truck Unit 01 Mako"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nomor Plat Polisi</label>
                  <input
                    type="text"
                    required
                    value={plat}
                    onChange={(e) => setPlat(e.target.value)}
                    placeholder="Contoh: KT 1024 FD"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Jenis / Tipe Armada</label>
                  <select
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Fire Truck (4000L)">Fire Truck (4000L)</option>
                    <option value="Water Supply Tanker (8000L)">Water Supply Tanker (8000L)</option>
                    <option value="Ladder Truck (32m)">Ladder Truck (Sky Lift)</option>
                    <option value="Ambulance Medis Gawat Darurat">Ambulance Medis Gawat Darurat</option>
                    <option value="Rescue Unit & Perahu Evakuasi">Rescue Unit & Perahu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Driver / Pengemudi</label>
                  <input
                    type="text"
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    placeholder="Nama pengemudi siaga"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Lokasi Pos Sektor</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Posko Sektor Samarinda Utara"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kondisi Fisik</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Excellent">Prima / Siap Tempur</option>
                    <option value="Good">Baik / Operasional Normal</option>
                    <option value="Fair">Butuh Servis / Perbaikan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Usia Armada (Tahun)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20"
                >
                  Simpan Armada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

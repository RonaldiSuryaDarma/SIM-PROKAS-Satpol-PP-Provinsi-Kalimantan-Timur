import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Fuel, 
  Wrench, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Plus,
  X,
  Building2,
  FileSpreadsheet,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { GasVehicle } from '../data/gasAppData';
import { storageService } from '../services/storageService';
import { REGIONS_KALTIM } from '../data/regions';
import { DamkarReport, UserRole, UserSession } from '../types';

interface KendaraanViewProps {
  vehicles: GasVehicle[];
  onRefillFuel: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onAddVehicle?: (v: GasVehicle) => void;
  userRole?: UserRole;
  userSession?: UserSession | null;
}

export const KendaraanView: React.FC<KendaraanViewProps> = ({
  vehicles,
  onRefillFuel,
  onToggleStatus,
  onAddVehicle,
  userRole = 'admin_provinsi',
  userSession
}) => {
  const isProvinsi = userRole === 'admin_provinsi';
  const [activeTab, setActiveTab] = useState<'rekap_daerah' | 'status_armada'>(isProvinsi ? 'rekap_daerah' : 'status_armada');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isProvinsi) {
      setActiveTab('status_armada');
    }
  }, [isProvinsi]);

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

  // Compute live aggregates across 10 regions from Bagian C
  const totalMobilDamkar = reports.reduce((acc, r) => acc + (Number(r.bagianC.mobilDamkar) || 0), 0);
  const totalMobilTangki = reports.reduce((acc, r) => acc + (Number(r.bagianC.mobilTangki) || 0), 0);
  const totalMobilTangga = reports.reduce((acc, r) => acc + (Number(r.bagianC.mobilTangga) || 0), 0);
  const totalMobilRescue = reports.reduce((acc, r) => acc + (Number(r.bagianC.mobilRescue) || 0), 0);
  const totalKendaraanLainnya = reports.reduce((acc, r) => acc + (Number(r.bagianC.kendaraanLainnya) || 0), 0);
  const grandTotalArmada = totalMobilDamkar + totalMobilTangki + totalMobilTangga + totalMobilRescue + totalKendaraanLainnya;

  const displayedReports = selectedRegionFilter === 'all' 
    ? reports 
    : reports.filter(r => r.regionId === selectedRegionFilter);

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
      bensin: Number(bensin),
      age: Number(age),
      driver: driver || 'Driver Cadangan',
      location: location || 'Mako Damkar Pusat'
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
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">Inventaris Armada & Sarpras Damkar Kaltim</h3>
          <p className="text-sm text-slate-400">
            {isProvinsi ? (
              <>Terhubung langsung ke data inventaris <strong className="text-rose-400 font-bold">10 Kabupaten/Kota</strong> (SE Sekda Bagian C)</>
            ) : (
              <>Monitoring kesiapsiagaan unit damkar & armada operasional penyelamatan daerah</>
            )}
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
              <span>Rekap 10 Kab/Kota (SE Sekda)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('status_armada')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'status_armada'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Status Armada Operasional</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Truck className="w-4 h-4 text-rose-500" />
            <span className="font-bold">Status Armada Operasional Daerah</span>
          </div>
        )}
      </div>

      {/* TAB 1: REKAPITULASI DARI 10 KAB/KOTA (DATA OPERATOR) */}
      {activeTab === 'rekap_daerah' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Semua Armada</div>
              <div className="text-3xl font-black text-white">{grandTotalArmada.toLocaleString('id-ID')}</div>
              <div className="text-xs text-rose-400 mt-2 font-semibold">10 Kabupaten/Kota</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mobil Pemadam</div>
              <div className="text-3xl font-black text-rose-500">{totalMobilDamkar.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2">Unit Utama Fire Pumper</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mobil Tangki Suplai</div>
              <div className="text-3xl font-black text-blue-400">{totalMobilTangki.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2">Suplai Air Lapangan</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mobil Tangga (Snorkel)</div>
              <div className="text-3xl font-black text-amber-400">{totalMobilTangga.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2">Gedung Bertingkat</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rescue & Pendukung</div>
              <div className="text-3xl font-black text-purple-400">{(totalMobilRescue + totalKendaraanLainnya).toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-400 mt-2">Penyelamatan & Operasional</div>
            </div>
          </div>

          {/* Filter Bar & 10 Regions Table - HANYA UNTUK SUPER ADMIN PROVINSI */}
          {isProvinsi && (
            <>
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
                    Matriks Inventaris Sarana Prasarana Kendaraan (Bagian C SE Sekda)
                  </h4>
                  <span className="text-xs text-slate-400">Update Real-time Cloud</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">No</th>
                        <th className="px-4 py-3">Kabupaten / Kota</th>
                        <th className="px-4 py-3 text-center">Mobil Damkar</th>
                        <th className="px-4 py-3 text-center">Mobil Tangki</th>
                        <th className="px-4 py-3 text-center">Mobil Tangga</th>
                        <th className="px-4 py-3 text-center">Mobil Rescue</th>
                        <th className="px-4 py-3 text-center">Lainnya</th>
                        <th className="px-4 py-3 text-center font-bold text-white">Total Unit</th>
                        <th className="px-4 py-3 text-center">Status Laporan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {displayedReports.map((rep, idx) => {
                        const reg = REGIONS_KALTIM.find(r => r.id === rep.regionId) || REGIONS_KALTIM[0];
                        const totalUnit = (Number(rep.bagianC.mobilDamkar) || 0) +
                          (Number(rep.bagianC.mobilTangki) || 0) +
                          (Number(rep.bagianC.mobilTangga) || 0) +
                          (Number(rep.bagianC.mobilRescue) || 0) +
                          (Number(rep.bagianC.kendaraanLainnya) || 0);

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
                            <td className="px-4 py-3.5 text-center font-semibold text-rose-400">
                              {rep.bagianC.mobilDamkar || 0}
                            </td>
                            <td className="px-4 py-3.5 text-center font-semibold text-blue-400">
                              {rep.bagianC.mobilTangki || 0}
                            </td>
                            <td className="px-4 py-3.5 text-center font-semibold text-amber-400">
                              {rep.bagianC.mobilTangga || 0}
                            </td>
                            <td className="px-4 py-3.5 text-center font-semibold text-purple-400">
                              {rep.bagianC.mobilRescue || 0}
                            </td>
                            <td className="px-4 py-3.5 text-center font-semibold text-slate-400">
                              {rep.bagianC.kendaraanLainnya || 0}
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-white text-base">
                              {totalUnit} unit
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
            </>
          )}
        </div>
      )}

      {/* TAB 2: STATUS ARMADA OPERASIONAL */}
      {activeTab === 'status_armada' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Unit Armada</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unit Siap Tempur</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-emerald-400">{readyCount}</span>
                <span className="text-xs text-slate-500">Unit Siap</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sedang Bertugas</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-blue-400">{onDutyCount}</span>
                <span className="text-xs text-slate-500">Unit Bertugas</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pemeliharaan / Servis</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-amber-400">{maintenanceCount}</span>
                <span className="text-xs text-slate-500">Perbaikan</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rata-rata BBM Tangki</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-rose-400">{avgBensin}%</span>
                <span className="text-xs text-slate-500">Level BBM</span>
              </div>
            </div>
          </div>

          {/* Fleet Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((v) => (
              <div 
                key={v.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-500 shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">{v.name}</h4>
                        <span className="text-xs font-mono text-slate-400">{v.plat}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      v.status === 'Siap' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      v.status === 'Bertugas' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <div className="flex justify-between py-0.5">
                      <span>Tipe Unit:</span>
                      <span className="text-slate-200 font-semibold">{v.tipe}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>Lokasi Pos:</span>
                      <span className="text-slate-200 font-semibold">{v.location}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>Pengemudi / Driver:</span>
                      <span className="text-slate-200 font-semibold">{v.driver}</span>
                    </div>
                  </div>

                  {/* Fuel Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-rose-500" />
                        Kapasitas Bahan Bakar
                      </span>
                      <span className={v.bensin <= 30 ? 'text-rose-400' : 'text-slate-300'}>{v.bensin}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          v.bensin <= 30 ? 'bg-rose-500' :
                          v.bensin <= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${v.bensin}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onRefillFuel(v.id)}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Fuel className="w-3.5 h-3.5 text-orange-400" />
                    <span>Isi BBM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleStatus(v.id)}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ubah Status</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Vehicle */}
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
              <Truck className="w-5 h-5 text-rose-500" />
              Pendaftaran Unit Armada Baru
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Tambahkan data sarana mobil pemadam atau rescue ke sistem monitoring siaga.
            </p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nama Call-Sign Unit *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="cth: Fire Pumper 05 - Samarinda Seberang"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nomor Polisi (Plat) *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="KT 8123 BZ"
                    value={plat}
                    onChange={(e) => setPlat(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Jenis Kendaraan
                  </label>
                  <select
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    <option value="Fire Truck (4000L)">Mobil Pemadam (4000L)</option>
                    <option value="Water Supply (6000L)">Mobil Tangki Suplai (6000L)</option>
                    <option value="Aerial Ladder (32m)">Mobil Tangga / Snorkel</option>
                    <option value="Quick Response Rescue">Mobil Rescue Cepat</option>
                    <option value="Perahu Karet & Motor">Kendaraan Khusus / Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Driver / Pengemudi Utama
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nama Pengemudi"
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Lokasi Penempatan Pos
                  </label>
                  <input 
                    type="text" 
                    placeholder="Pos Sektor / Mako"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
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

export interface GasIncident {
  id: string;
  title: string;
  type: string;
  status: 'Aktif' | 'Monitoring' | 'Selesai';
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
  location: string;
  coords: [number, number];
  reporter: string;
  desc: string;
  time: string;
  loss: number;
  regionId?: string;
  responseTimeMinutes?: number;
}

export interface GasVehicle {
  id: number;
  name: string;
  plat: string;
  tipe: string;
  status: 'Siap' | 'Bertugas' | 'Servis';
  condition: 'Excellent' | 'Good' | 'Fair';
  bensin: number;
  driver: string;
  location: string;
  age: number;
}

export interface GasPersonel {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  status: 'Aktif' | 'Cuti' | 'Non-Aktif';
  phone: string;
  email: string;
  avatar: string;
  sertifikasi?: string[];
  kategori?: 'Struktural' | 'Fungsional' | 'Pelaksana' | 'PPPK' | 'Relawan';
  regionId?: string;
}

export interface RabItem {
  no: number;
  kegiatan: string;
  rincian: string;
  volume: number;
  satuan: string;
  biaya: number;
}

export const INITIAL_GAS_INCIDENTS: GasIncident[] = [];

export const INITIAL_GAS_VEHICLES: GasVehicle[] = [];

export const INITIAL_GAS_PERSONNEL: GasPersonel[] = [];

export const INITIAL_RAB_ITEMS: RabItem[] = [
  {
    no: 1,
    kegiatan: 'Persiapan & Perencanaan Sistem Terpadu',
    rincian: 'Pembentukan tim teknis inisiasi, koordinasi lintas 10 Kab/Kota, penyusunan KAK/TOR',
    volume: 1,
    satuan: 'Paket',
    biaya: 22000000
  },
  {
    no: 2,
    kegiatan: 'Analisis Kebutuhan & Desain Arsitektur SPBE',
    rincian: 'Pemetaan proses bisnis SPM kebakaran, rancang bangun UI/UX Command Center Kaltim',
    volume: 1,
    satuan: 'Paket',
    biaya: 35000000
  },
  {
    no: 3,
    kegiatan: 'Pengembangan Sistem Aplikasi SIMPROKAS',
    rincian: 'Pembangunan modul Spasial GIS, sinkronisasi 0ms, RBAC multi-wilayah, engine laporan PDF TTE',
    volume: 1,
    satuan: 'Sistem',
    biaya: 120000000
  },
  {
    no: 4,
    kegiatan: 'Infrastruktur, Cloud Hosting & Keamanan Informasi',
    rincian: 'Alokasi migrasi domain/hosting Diskominfo, integrasi sertifikat elektronik BSrE BSSN',
    volume: 1,
    satuan: 'Tahun',
    biaya: 45000000
  },
  {
    no: 5,
    kegiatan: 'Sosialisasi & Bimbingan Teknis (BIMTEK) 10 Kab/Kota',
    rincian: 'Pelaksanaan bimtek operator dinas kebakaran/Satpol PP/BPBD se-Kaltim, modul pelatihan',
    volume: 10,
    satuan: 'Daerah',
    biaya: 55000000
  },
  {
    no: 6,
    kegiatan: 'Pemeliharaan, Pendampingan & Optimalisasi Kinerja',
    rincian: 'Garansi pemeliharaan sistem, audit keamanan berkala, patching bug dan SLA 99.9%',
    volume: 1,
    satuan: 'Tahun',
    biaya: 25000000
  }
];

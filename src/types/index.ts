export type UserRole = 'admin_provinsi' | 'operator_kabkota' | 'eksekutif';

export interface RegionInfo {
  id: string;
  name: string; // e.g. 'Kota Samarinda'
  type: 'Kota' | 'Kabupaten';
  instansiName: string; // e.g. 'Dinas Pemadam Kebakaran dan Penyelamatan Kota Samarinda'
  instansiType: 'Dinas Pemadam Kebakaran dan Penyelamatan' | 'Dinas Pemadam Kebakaran' | 'Satuan Polisi Pamong Praja' | 'Badan Penanggulangan Bencana Daerah';
  tipeDefault: 'A' | 'B' | 'C';
  kadisDefault: {
    nama: string;
    nip: string;
    jabatan: string;
  };
  ibukota: string;
  badgeColor: string;
}

export type ReportPeriod = 'SEMESTER_1' | 'SEMESTER_2';
export type ReportStatus = 'draft' | 'submitted' | 'verified' | 'revision_needed';

export interface PengisiData {
  nama: string;
  nip: string;
  jabatan: string;
  noHp?: string;
}

export interface PejabatData {
  nama: string;
  nip: string;
  jabatan: string;
}

export interface BagianAKapasitas {
  namaInstansi: string;
  bentukKelembagaan: 'Dinas Pemadam Kebakaran dan Penyelamatan' | 'Dinas Pemadam Kebakaran' | 'Satuan Polisi Pamong Praja' | 'Badan Penanggulangan Bencana Daerah';
  tipeKelembagaan: 'A' | 'B' | 'C';
  jumlahMako: number;
  jumlahPosSektor: number;
  jumlahPos: number;
}

export interface BagianBSDM {
  pnsStruktural: number;
  pnsFungsional: number;
  pnsPelaksana: number;
  totalPns: number;
  pppk: number;
  pppkParuhWaktu: number;
  totalPppk: number;
  nonAsn: number;
  sertifikasi: {
    instruktur: number;
    inspektur: number;
    mfr: number;
    rescue: number;
  };
}

export interface BagianCSarpras {
  mobilDamkar: number;
  mobilTangki: number;
  mobilTangga: number;
  mobilRescue: number;
  kendaraanLainnya: number;
}

export interface BagianDRelawan {
  jumlahRelawan: number;
  jumlahDesaKelurahan: number;
}

export interface BagianELaporanKebakaran {
  response15Menit: number;
  sebabGasKompor: number;
  sebabListrik: number;
  sebabBahanBakar: number;
  sebabKelalaian: number;
  sebabLainnya: number;
  totalKejadian: number;
}

export interface BagianFOperasiPenyelamatan {
  kecelakaanTransportasi: number;
  waterRescue: number;
  animalRescue: number;
  ketinggian: number;
  bangunanRuntuh: number;
  pohonTumbang: number;
  percobaanBunuhDiri: number;
  pelepasanCincin: number;
  operasiLainnya: number;
  totalOperasi: number;
}

export interface BagianGKorbanKerugian {
  jiwaSelamat: number;
  korbanMeninggal: number;
  korbanLukaBakar: number;
  korbanLukaFisikLainnya: number;
  taksiranAsetSelamat: number; // Dalam Rupiah
  taksiranKerugian: number; // Dalam Rupiah
}

export interface BagianHInspeksi {
  bangunanRendah: number;
  bangunanRendahDiinspeksi: number;
  bangunanMenengah: number;
  bangunanMenengahDiinspeksi: number;
  bangunanTinggi: number;
  bangunanTinggiDiinspeksi: number;
}

export interface DamkarReport {
  id: string; // e.g. "samarinda-2026-SEMESTER_1"
  regionId: string;
  year: number; // 2026
  period: ReportPeriod;
  status: ReportStatus;
  
  pengisi: PengisiData;
  pejabat: PejabatData;
  
  bagianA: BagianAKapasitas;
  bagianB: BagianBSDM;
  bagianC: BagianCSarpras;
  bagianD: BagianDRelawan;
  bagianE: BagianELaporanKebakaran;
  bagianF: BagianFOperasiPenyelamatan;
  bagianG: BagianGKorbanKerugian;
  bagianH: BagianHInspeksi;
  
  submittedAt?: string;
  submittedBy?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  revisionNotes?: string;
  lastUpdated: string;
}

export interface UserSession {
  role: UserRole;
  regionId?: string; // If role === 'operator_kabkota'
  userName: string;
  nip: string;
  jabatan: string;
  instansi: string;
}

export interface SyncState {
  status: 'synced' | 'saving' | 'offline';
  lastSynced: string;
  pendingCount: number;
}

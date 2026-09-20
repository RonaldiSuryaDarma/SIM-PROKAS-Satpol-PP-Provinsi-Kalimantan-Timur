export interface JadwalPelaporan {
  periode: string;
  cakupan: string;
  lampiran: string;
  batasWaktu: string;
  keterangan: string;
}

export const SURAT_EDARAN_DATA = {
  nomor: '300.1/3326/SATPOL.PP-IV',
  sifat: 'Penting',
  lampiranText: 'III (tiga) Berkas',
  perihal: 'Pengumpulan Data Profil dan Kesiapsiagaan Kebakaran Kabupaten/Kota se-Kalimantan Timur Tahun 2026',
  tanggal: '2 Juli 2026',
  tempat: 'Samarinda',
  
  pengirim: {
    jabatan: 'Sekretaris Daerah Provinsi Kalimantan Timur',
    nama: 'Dra. Sri Wahyuni, M.PP.',
    pangkat: 'Pembina Utama (IV/e)',
    nip: '19671224 199403 2 001'
  },

  instansiPengelola: {
    nama: 'Satuan Polisi Pamong Praja Provinsi Kalimantan Timur',
    bidang: 'Bidang Kebakaran',
    alamat: 'Jalan Gajah Mada Nomor 2, Samarinda, Kalimantan Timur 75121',
    telepon: '(0541) 733333; Faksimile: (0541) 737762',
    email: 'satpolpp@kaltimprov.go.id',
    subdomain: 'simprokas.kaltimprov.go.id'
  },

  dasarHukum: [
    'Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah (Urusan Wajib Pelayanan Dasar Sub Urusan Kebakaran dan Pemetaan Rawan Kebakaran)',
    'Peraturan Pemerintah Nomor 2 Tahun 2018 tentang Standar Pelayanan Minimal (SPM)',
    'Peraturan Menteri Dalam Negeri Nomor 114 Tahun 2018 tentang Standar Teknis Pelayanan Dasar pada Standar Pelayanan Minimal Sub Urusan Kebakaran Daerah Kabupaten/Kota',
    'Peraturan Menteri Dalam Negeri Nomor 16 Tahun 2020 tentang Pedoman Nomenklatur Perangkat Daerah dan Unit Kerja pada Perangkat Daerah yang Menyelenggarakan Sub Urusan Kebakaran'
  ],

  jadwalPelaporan: [
    {
      periode: 'Semester I Tahun 2026',
      cakupan: 'Data Kinerja Januari s.d Juni 2026',
      lampiran: 'Lampiran II',
      batasWaktu: 'Paling lambat 13 Juli 2026',
      keterangan: 'Laporan Semesteran Tahap 1 untuk evaluasi tengah tahun kesiapsiagaan kebakaran dan pemenuhan SPM 15 menit.'
    },
    {
      periode: 'Semester II Tahun 2026',
      cakupan: 'Data Kinerja Januari s.d Desember 2026 (Akumulatif Tahunan)',
      lampiran: 'Lampiran III',
      batasWaktu: 'Paling lambat 11 Januari 2027',
      keterangan: 'Laporan Tahunan Akumulatif sebagai dasar Profil Kesiapsiagaan Kebakaran dan Penyelamatan Kalimantan Timur 2026.'
    }
  ],

  tembusan: [
    'Gubernur Kalimantan Timur (sebagai laporan)',
    'Inspektur Daerah Provinsi Kalimantan Timur',
    'Kepala Satuan Polisi Pamong Praja Provinsi Kalimantan Timur',
    'Arsip'
  ]
};

import { DamkarReport, ReportPeriod } from '../types';
import { REGIONS_KALTIM } from './regions';

export function createBlankReport(regionId: string, period: ReportPeriod, year: number = 2026): DamkarReport {
  return createBaselineReport(regionId, period, year);
}

export function createBaselineReport(regionId: string, period: ReportPeriod, year: number = 2026): DamkarReport {
  const reg = REGIONS_KALTIM.find(r => r.id === regionId) || REGIONS_KALTIM[0];

  // Specific official preset profiles based on Kaltim real data
  const presets: Record<string, Partial<DamkarReport>> = {
    berau: {
      status: 'submitted',
      submittedAt: '2026-09-22T08:30:00.000Z',
      submittedBy: 'Ahmad Fauzi, S.Kom. (Operator Damkar Berau)',
      pengisi: {
        nama: 'Ahmad Fauzi, S.Kom.',
        nip: '19880512 201101 1 003',
        jabatan: 'Pranata Komputer / Operator Data Damkar',
        noHp: '0812-5489-7712'
      },
      pejabat: {
        nama: 'Drs. M. Noviar Ridwan, M.M.',
        nip: '19671205 199303 1 005',
        jabatan: 'Kepala Dinas Pemadam Kebakaran dan Penyelamatan'
      },
      bagianA: {
        namaInstansi: 'Dinas Pemadam Kebakaran dan Penyelamatan Kab. Berau',
        bentukKelembagaan: 'Dinas Pemadam Kebakaran dan Penyelamatan',
        tipeKelembagaan: 'B',
        jumlahMako: 1,
        jumlahPosSektor: 4,
        jumlahPos: 6
      },
      bagianB: {
        pnsStruktural: 12,
        pnsFungsional: 24,
        pnsPelaksana: 12,
        totalPns: 48,
        pppk: 20,
        pppkParuhWaktu: 6,
        totalPppk: 26,
        nonAsn: 65,
        sertifikasi: {
          instruktur: 4,
          inspektur: 6,
          mfr: 32,
          rescue: 28
        }
      },
      bagianC: {
        mobilDamkar: 8,
        mobilTangki: 4,
        mobilTangga: 1,
        mobilRescue: 2,
        kendaraanLainnya: 6
      },
      bagianD: {
        jumlahRelawan: 140,
        jumlahDesaKelurahan: 28
      },
      bagianE: {
        response15Menit: 39,
        sebabGasKompor: 11,
        sebabListrik: 19,
        sebabBahanBakar: 5,
        sebabKelalaian: 4,
        sebabLainnya: 3,
        totalKejadian: 42
      },
      bagianF: {
        kecelakaanTransportasi: 5,
        waterRescue: 8,
        animalRescue: 26,
        ketinggian: 3,
        bangunanRuntuh: 1,
        pohonTumbang: 12,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 7,
        operasiLainnya: 2,
        totalOperasi: 64
      },
      bagianG: {
        jiwaSelamat: 118,
        korbanMeninggal: 0,
        korbanLukaBakar: 3,
        korbanLukaFisikLainnya: 2,
        taksiranAsetSelamat: 14850000000,
        taksiranKerugian: 850000000
      },
      bagianH: {
        bangunanRendah: 180,
        bangunanRendahDiinspeksi: 45,
        bangunanMenengah: 60,
        bangunanMenengahDiinspeksi: 18,
        bangunanTinggi: 12,
        bangunanTinggiDiinspeksi: 4
      }
    },
    samarinda: {
      status: 'verified',
      verifiedAt: '2026-09-20T10:00:00.000Z',
      verifiedBy: 'Satpol PP Provinsi Kalimantan Timur',
      pengisi: {
        nama: 'Bambang Irawan, S.E.',
        nip: '19790314 200501 1 007',
        jabatan: 'Analis Kebakaran Ahli Muda',
        noHp: '0811-5544-221'
      },
      pejabat: {
        nama: 'H. Hendra AH, S.Sos., M.Si.',
        nip: '19690412 199303 1 008',
        jabatan: 'Kepala Dinas Pemadam Kebakaran dan Penyelamatan'
      },
      bagianA: {
        namaInstansi: 'Dinas Pemadam Kebakaran dan Penyelamatan Kota Samarinda',
        bentukKelembagaan: 'Dinas Pemadam Kebakaran dan Penyelamatan',
        tipeKelembagaan: 'A',
        jumlahMako: 1,
        jumlahPosSektor: 8,
        jumlahPos: 11
      },
      bagianB: {
        pnsStruktural: 18,
        pnsFungsional: 58,
        pnsPelaksana: 36,
        totalPns: 112,
        pppk: 54,
        pppkParuhWaktu: 24,
        totalPppk: 78,
        nonAsn: 164,
        sertifikasi: {
          instruktur: 12,
          inspektur: 16,
          mfr: 85,
          rescue: 72
        }
      },
      bagianC: {
        mobilDamkar: 18,
        mobilTangki: 8,
        mobilTangga: 2,
        mobilRescue: 5,
        kendaraanLainnya: 12
      },
      bagianD: {
        jumlahRelawan: 320,
        jumlahDesaKelurahan: 59
      },
      bagianE: {
        response15Menit: 116,
        sebabGasKompor: 28,
        sebabListrik: 68,
        sebabBahanBakar: 12,
        sebabKelalaian: 10,
        sebabLainnya: 6,
        totalKejadian: 124
      },
      bagianF: {
        kecelakaanTransportasi: 14,
        waterRescue: 22,
        animalRescue: 78,
        ketinggian: 8,
        bangunanRuntuh: 3,
        pohonTumbang: 32,
        percobaanBunuhDiri: 1,
        pelepasanCincin: 24,
        operasiLainnya: 4,
        totalOperasi: 186
      },
      bagianG: {
        jiwaSelamat: 340,
        korbanMeninggal: 1,
        korbanLukaBakar: 6,
        korbanLukaFisikLainnya: 4,
        taksiranAsetSelamat: 45200000000,
        taksiranKerugian: 3800000000
      },
      bagianH: {
        bangunanRendah: 450,
        bangunanRendahDiinspeksi: 120,
        bangunanMenengah: 180,
        bangunanMenengahDiinspeksi: 65,
        bangunanTinggi: 48,
        bangunanTinggiDiinspeksi: 22
      }
    },
    balikpapan: {
      status: 'verified',
      verifiedAt: '2026-09-20T11:30:00.000Z',
      verifiedBy: 'Satpol PP Provinsi Kalimantan Timur',
      pengisi: {
        nama: 'Rian Syahputra, S.Sos.',
        nip: '19840217 200803 1 002',
        jabatan: 'Pranata Bencana BPBD',
        noHp: '0812-5888-9901'
      },
      pejabat: {
        nama: 'Usman Ali, S.E., M.Si.',
        nip: '19710815 199702 1 004',
        jabatan: 'Kepala Pelaksana BPBD Kota Balikpapan'
      },
      bagianA: {
        namaInstansi: 'Badan Penanggulangan Bencana Daerah Kota Balikpapan',
        bentukKelembagaan: 'Badan Penanggulangan Bencana Daerah',
        tipeKelembagaan: 'A',
        jumlahMako: 1,
        jumlahPosSektor: 7,
        jumlahPos: 8
      },
      bagianB: {
        pnsStruktural: 16,
        pnsFungsional: 48,
        pnsPelaksana: 30,
        totalPns: 94,
        pppk: 42,
        pppkParuhWaktu: 20,
        totalPppk: 62,
        nonAsn: 138,
        sertifikasi: {
          instruktur: 10,
          inspektur: 14,
          mfr: 72,
          rescue: 65
        }
      },
      bagianC: {
        mobilDamkar: 15,
        mobilTangki: 7,
        mobilTangga: 2,
        mobilRescue: 4,
        kendaraanLainnya: 9
      },
      bagianD: {
        jumlahRelawan: 260,
        jumlahDesaKelurahan: 34
      },
      bagianE: {
        response15Menit: 92,
        sebabGasKompor: 21,
        sebabListrik: 54,
        sebabBahanBakar: 9,
        sebabKelalaian: 8,
        sebabLainnya: 6,
        totalKejadian: 98
      },
      bagianF: {
        kecelakaanTransportasi: 11,
        waterRescue: 16,
        animalRescue: 62,
        ketinggian: 6,
        bangunanRuntuh: 2,
        pohonTumbang: 25,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 18,
        operasiLainnya: 2,
        totalOperasi: 142
      },
      bagianG: {
        jiwaSelamat: 275,
        korbanMeninggal: 0,
        korbanLukaBakar: 4,
        korbanLukaFisikLainnya: 3,
        taksiranAsetSelamat: 38600000000,
        taksiranKerugian: 2900000000
      },
      bagianH: {
        bangunanRendah: 380,
        bangunanRendahDiinspeksi: 95,
        bangunanMenengah: 160,
        bangunanMenengahDiinspeksi: 58,
        bangunanTinggi: 55,
        bangunanTinggiDiinspeksi: 26
      }
    },
    bontang: {
      status: 'verified',
      verifiedAt: '2026-09-21T09:15:00.000Z',
      verifiedBy: 'Satpol PP Provinsi Kalimantan Timur',
      pengisi: {
        nama: 'Dedi Kurniawan, S.T.',
        nip: '19870911 201001 1 005',
        jabatan: 'Koordinator Regu Pemadam',
        noHp: '0813-4672-8819'
      },
      pejabat: {
        nama: 'Drs. Amiluddin, M.Si.',
        nip: '19680320 199201 1 002',
        jabatan: 'Kepala Dinas Pemadam Kebakaran dan Penyelamatan'
      },
      bagianA: {
        namaInstansi: 'Dinas Pemadam Kebakaran dan Penyelamatan Kota Bontang',
        bentukKelembagaan: 'Dinas Pemadam Kebakaran dan Penyelamatan',
        tipeKelembagaan: 'B',
        jumlahMako: 1,
        jumlahPosSektor: 3,
        jumlahPos: 4
      },
      bagianB: {
        pnsStruktural: 10,
        pnsFungsional: 28,
        pnsPelaksana: 14,
        totalPns: 52,
        pppk: 22,
        pppkParuhWaktu: 8,
        totalPppk: 30,
        nonAsn: 68,
        sertifikasi: {
          instruktur: 6,
          inspektur: 8,
          mfr: 42,
          rescue: 38
        }
      },
      bagianC: {
        mobilDamkar: 9,
        mobilTangki: 4,
        mobilTangga: 1,
        mobilRescue: 2,
        kendaraanLainnya: 5
      },
      bagianD: {
        jumlahRelawan: 120,
        jumlahDesaKelurahan: 15
      },
      bagianE: {
        response15Menit: 35,
        sebabGasKompor: 8,
        sebabListrik: 20,
        sebabBahanBakar: 4,
        sebabKelalaian: 2,
        sebabLainnya: 2,
        totalKejadian: 36
      },
      bagianF: {
        kecelakaanTransportasi: 4,
        waterRescue: 6,
        animalRescue: 24,
        ketinggian: 2,
        bangunanRuntuh: 1,
        pohonTumbang: 9,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 6,
        operasiLainnya: 2,
        totalOperasi: 54
      },
      bagianG: {
        jiwaSelamat: 95,
        korbanMeninggal: 0,
        korbanLukaBakar: 1,
        korbanLukaFisikLainnya: 1,
        taksiranAsetSelamat: 16200000000,
        taksiranKerugian: 720000000
      },
      bagianH: {
        bangunanRendah: 140,
        bangunanRendahDiinspeksi: 38,
        bangunanMenengah: 55,
        bangunanMenengahDiinspeksi: 20,
        bangunanTinggi: 15,
        bangunanTinggiDiinspeksi: 6
      }
    },
    kukar: {
      status: 'submitted',
      submittedAt: '2026-09-22T09:00:00.000Z',
      submittedBy: 'Hendra Saputra (Operator Damkar Kukar)',
      pengisi: {
        nama: 'Hendra Saputra',
        nip: '19850619 200902 1 003',
        jabatan: 'Operator Pengolah Data Damkar',
        noHp: '0812-5331-4455'
      },
      pejabat: {
        nama: 'Fida Hurasani, S.Sos., M.Si.',
        nip: '19730510 199503 1 003',
        jabatan: 'Kepala Dinas Pemadam Kebakaran dan Penyelamatan'
      },
      bagianA: {
        namaInstansi: 'Dinas Pemadam Kebakaran dan Penyelamatan Kab. Kutai Kartanegara',
        bentukKelembagaan: 'Dinas Pemadam Kebakaran dan Penyelamatan',
        tipeKelembagaan: 'A',
        jumlahMako: 1,
        jumlahPosSektor: 6,
        jumlahPos: 8
      },
      bagianB: {
        pnsStruktural: 15,
        pnsFungsional: 45,
        pnsPelaksana: 26,
        totalPns: 86,
        pppk: 32,
        pppkParuhWaktu: 12,
        totalPppk: 44,
        nonAsn: 110,
        sertifikasi: {
          instruktur: 8,
          inspektur: 10,
          mfr: 58,
          rescue: 52
        }
      },
      bagianC: {
        mobilDamkar: 12,
        mobilTangki: 6,
        mobilTangga: 0,
        mobilRescue: 3,
        kendaraanLainnya: 8
      },
      bagianD: {
        jumlahRelawan: 210,
        jumlahDesaKelurahan: 45
      },
      bagianE: {
        response15Menit: 65,
        sebabGasKompor: 16,
        sebabListrik: 38,
        sebabBahanBakar: 8,
        sebabKelalaian: 6,
        sebabLainnya: 4,
        totalKejadian: 72
      },
      bagianF: {
        kecelakaanTransportasi: 8,
        waterRescue: 14,
        animalRescue: 38,
        ketinggian: 4,
        bangunanRuntuh: 2,
        pohonTumbang: 14,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 6,
        operasiLainnya: 2,
        totalOperasi: 88
      },
      bagianG: {
        jiwaSelamat: 195,
        korbanMeninggal: 0,
        korbanLukaBakar: 3,
        korbanLukaFisikLainnya: 2,
        taksiranAsetSelamat: 24500000000,
        taksiranKerugian: 1650000000
      },
      bagianH: {
        bangunanRendah: 280,
        bangunanRendahDiinspeksi: 72,
        bangunanMenengah: 85,
        bangunanMenengahDiinspeksi: 28,
        bangunanTinggi: 18,
        bangunanTinggiDiinspeksi: 8
      }
    },
    kutim: {
      status: 'submitted',
      submittedAt: '2026-09-22T09:30:00.000Z',
      submittedBy: 'Zainuddin, S.AP.',
      pengisi: {
        nama: 'Zainuddin, S.AP.',
        nip: '19890415 201201 1 002',
        jabatan: 'Staf Operasi Damkar',
        noHp: '0821-5509-3321'
      },
      pejabat: {
        nama: 'Failu, S.Sos., M.AP.',
        nip: '19701104 199602 1 001',
        jabatan: 'Kepala Dinas Pemadam Kebakaran dan Penyelamatan'
      },
      bagianA: {
        namaInstansi: 'Dinas Pemadam Kebakaran dan Penyelamatan Kab. Kutai Timur',
        bentukKelembagaan: 'Dinas Pemadam Kebakaran dan Penyelamatan',
        tipeKelembagaan: 'B',
        jumlahMako: 1,
        jumlahPosSektor: 4,
        jumlahPos: 6
      },
      bagianB: {
        pnsStruktural: 12,
        pnsFungsional: 28,
        pnsPelaksana: 16,
        totalPns: 56,
        pppk: 20,
        pppkParuhWaktu: 8,
        totalPppk: 28,
        nonAsn: 82,
        sertifikasi: {
          instruktur: 5,
          inspektur: 7,
          mfr: 36,
          rescue: 30
        }
      },
      bagianC: {
        mobilDamkar: 8,
        mobilTangki: 4,
        mobilTangga: 0,
        mobilRescue: 2,
        kendaraanLainnya: 5
      },
      bagianD: {
        jumlahRelawan: 150,
        jumlahDesaKelurahan: 30
      },
      bagianE: {
        response15Menit: 42,
        sebabGasKompor: 10,
        sebabListrik: 24,
        sebabBahanBakar: 6,
        sebabKelalaian: 5,
        sebabLainnya: 3,
        totalKejadian: 48
      },
      bagianF: {
        kecelakaanTransportasi: 5,
        waterRescue: 8,
        animalRescue: 28,
        ketinggian: 2,
        bangunanRuntuh: 1,
        pohonTumbang: 10,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 4,
        operasiLainnya: 2,
        totalOperasi: 60
      },
      bagianG: {
        jiwaSelamat: 125,
        korbanMeninggal: 0,
        korbanLukaBakar: 2,
        korbanLukaFisikLainnya: 2,
        taksiranAsetSelamat: 18200000000,
        taksiranKerugian: 1100000000
      },
      bagianH: {
        bangunanRendah: 190,
        bangunanRendahDiinspeksi: 48,
        bangunanMenengah: 62,
        bangunanMenengahDiinspeksi: 19,
        bangunanTinggi: 10,
        bangunanTinggiDiinspeksi: 4
      }
    },
    ppu: {
      status: 'submitted',
      submittedAt: '2026-09-22T08:45:00.000Z',
      submittedBy: 'Wahyu Ramadhan',
      pengisi: {
        nama: 'Wahyu Ramadhan',
        nip: '19910120 201402 1 004',
        jabatan: 'Operator Laporan Damkar',
        noHp: '0852-4411-9988'
      },
      pejabat: {
        nama: 'H. Fernando, S.STP., M.Si.',
        nip: '19780621 199810 1 001',
        jabatan: 'Kepala Dinas Pemadam Kebakaran dan Penyelamatan'
      },
      bagianA: {
        namaInstansi: 'Dinas Pemadam Kebakaran dan Penyelamatan Kab. Penajam Paser Utara',
        bentukKelembagaan: 'Dinas Pemadam Kebakaran dan Penyelamatan',
        tipeKelembagaan: 'B',
        jumlahMako: 1,
        jumlahPosSektor: 3,
        jumlahPos: 4
      },
      bagianB: {
        pnsStruktural: 10,
        pnsFungsional: 22,
        pnsPelaksana: 12,
        totalPns: 44,
        pppk: 16,
        pppkParuhWaktu: 6,
        totalPppk: 22,
        nonAsn: 58,
        sertifikasi: {
          instruktur: 4,
          inspektur: 5,
          mfr: 28,
          rescue: 25
        }
      },
      bagianC: {
        mobilDamkar: 7,
        mobilTangki: 3,
        mobilTangga: 0,
        mobilRescue: 2,
        kendaraanLainnya: 4
      },
      bagianD: {
        jumlahRelawan: 110,
        jumlahDesaKelurahan: 24
      },
      bagianE: {
        response15Menit: 29,
        sebabGasKompor: 7,
        sebabListrik: 16,
        sebabBahanBakar: 4,
        sebabKelalaian: 3,
        sebabLainnya: 2,
        totalKejadian: 32
      },
      bagianF: {
        kecelakaanTransportasi: 4,
        waterRescue: 5,
        animalRescue: 20,
        ketinggian: 1,
        bangunanRuntuh: 1,
        pohonTumbang: 8,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 3,
        operasiLainnya: 2,
        totalOperasi: 44
      },
      bagianG: {
        jiwaSelamat: 88,
        korbanMeninggal: 0,
        korbanLukaBakar: 1,
        korbanLukaFisikLainnya: 1,
        taksiranAsetSelamat: 12400000000,
        taksiranKerugian: 680000000
      },
      bagianH: {
        bangunanRendah: 130,
        bangunanRendahDiinspeksi: 34,
        bangunanMenengah: 40,
        bangunanMenengahDiinspeksi: 12,
        bangunanTinggi: 8,
        bangunanTinggiDiinspeksi: 3
      }
    },
    paser: {
      status: 'draft',
      pengisi: {
        nama: 'Arif Budiman',
        nip: '19900812 201301 1 002',
        jabatan: 'Operator SIMPROKAS',
        noHp: '0812-5120-7766'
      },
      pejabat: {
        nama: 'M. Lukman Dharma, S.STP., M.Si.',
        nip: '19760914 199612 1 001',
        jabatan: 'Kepala Dinas Pemadam Kebakaran'
      },
      bagianA: {
        namaInstansi: 'Dinas Pemadam Kebakaran Kab. Paser',
        bentukKelembagaan: 'Dinas Pemadam Kebakaran',
        tipeKelembagaan: 'B',
        jumlahMako: 1,
        jumlahPosSektor: 3,
        jumlahPos: 4
      },
      bagianB: {
        pnsStruktural: 10,
        pnsFungsional: 24,
        pnsPelaksana: 12,
        totalPns: 46,
        pppk: 18,
        pppkParuhWaktu: 6,
        totalPppk: 24,
        nonAsn: 62,
        sertifikasi: {
          instruktur: 4,
          inspektur: 5,
          mfr: 30,
          rescue: 26
        }
      },
      bagianC: {
        mobilDamkar: 7,
        mobilTangki: 3,
        mobilTangga: 0,
        mobilRescue: 2,
        kendaraanLainnya: 4
      },
      bagianD: {
        jumlahRelawan: 105,
        jumlahDesaKelurahan: 22
      },
      bagianE: {
        response15Menit: 25,
        sebabGasKompor: 6,
        sebabListrik: 14,
        sebabBahanBakar: 4,
        sebabKelalaian: 2,
        sebabLainnya: 2,
        totalKejadian: 28
      },
      bagianF: {
        kecelakaanTransportasi: 3,
        waterRescue: 5,
        animalRescue: 18,
        ketinggian: 1,
        bangunanRuntuh: 1,
        pohonTumbang: 6,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 3,
        operasiLainnya: 1,
        totalOperasi: 38
      },
      bagianG: {
        jiwaSelamat: 76,
        korbanMeninggal: 0,
        korbanLukaBakar: 1,
        korbanLukaFisikLainnya: 1,
        taksiranAsetSelamat: 11200000000,
        taksiranKerugian: 590000000
      },
      bagianH: {
        bangunanRendah: 120,
        bangunanRendahDiinspeksi: 30,
        bangunanMenengah: 35,
        bangunanMenengahDiinspeksi: 10,
        bangunanTinggi: 6,
        bangunanTinggiDiinspeksi: 2
      }
    },
    kubar: {
      status: 'draft',
      pengisi: {
        nama: 'Kornelius Yoga',
        nip: '19920311 201503 1 001',
        jabatan: 'Petugas Damkar Satpol PP',
        noHp: '0822-5001-4433'
      },
      pejabat: {
        nama: 'Franky Arden, S.STP., M.Si.',
        nip: '19800218 200012 1 002',
        jabatan: 'Kepala Satuan Polisi Pamong Praja'
      },
      bagianA: {
        namaInstansi: 'Satuan Polisi Pamong Praja Kab. Kutai Barat',
        bentukKelembagaan: 'Satuan Polisi Pamong Praja',
        tipeKelembagaan: 'C',
        jumlahMako: 1,
        jumlahPosSektor: 2,
        jumlahPos: 3
      },
      bagianB: {
        pnsStruktural: 8,
        pnsFungsional: 20,
        pnsPelaksana: 10,
        totalPns: 38,
        pppk: 12,
        pppkParuhWaktu: 6,
        totalPppk: 18,
        nonAsn: 46,
        sertifikasi: {
          instruktur: 3,
          inspektur: 4,
          mfr: 22,
          rescue: 20
        }
      },
      bagianC: {
        mobilDamkar: 5,
        mobilTangki: 2,
        mobilTangga: 0,
        mobilRescue: 1,
        kendaraanLainnya: 3
      },
      bagianD: {
        jumlahRelawan: 85,
        jumlahDesaKelurahan: 18
      },
      bagianE: {
        response15Menit: 19,
        sebabGasKompor: 5,
        sebabListrik: 11,
        sebabBahanBakar: 3,
        sebabKelalaian: 2,
        sebabLainnya: 1,
        totalKejadian: 22
      },
      bagianF: {
        kecelakaanTransportasi: 2,
        waterRescue: 4,
        animalRescue: 12,
        ketinggian: 1,
        bangunanRuntuh: 0,
        pohonTumbang: 5,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 2,
        operasiLainnya: 0,
        totalOperasi: 26
      },
      bagianG: {
        jiwaSelamat: 58,
        korbanMeninggal: 0,
        korbanLukaBakar: 1,
        korbanLukaFisikLainnya: 1,
        taksiranAsetSelamat: 8500000000,
        taksiranKerugian: 420000000
      },
      bagianH: {
        bangunanRendah: 95,
        bangunanRendahDiinspeksi: 22,
        bangunanMenengah: 25,
        bangunanMenengahDiinspeksi: 6,
        bangunanTinggi: 4,
        bangunanTinggiDiinspeksi: 1
      }
    },
    mahulu: {
      status: 'draft',
      pengisi: {
        nama: 'Stefanus Huvat',
        nip: '19931105 201602 1 003',
        jabatan: 'Operator Data Lapangan',
        noHp: '0853-4889-1122'
      },
      pejabat: {
        nama: 'Kornelius Ding, S.E., M.Si.',
        nip: '19741009 200212 1 003',
        jabatan: 'Kepala Satuan Polisi Pamong Praja'
      },
      bagianA: {
        namaInstansi: 'Satuan Polisi Pamong Praja Kab. Mahakam Ulu',
        bentukKelembagaan: 'Satuan Polisi Pamong Praja',
        tipeKelembagaan: 'C',
        jumlahMako: 1,
        jumlahPosSektor: 1,
        jumlahPos: 2
      },
      bagianB: {
        pnsStruktural: 6,
        pnsFungsional: 14,
        pnsPelaksana: 6,
        totalPns: 26,
        pppk: 8,
        pppkParuhWaktu: 4,
        totalPppk: 12,
        nonAsn: 34,
        sertifikasi: {
          instruktur: 2,
          inspektur: 3,
          mfr: 16,
          rescue: 14
        }
      },
      bagianC: {
        mobilDamkar: 3,
        mobilTangki: 2,
        mobilTangga: 0,
        mobilRescue: 1,
        kendaraanLainnya: 2
      },
      bagianD: {
        jumlahRelawan: 60,
        jumlahDesaKelurahan: 12
      },
      bagianE: {
        response15Menit: 12,
        sebabGasKompor: 3,
        sebabListrik: 7,
        sebabBahanBakar: 2,
        sebabKelalaian: 1,
        sebabLainnya: 1,
        totalKejadian: 14
      },
      bagianF: {
        kecelakaanTransportasi: 2,
        waterRescue: 4,
        animalRescue: 6,
        ketinggian: 1,
        bangunanRuntuh: 0,
        pohonTumbang: 3,
        percobaanBunuhDiri: 0,
        pelepasanCincin: 1,
        operasiLainnya: 1,
        totalOperasi: 18
      },
      bagianG: {
        jiwaSelamat: 36,
        korbanMeninggal: 0,
        korbanLukaBakar: 0,
        korbanLukaFisikLainnya: 0,
        taksiranAsetSelamat: 4800000000,
        taksiranKerugian: 240000000
      },
      bagianH: {
        bangunanRendah: 65,
        bangunanRendahDiinspeksi: 15,
        bangunanMenengah: 14,
        bangunanMenengahDiinspeksi: 3,
        bangunanTinggi: 2,
        bangunanTinggiDiinspeksi: 1
      }
    }
  };

  const preset = presets[regionId] || {};

  const baseReport: DamkarReport = {
    id: `${regionId}-${year}-${period}`,
    regionId: regionId,
    year: year,
    period: period,
    status: preset.status || 'draft',
    submittedAt: preset.submittedAt,
    submittedBy: preset.submittedBy,
    verifiedAt: preset.verifiedAt,
    verifiedBy: preset.verifiedBy,
    revisionNotes: preset.revisionNotes,
    pengisi: {
      nama: preset.pengisi?.nama || '',
      nip: preset.pengisi?.nip || '',
      jabatan: preset.pengisi?.jabatan || '',
      noHp: preset.pengisi?.noHp || ''
    },
    pejabat: {
      nama: preset.pejabat?.nama || reg.kadisDefault.nama,
      nip: preset.pejabat?.nip || reg.kadisDefault.nip,
      jabatan: preset.pejabat?.jabatan || reg.kadisDefault.jabatan
    },
    bagianA: {
      namaInstansi: preset.bagianA?.namaInstansi || reg.instansiName,
      bentukKelembagaan: preset.bagianA?.bentukKelembagaan || reg.instansiType,
      tipeKelembagaan: preset.bagianA?.tipeKelembagaan || reg.tipeDefault,
      jumlahMako: preset.bagianA?.jumlahMako ?? 1,
      jumlahPosSektor: preset.bagianA?.jumlahPosSektor ?? 2,
      jumlahPos: preset.bagianA?.jumlahPos ?? 3
    },
    bagianB: {
      pnsStruktural: preset.bagianB?.pnsStruktural ?? 0,
      pnsFungsional: preset.bagianB?.pnsFungsional ?? 0,
      pnsPelaksana: preset.bagianB?.pnsPelaksana ?? 0,
      totalPns: preset.bagianB?.totalPns ?? 0,
      pppk: preset.bagianB?.pppk ?? 0,
      pppkParuhWaktu: preset.bagianB?.pppkParuhWaktu ?? 0,
      totalPppk: preset.bagianB?.totalPppk ?? 0,
      nonAsn: preset.bagianB?.nonAsn ?? 0,
      sertifikasi: {
        instruktur: preset.bagianB?.sertifikasi?.instruktur ?? 0,
        inspektur: preset.bagianB?.sertifikasi?.inspektur ?? 0,
        mfr: preset.bagianB?.sertifikasi?.mfr ?? 0,
        rescue: preset.bagianB?.sertifikasi?.rescue ?? 0
      }
    },
    bagianC: {
      mobilDamkar: preset.bagianC?.mobilDamkar ?? 0,
      mobilTangki: preset.bagianC?.mobilTangki ?? 0,
      mobilTangga: preset.bagianC?.mobilTangga ?? 0,
      mobilRescue: preset.bagianC?.mobilRescue ?? 0,
      kendaraanLainnya: preset.bagianC?.kendaraanLainnya ?? 0
    },
    bagianD: {
      jumlahRelawan: preset.bagianD?.jumlahRelawan ?? 0,
      jumlahDesaKelurahan: preset.bagianD?.jumlahDesaKelurahan ?? 0
    },
    bagianE: {
      response15Menit: preset.bagianE?.response15Menit ?? 0,
      sebabGasKompor: preset.bagianE?.sebabGasKompor ?? 0,
      sebabListrik: preset.bagianE?.sebabListrik ?? 0,
      sebabBahanBakar: preset.bagianE?.sebabBahanBakar ?? 0,
      sebabKelalaian: preset.bagianE?.sebabKelalaian ?? 0,
      sebabLainnya: preset.bagianE?.sebabLainnya ?? 0,
      totalKejadian: preset.bagianE?.totalKejadian ?? 0
    },
    bagianF: {
      kecelakaanTransportasi: preset.bagianF?.kecelakaanTransportasi ?? 0,
      waterRescue: preset.bagianF?.waterRescue ?? 0,
      animalRescue: preset.bagianF?.animalRescue ?? 0,
      ketinggian: preset.bagianF?.ketinggian ?? 0,
      bangunanRuntuh: preset.bagianF?.bangunanRuntuh ?? 0,
      pohonTumbang: preset.bagianF?.pohonTumbang ?? 0,
      percobaanBunuhDiri: preset.bagianF?.percobaanBunuhDiri ?? 0,
      pelepasanCincin: preset.bagianF?.pelepasanCincin ?? 0,
      operasiLainnya: preset.bagianF?.operasiLainnya ?? 0,
      totalOperasi: preset.bagianF?.totalOperasi ?? 0
    },
    bagianG: {
      jiwaSelamat: preset.bagianG?.jiwaSelamat ?? 0,
      korbanMeninggal: preset.bagianG?.korbanMeninggal ?? 0,
      korbanLukaBakar: preset.bagianG?.korbanLukaBakar ?? 0,
      korbanLukaFisikLainnya: preset.bagianG?.korbanLukaFisikLainnya ?? 0,
      taksiranAsetSelamat: preset.bagianG?.taksiranAsetSelamat ?? 0,
      taksiranKerugian: preset.bagianG?.taksiranKerugian ?? 0
    },
    bagianH: {
      bangunanRendah: preset.bagianH?.bangunanRendah ?? 0,
      bangunanRendahDiinspeksi: preset.bagianH?.bangunanRendahDiinspeksi ?? 0,
      bangunanMenengah: preset.bagianH?.bangunanMenengah ?? 0,
      bangunanMenengahDiinspeksi: preset.bagianH?.bangunanMenengahDiinspeksi ?? 0,
      bangunanTinggi: preset.bagianH?.bangunanTinggi ?? 0,
      bangunanTinggiDiinspeksi: preset.bagianH?.bangunanTinggiDiinspeksi ?? 0
    },
    lastUpdated: '1970-01-01T00:00:00.000Z'
  };

  return baseReport;
}

export const INITIAL_REPORTS: DamkarReport[] = [
  ...REGIONS_KALTIM.map(r => createBaselineReport(r.id, 'SEMESTER_1', 2026)),
  ...REGIONS_KALTIM.map(r => createBaselineReport(r.id, 'SEMESTER_2', 2026))
];


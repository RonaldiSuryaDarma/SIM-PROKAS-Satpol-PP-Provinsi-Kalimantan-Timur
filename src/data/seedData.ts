import { DamkarReport, ReportPeriod } from '../types';
import { REGIONS_KALTIM } from './regions';

/**
 * Creates a clean, empty Damkar report ready for official operator input.
 * No dummy names, no dummy counts. Everything starts empty (status: 'draft').
 */
export function createCleanReport(regionId: string, period: ReportPeriod = 'SEMESTER_1', year: number = 2026): DamkarReport {
  const reg = REGIONS_KALTIM.find(r => r.id === regionId) || REGIONS_KALTIM[0];

  return {
    id: `${regionId}-${year}-${period}`,
    regionId,
    year,
    period,
    status: 'draft',
    pengisi: {
      nama: '',
      nip: '',
      jabatan: '',
      noHp: ''
    },
    pejabat: {
      nama: '',
      nip: '',
      jabatan: ''
    },
    bagianA: {
      namaInstansi: reg.instansiName,
      bentukKelembagaan: reg.instansiType,
      tipeKelembagaan: reg.tipeDefault,
      jumlahMako: 0,
      jumlahPosSektor: 0,
      jumlahPos: 0
    },
    bagianB: {
      pnsStruktural: 0,
      pnsFungsional: 0,
      pnsPelaksana: 0,
      totalPns: 0,
      pppk: 0,
      pppkParuhWaktu: 0,
      totalPppk: 0,
      nonAsn: 0,
      sertifikasi: {
        instruktur: 0,
        inspektur: 0,
        mfr: 0,
        rescue: 0
      }
    },
    bagianC: {
      mobilDamkar: 0,
      mobilTangki: 0,
      mobilTangga: 0,
      mobilRescue: 0,
      kendaraanLainnya: 0
    },
    bagianD: {
      jumlahRelawan: 0,
      jumlahDesaKelurahan: 0
    },
    bagianE: {
      response15Menit: 0,
      sebabGasKompor: 0,
      sebabListrik: 0,
      sebabBahanBakar: 0,
      sebabKelalaian: 0,
      sebabLainnya: 0,
      totalKejadian: 0
    },
    bagianF: {
      kecelakaanTransportasi: 0,
      waterRescue: 0,
      animalRescue: 0,
      ketinggian: 0,
      bangunanRuntuh: 0,
      pohonTumbang: 0,
      percobaanBunuhDiri: 0,
      pelepasanCincin: 0,
      operasiLainnya: 0,
      totalOperasi: 0
    },
    bagianG: {
      jiwaSelamat: 0,
      korbanMeninggal: 0,
      korbanLukaBakar: 0,
      korbanLukaFisikLainnya: 0,
      taksiranAsetSelamat: 0,
      taksiranKerugian: 0
    },
    bagianH: {
      bangunanRendah: 0,
      bangunanRendahDiinspeksi: 0,
      bangunanMenengah: 0,
      bangunanMenengahDiinspeksi: 0,
      bangunanTinggi: 0,
      bangunanTinggiDiinspeksi: 0
    },
    lastUpdated: new Date().toISOString()
  };
}

export const createBlankReport = createCleanReport;
export const createBaselineReport = createCleanReport;

export const INITIAL_REPORTS: DamkarReport[] = [
  ...REGIONS_KALTIM.map(r => createCleanReport(r.id, 'SEMESTER_1', 2026)),
  ...REGIONS_KALTIM.map(r => createCleanReport(r.id, 'SEMESTER_2', 2026))
];

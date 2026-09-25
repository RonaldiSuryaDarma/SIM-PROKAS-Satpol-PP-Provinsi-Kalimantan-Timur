import React, { useState, useEffect } from 'react';
import { 
  Printer, ArrowLeft, CheckCircle2, ShieldCheck, QrCode, 
  FileText, Calendar, Building2, Phone, MapPin, Users,
  ChevronRight, Download, Share2, Copy, Check
} from 'lucide-react';
import { DamkarReport, ReportPeriod } from '../types';
import { REGIONS_KALTIM, PROVINSI_INFO } from '../data/regions';
import { SURAT_EDARAN_DATA } from '../data/suratEdaranData';
import { storageService } from '../services/storageService';

type ActiveLampiran = 'lampiran_1' | 'lampiran_2' | 'lampiran_3';

interface OfficialPdfPreviewProps {
  regionId: string;
  period: ReportPeriod;
  onBackToForm: () => void;
  onSelectRegion?: (regionId: string) => void;
}

export const OfficialPdfPreview: React.FC<OfficialPdfPreviewProps> = ({
  regionId: initialRegionId,
  period: initialPeriod,
  onBackToForm,
  onSelectRegion
}) => {
  // Determine default active lampiran from period
  const [activeLampiran, setActiveLampiran] = useState<ActiveLampiran>(
    initialPeriod === 'SEMESTER_2' ? 'lampiran_3' : 'lampiran_2'
  );
  const [selectedRegionId, setSelectedRegionId] = useState<string>(initialRegionId);
  const [copied, setCopied] = useState<boolean>(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsub();
  }, []);

  const activePeriod: ReportPeriod = activeLampiran === 'lampiran_3' ? 'SEMESTER_2' : 'SEMESTER_1';
  const report: DamkarReport = storageService.getReport(selectedRegionId, activePeriod, 2026);
  const region = REGIONS_KALTIM.find(r => r.id === selectedRegionId) || REGIONS_KALTIM[0];

  const handlePrint = () => {
    window.print();
  };

  const handleRegionChange = (newRegionId: string) => {
    setSelectedRegionId(newRegionId);
    if (onSelectRegion) {
      onSelectRegion(newRegionId);
    }
  };

  const handleCopySummary = () => {
    const text = `LAPORAN RESMI DAMKAR & PENYELAMATAN 2026
Wilayah: ${region.name}
Instansi: ${region.instansiName}
Lampiran: ${activeLampiran === 'lampiran_1' ? 'Lampiran I (Ketentuan & Surat Edaran)' : activeLampiran === 'lampiran_2' ? 'Lampiran II (Semester I)' : 'Lampiran III (Semester II)'}
Nomor Surat: ${SURAT_EDARAN_DATA.nomor}
Status: ${report.status.toUpperCase()}
Total Kebakaran: ${report.bagianE.totalKejadian} (Response 15 Menit: ${report.bagianE.response15Menit})
Total Operasi Rescue: ${report.bagianF.totalOperasi}
Total Relawan: ${report.bagianD.jumlahRelawan} di ${report.bagianD.jumlahDesaKelurahan} Desa/Kelurahan
Aset Selamat: Rp ${(report.bagianG.taksiranAsetSelamat || 0).toLocaleString('id-ID')}
Kerugian: Rp ${(report.bagianG.taksiranKerugian || 0).toLocaleString('id-ID')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + (num || 0).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Controls Bar (Hidden during print) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-4 print:hidden">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Dokumen Resmi Surat Edaran No. {SURAT_EDARAN_DATA.nomor}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  Format Sekda Kaltim
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Pilih tab Lampiran I, II, atau III untuk meninjau atau mencetak dokumen sesuai naskah dinas resmi.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Salin ringkasan data resmi"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Data'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
          </div>
        </div>

        {/* Lampiran Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-slate-100 pt-3">
          
          <button
            type="button"
            onClick={() => setActiveLampiran('lampiran_1')}
            className={`flex items-start gap-3 p-3 rounded-xl text-left border transition ${
              activeLampiran === 'lampiran_1'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeLampiran === 'lampiran_1' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Lampiran I</div>
              <div className="text-[11px] font-medium leading-tight">
                Surat Edaran Sekda, Jadwal & Ketentuan 10 Kab/Kota
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Batas Smt 1: 13 Juli 2026 • Smt 2: 11 Jan 2027
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveLampiran('lampiran_2')}
            className={`flex items-start gap-3 p-3 rounded-xl text-left border transition ${
              activeLampiran === 'lampiran_2'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeLampiran === 'lampiran_2' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Lampiran II</div>
              <div className="text-[11px] font-medium leading-tight">
                Laporan Kinerja Semester I (Januari s.d Juni)
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Format Resmi Bagian A s/d H per Wilayah
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveLampiran('lampiran_3')}
            className={`flex items-start gap-3 p-3 rounded-xl text-left border transition ${
              activeLampiran === 'lampiran_3'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeLampiran === 'lampiran_3' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Lampiran III</div>
              <div className="text-[11px] font-medium leading-tight">
                Laporan Kinerja Semester II (Januari s.d Desember)
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Akumulasi Kinerja 1 Tahun Penuh 2026
              </div>
            </div>
          </button>

        </div>

        {/* Region Selector Bar (Active for Lampiran II and Lampiran III) */}
        {activeLampiran !== 'lampiran_1' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Pilih Kabupaten / Kota:</span>
              <select
                value={selectedRegionId}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-1.5 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {REGIONS_KALTIM.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.instansiType === 'Dinas Pemadam Kebakaran dan Penyelamatan' ? 'Damkar' : r.instansiType})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Status Laporan:</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                report.status === 'verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : report.status === 'submitted'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {report.status === 'verified' ? 'Telah Terverifikasi Sah Provinsi' : report.status === 'submitted' ? 'Menunggu Verifikasi' : 'Draft Pengisian'}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* LAMPIRAN I VIEW: SURAT EDARAN RESMI SEKDA, JADWAL & DAFTAR 10 KAB/KOTA */}
      {/* ========================================================================= */}
      {activeLampiran === 'lampiran_1' && (
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-14 shadow-md rounded-2xl border border-slate-200 text-slate-900 text-sm leading-relaxed print:p-0 print:border-none print:shadow-none print:m-0 print:max-w-none print:rounded-none">
          
          {/* Kop Surat Resmi Pemprov Kaltim */}
          <div className="text-center pb-4 border-b-4 border-double border-slate-900 mb-6">
            <div className="font-serif font-black text-lg sm:text-xl tracking-wider text-slate-900 uppercase">
              PEMERINTAH PROVINSI KALIMANTAN TIMUR
            </div>
            <div className="font-serif font-extrabold text-base sm:text-lg tracking-widest text-slate-900 uppercase">
              SEKRETARIAT DAERAH
            </div>
            <div className="text-xs text-slate-700 mt-1">
              Jalan Gajah Mada Nomor 2, Samarinda, Kalimantan Timur 75121
            </div>
            <div className="text-xs text-slate-700">
              Telepon: (0541) 733333; Faksimile: (0541) 737762; Laman: http://kaltimprov.go.id
            </div>
          </div>

          {/* Metadata Surat */}
          <div className="flex justify-between items-start my-6 text-xs sm:text-sm">
            <table className="text-slate-800">
              <tbody>
                <tr>
                  <td className="w-24 font-medium py-0.5">Nomor</td>
                  <td className="w-3">:</td>
                  <td className="font-mono font-bold">{SURAT_EDARAN_DATA.nomor}</td>
                </tr>
                <tr>
                  <td className="font-medium py-0.5">Sifat</td>
                  <td>:</td>
                  <td>{SURAT_EDARAN_DATA.sifat}</td>
                </tr>
                <tr>
                  <td className="font-medium py-0.5">Lampiran</td>
                  <td>:</td>
                  <td className="font-semibold">{SURAT_EDARAN_DATA.lampiranText}</td>
                </tr>
                <tr>
                  <td className="font-medium py-0.5 align-top">Hal</td>
                  <td className="align-top">:</td>
                  <td className="font-bold max-w-md">
                    {SURAT_EDARAN_DATA.perihal}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-right text-xs sm:text-sm text-slate-800">
              <div>{SURAT_EDARAN_DATA.tempat}, {SURAT_EDARAN_DATA.tanggal}</div>
              <div className="mt-4 text-left font-medium">
                <div>Kepada Yth.</div>
                <div className="font-bold">1. Bupati / Walikota se-Kalimantan Timur</div>
                <div className="font-bold">2. Kepala Dinas Damkar / BPBD / Satpol PP Kab/Kota</div>
                <div>di -</div>
                <div className="font-semibold pl-4">TEMPAT</div>
              </div>
            </div>
          </div>

          {/* Isi Surat Pokok */}
          <div className="space-y-3 text-xs sm:text-sm text-justify leading-relaxed text-slate-800">
            <p className="indent-8">
              Dalam rangka pelaksanaan <strong>Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah</strong>, Peraturan Pemerintah Nomor 2 Tahun 2018 tentang Standar Pelayanan Minimal (SPM), serta Peraturan Menteri Dalam Negeri Nomor 114 Tahun 2018 tentang Standar Teknis Pelayanan Dasar pada Standar Pelayanan Minimal Sub Urusan Kebakaran Daerah Kabupaten/Kota, Pemerintah Provinsi Kalimantan Timur melalui Satuan Polisi Pamong Praja (Bidang Kebakaran) melaksanakan pembinaan dan pengawasan serta penyusunan Profil Kesiapsiagaan Kebakaran dan Penyelamatan Kalimantan Timur Tahun 2026.
            </p>

            <p className="indent-8">
              Sehubungan dengan hal tersebut, guna mewujudkan basis data kebencanaan yang akurat, terpadu, dan berkesinambungan, bersama ini disampaikan beberapa hal sebagai berikut:
            </p>

            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Pemerintah Daerah Kabupaten/Kota melalui Dinas Pemadam Kebakaran dan Penyelamatan / Badan Penanggulangan Bencana Daerah / Satuan Polisi Pamong Praja Kabupaten/Kota wajib melakukan pemutakhiran dan pelaporan data penanggulangan kebakaran dan penyelamatan secara berkala 2 (dua) kali dalam 1 (satu) tahun anggaran.
              </li>
              <li>
                Pelaporan dilakukan menggunakan instrumen baku sebagaimana tercantum pada <strong>Lampiran II</strong> (Laporan Semester I) dan <strong>Lampiran III</strong> (Laporan Semester II) Surat Edaran ini, atau melalui aplikasi <strong>SIMPROKAS (Sistem Informasi Manajemen Profil Kebakaran dan Penyelamatan)</strong> pada portal terpadu Pemerintah Provinsi Kalimantan Timur.
              </li>
              <li>
                Jadwal batas waktu penyampaian laporan ditetapkan sebagai berikut:
                <div className="my-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-300 font-bold text-slate-900">
                        <th className="text-left py-1.5">Periode Laporan</th>
                        <th className="text-left py-1.5">Cakupan Data</th>
                        <th className="text-left py-1.5">Format Dokumen</th>
                        <th className="text-left py-1.5">Batas Akhir Penyampaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {SURAT_EDARAN_DATA.jadwalPelaporan.map((j, idx) => (
                        <tr key={idx}>
                          <td className="py-2 font-bold text-slate-800">{j.periode}</td>
                          <td className="py-2">{j.cakupan}</td>
                          <td className="py-2 font-semibold text-amber-700">{j.lampiran}</td>
                          <td className="py-2 font-black text-rose-700">{j.batasWaktu}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </li>
              <li>
                Setiap dokumen laporan wajib disahkan dengan <strong>Tanda Tangan Elektronik (TTE)</strong> yang tersertifikasi oleh Balai Sertifikasi Elektronik (BSrE) BSSN atau tanda tangan basah bermeterai dan cap dinas resmi oleh Kepala Instansi perangkat daerah yang bersangkutan.
              </li>
            </ol>

            <p className="indent-8 pt-2">
              Demikian Surat Edaran ini disampaikan untuk menjadi pedoman dan dilaksanakan dengan penuh rasa tanggung jawab demi keselamatan masyarakat Kalimantan Timur.
            </p>
          </div>

          {/* Tanda Tangan Sekda */}
          <div className="mt-12 flex justify-end text-xs sm:text-sm">
            <div className="text-center w-72 space-y-2">
              <p className="font-semibold text-slate-800">
                {SURAT_EDARAN_DATA.pengirim.jabatan},
              </p>
              
              {/* TTE Box Sekda */}
              <div className="h-28 flex items-center justify-center">
                <div className="border border-emerald-400 bg-emerald-50/60 rounded-xl p-3 flex items-center gap-3 text-left">
                  <QrCode className="w-12 h-12 text-emerald-800 flex-shrink-0" />
                  <div className="text-[10px] text-emerald-950 leading-tight">
                    <div className="font-black">DITANDATANGANI ELEKTRONIK</div>
                    <div className="font-semibold">Sertifikat BSrE BSSN</div>
                    <div className="font-mono text-[9px] text-emerald-700">Ref: SE-300.1-3326-2026</div>
                  </div>
                </div>
              </div>

              <p className="font-bold underline text-slate-900 text-sm">
                {SURAT_EDARAN_DATA.pengirim.nama}
              </p>
              <p className="text-slate-600 text-xs">
                {SURAT_EDARAN_DATA.pengirim.pangkat}
              </p>
              <p className="text-slate-600 font-mono text-xs">
                NIP. {SURAT_EDARAN_DATA.pengirim.nip}
              </p>
            </div>
          </div>

          {/* Tembusan */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="font-bold text-slate-800 mb-1">Tembusan Yth.:</div>
            <ol className="list-decimal pl-5 space-y-0.5">
              {SURAT_EDARAN_DATA.tembusan.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ol>
          </div>

          {/* LAMPIRAN I TABLE: DAFTAR 10 KABUPATEN/KOTA */}
          <div className="mt-14 pt-8 border-t-2 border-slate-300 page-break-before">
            <div className="text-center mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                LAMPIRAN I SURAT EDARAN
              </div>
              <div className="text-xs text-slate-500">
                Nomor : {SURAT_EDARAN_DATA.nomor} Tanggal {SURAT_EDARAN_DATA.tanggal}
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 mt-2">
                DAFTAR INSTANSI PENERIMA DAN SASARAN PENGUMPULAN DATA PROFIL KEBAKARAN 10 KABUPATEN/KOTA SE-PROVINSI KALIMANTAN TIMUR TAHUN 2026
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-300 divide-y divide-slate-300">
                <thead className="bg-slate-100 text-slate-900 font-bold">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                    <th className="p-2 border-r border-slate-300 text-left">Wilayah Kab / Kota</th>
                    <th className="p-2 border-r border-slate-300 text-left">Nama Instansi Perangkat Daerah</th>
                    <th className="p-2 border-r border-slate-300 text-center w-16">Tipe</th>
                    <th className="p-2 border-r border-slate-300 text-left">Kepala Dinas / Badan / Satuan</th>
                    <th className="p-2 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {REGIONS_KALTIM.map((reg, index) => (
                    <tr key={reg.id} className="hover:bg-amber-50/50 transition">
                      <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{reg.name}</td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">{reg.instansiName}</td>
                      <td className="p-2 border-r border-slate-300 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 font-bold text-[10px]">
                          Tipe {reg.tipeDefault}
                        </span>
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-800">
                        {(() => {
                          const r = storageService.getReport(reg.id, 'SEMESTER_1', 2026);
                          return (
                            <>
                              <div className="font-semibold">{r.pejabat?.nama || '(Menunggu Input Operator)'}</div>
                              <div className="text-[10px] text-slate-500 font-mono">NIP. {r.pejabat?.nip || '-'}</div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRegionId(reg.id);
                              setActiveLampiran('lampiran_2');
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded font-semibold text-[10px] border border-amber-200"
                            title="Buka Laporan Semester I (Lampiran II)"
                          >
                            Lamp. II
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRegionId(reg.id);
                              setActiveLampiran('lampiran_3');
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[10px] border border-slate-200"
                            title="Buka Laporan Semester II (Lampiran III)"
                          >
                            Lamp. III
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-right text-xs">
              <p className="font-semibold text-slate-800">{SURAT_EDARAN_DATA.pengirim.jabatan},</p>
              <p className="font-bold underline text-slate-900 mt-14">{SURAT_EDARAN_DATA.pengirim.nama}</p>
              <p className="text-slate-600 font-mono text-[11px]">NIP. {SURAT_EDARAN_DATA.pengirim.nip}</p>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* LAMPIRAN II & LAMPIRAN III VIEW: OFFICIAL REPORTS PER REGION */}
      {/* ========================================================================= */}
      {(activeLampiran === 'lampiran_2' || activeLampiran === 'lampiran_3') && (
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-14 shadow-md rounded-2xl border border-slate-200 text-slate-900 text-sm leading-relaxed print:p-0 print:border-none print:shadow-none print:m-0 print:max-w-none print:rounded-none">
          
          {/* Official Lampiran Identification */}
          <div className="text-xs space-y-0.5 mb-6 text-slate-700">
            <div className="font-bold text-slate-900 uppercase">
              {activeLampiran === 'lampiran_2' ? 'LAMPIRAN II' : 'LAMPIRAN III'}
            </div>
            <div>SURAT EDARAN NOMOR : {SURAT_EDARAN_DATA.nomor}</div>
            <div>TANGGAL : {SURAT_EDARAN_DATA.tanggal}</div>
            <div className="text-slate-500 italic">
              Hal : {SURAT_EDARAN_DATA.perihal}
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6 space-y-1">
            <h1 className="font-extrabold text-base sm:text-lg tracking-wide uppercase text-slate-950">
              LAPORAN PENANGGULANGAN KEBAKARAN DAN PENYELAMATAN
            </h1>
            <h2 className="font-extrabold text-base sm:text-lg uppercase text-slate-950">
              {region.name.toUpperCase()} TAHUN 2026
            </h2>
            <h3 className="font-bold text-sm sm:text-base uppercase text-amber-800">
              {activeLampiran === 'lampiran_2'
                ? 'PERIODE SEMESTER I (Laporan Kinerja Januari s.d Juni 2026)'
                : 'PERIODE SEMESTER II (Laporan Kinerja Januari s.d Desember 2026 - Akumulatif Tahunan)'}
            </h3>
          </div>

          {/* Section 0: Data Petugas & Pejabat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs print:bg-transparent print:border-slate-300">
            <div>
              <div className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Data Yang Mengisi:</span>
                <span className="text-[10px] text-slate-400 font-normal">Operator / Analis</span>
              </div>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-20 text-slate-500 py-0.5">• Nama</td>
                    <td className="w-3">:</td>
                    <td className="font-semibold text-slate-800">{report.pengisi.nama || 'Petugas Operator Damkar'}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 py-0.5">• NIP</td>
                    <td>:</td>
                    <td className="font-mono text-slate-800">{report.pengisi.nip || '-'}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 py-0.5">• Jabatan</td>
                    <td>:</td>
                    <td className="text-slate-800">{report.pengisi.jabatan || '-'}</td>
                  </tr>
                  {report.pengisi.noHp && (
                    <tr>
                      <td className="text-slate-500 py-0.5">• Kontak/WA</td>
                      <td>:</td>
                      <td className="text-slate-800 font-mono">{report.pengisi.noHp}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <div className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Data Kadis/Kasat/Kalak:</span>
                <span className="text-[10px] text-slate-400 font-normal">Pejabat Pengesah</span>
              </div>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-20 text-slate-500 py-0.5">• Nama</td>
                    <td className="w-3">:</td>
                    <td className="font-semibold text-slate-800">{report.pejabat.nama || '(Belum Diisi Oleh Operator)'}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 py-0.5">• NIP</td>
                    <td>:</td>
                    <td className="font-mono text-slate-800">{report.pejabat.nip || '-'}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 py-0.5">• Jabatan</td>
                    <td>:</td>
                    <td className="text-slate-800">{report.pejabat.jabatan || ('Kepala ' + region.instansiName)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section A: Kelembagaan & Pos */}
          <div className="my-5">
            <h3 className="font-bold text-slate-900 mb-2 text-xs sm:text-sm border-b border-slate-200 pb-1">
              A. Data Kapasitas Kelembagaan Penanggulangan Kebakaran dan Data Pos
            </h3>
            <div className="pl-4 space-y-1.5 text-xs text-slate-800">
              <div>
                <span className="text-slate-600">• Nama Instansi Perangkat Daerah : </span>
                <span className="font-semibold">{report.bagianA.namaInstansi || region.instansiName}</span>
              </div>
              <div>
                <span className="text-slate-600">• Bentuk Kelembagaan : </span>
                <span className="font-semibold">{report.bagianA.bentukKelembagaan}</span>
              </div>
              <div>
                <span className="text-slate-600">• Tipe Kelembagaan : </span>
                <span className="font-bold">Tipe {report.bagianA.tipeKelembagaan}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 max-w-md">
                <div>• Jumlah Mako : <strong className="font-mono text-slate-900">{report.bagianA.jumlahMako}</strong></div>
                <div>• Jumlah Pos Sektor : <strong className="font-mono text-slate-900">{report.bagianA.jumlahPosSektor}</strong></div>
                <div>• Jumlah Pos : <strong className="font-mono text-slate-900">{report.bagianA.jumlahPos}</strong></div>
              </div>
            </div>
          </div>

          {/* Section B: SDM */}
          <div className="my-5">
            <h3 className="font-bold text-slate-900 mb-2 text-xs sm:text-sm border-b border-slate-200 pb-1">
              B. Data Sumber Daya Manusia (SDM)
            </h3>
            <div className="pl-4 text-xs text-slate-800 space-y-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>• PNS Struktural : <strong>{report.bagianB.pnsStruktural}</strong></div>
                <div>• PNS Fungsional : <strong>{report.bagianB.pnsFungsional}</strong></div>
                <div>• PNS Pelaksana : <strong>{report.bagianB.pnsPelaksana}</strong></div>
                <div>• Total PNS : <strong className="text-amber-800 font-bold">{report.bagianB.totalPns}</strong></div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>• PPPK Penuh Waktu : <strong>{report.bagianB.pppk}</strong></div>
                <div>• PPPK Paruh Waktu : <strong>{report.bagianB.pppkParuhWaktu}</strong></div>
                <div>• Total PPPK : <strong className="text-amber-800 font-bold">{report.bagianB.totalPppk}</strong></div>
              </div>
              <div className="pt-1">
                • Jumlah Aparatur Damkar non-ASN (Bukan PNS atau PPPK) : <strong>{report.bagianB.nonAsn} Orang</strong>
              </div>
              <div className="pt-1">
                <span className="text-slate-600">• Sertifikasi/Sertifikat Diklat Kualifikasi Lanjutan :</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-4 pt-1">
                  <div>➢ Instruktur : <strong>{report.bagianB.sertifikasi.instruktur}</strong></div>
                  <div>➢ Inspektur : <strong>{report.bagianB.sertifikasi.inspektur}</strong></div>
                  <div>➢ MFR (First Responder) : <strong>{report.bagianB.sertifikasi.mfr}</strong></div>
                  <div>➢ Rescue Kualifikasi : <strong>{report.bagianB.sertifikasi.rescue}</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Sarpras */}
          <div className="my-5">
            <h3 className="font-bold text-slate-900 mb-2 text-xs sm:text-sm border-b border-slate-200 pb-1">
              C. Data Sarana dan Prasarana
            </h3>
            <div className="pl-4 text-xs text-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>• Mobil Damkar : <strong>{report.bagianC.mobilDamkar} Unit</strong></div>
              <div>• Mobil Tangki : <strong>{report.bagianC.mobilTangki} Unit</strong></div>
              <div>• Mobil Tangga : <strong>{report.bagianC.mobilTangga} Unit</strong></div>
              <div>• Mobil Rescue : <strong>{report.bagianC.mobilRescue} Unit</strong></div>
              <div className="col-span-2 sm:col-span-2">
                • Kendaraan Lainnya (Roda 2, 3, 4) : <strong>{report.bagianC.kendaraanLainnya} Unit</strong>
              </div>
            </div>
          </div>

          {/* Section D: Relawan */}
          <div className="my-5">
            <h3 className="font-bold text-slate-900 mb-2 text-xs sm:text-sm border-b border-slate-200 pb-1">
              D. Data Relawan Penanggulangan Kebakaran (Redkar)
            </h3>
            <div className="pl-4 text-xs text-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>• Jumlah Relawan Pemadam Kebakaran : <strong>{report.bagianD.jumlahRelawan} Orang</strong></div>
              <div>• Jumlah Desa/Kelurahan Terlayani : <strong>{report.bagianD.jumlahDesaKelurahan} Desa/Kel.</strong></div>
            </div>
          </div>

          {/* Section E: Laporan Kebakaran */}
          <div className="my-5">
            <h3 className="font-bold text-slate-900 mb-2 text-xs sm:text-sm border-b border-slate-200 pb-1">
              E. Data Laporan Kebakaran & Waktu Tanggap (Response Time 15 Menit)
            </h3>
            <div className="pl-4 text-xs text-slate-800 space-y-1">
              <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200/80">
                • Jumlah Penanganan Kebakaran yang memenuhi <strong>Response Time 15 Menit</strong> (SPM Kaltim) : 
                <strong className="text-amber-950 ml-1 text-sm font-black">{report.bagianE.response15Menit} Kejadian</strong>
                <span className="text-slate-600 ml-2">
                  ({report.bagianE.totalKejadian > 0 ? Math.round((report.bagianE.response15Menit / report.bagianE.totalKejadian) * 100) : 100}% Kepatuhan dari {report.bagianE.totalKejadian} total kejadian)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1.5">
                <div>• Tabung Gas / Kompor : <strong>{report.bagianE.sebabGasKompor}</strong></div>
                <div>• Arus Pendek Listrik : <strong>{report.bagianE.sebabListrik}</strong></div>
                <div>• Bahan Bakar / Gas : <strong>{report.bagianE.sebabBahanBakar}</strong></div>
                <div>• Kelalaian Manusia : <strong>{report.bagianE.sebabKelalaian}</strong></div>
                <div>• Kebakaran Lainnya : <strong>{report.bagianE.sebabLainnya}</strong></div>
                <div>• Total Kejadian : <strong className="text-slate-900 font-bold">{report.bagianE.totalKejadian} Kejadian</strong></div>
              </div>
            </div>
          </div>

          {/* Section F: Penyelamatan */}
          <div className="my-5">
            <h3 className="font-bold text-slate-900 mb-2 text-xs sm:text-sm border-b border-slate-200 pb-1">
              F. Data Penanggulangan Operasi Penyelamatan Non-Kebakaran (Total: {report.bagianF.totalOperasi} Operasi)
            </h3>
            <div className="pl-4 text-xs text-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>• Kecelakaan Transportasi : <strong>{report.bagianF.kecelakaanTransportasi}</strong></div>
              <div>• Water Rescue (Air/Sungai) : <strong>{report.bagianF.waterRescue}</strong></div>
              <div>• Animal Rescue (Satwa Liar) : <strong>{report.bagianF.animalRescue}</strong></div>
              <div>• Penyelamatan Ketinggian : <strong>{report.bagianF.ketinggian}</strong></div>
              <div>• Bangunan Runtuh / Longsor : <strong>{report.bagianF.bangunanRuntuh}</strong></div>
              <div>• Evakuasi Pohon Tumbang : <strong>{report.bagianF.pohonTumbang}</strong></div>
              <div>• Percobaan Bunuh Diri : <strong>{report.bagianF.percobaanBunuhDiri}</strong></div>
              <div>• Pelepasan Cincin / Cincin Tersangkut : <strong>{report.bagianF.pelepasanCincin}</strong></div>
              <div>• Operasi Penyelamatan Lainnya : <strong>{report.bagianF.operasiLainnya}</strong></div>
            </div>
          </div>

          {/* Section G: Korban & Kerugian */}
          <div className="my-5">
            <h3 className="font-bold text-slate-900 mb-2 text-xs sm:text-sm border-b border-slate-200 pb-1">
              G. Data Korban Kebakaran dan Kerugian Materi
            </h3>
            <div className="pl-4 text-xs text-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>• Korban Jiwa Selamat : <strong className="text-emerald-700">{report.bagianG.jiwaSelamat} Jiwa</strong></div>
              <div>• Meninggal Dunia : <strong className="text-rose-700">{report.bagianG.korbanMeninggal} Orang</strong></div>
              <div>• Korban Luka Bakar : <strong>{report.bagianG.korbanLukaBakar} Orang</strong></div>
              <div>• Luka Fisik Lainnya : <strong>{report.bagianG.korbanLukaFisikLainnya} Orang</strong></div>
            </div>
            <div className="pl-4 text-xs text-slate-800 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>• Taksiran Aset Berhasil Diselamatkan : <strong className="text-emerald-700 font-mono">{formatRupiah(report.bagianG.taksiranAsetSelamat)}</strong></div>
              <div>• Taksiran Kerugian Aset : <strong className="text-rose-700 font-mono">{formatRupiah(report.bagianG.taksiranKerugian)}</strong></div>
            </div>
          </div>

          {/* Section H: Inspeksi Bangunan */}
          <div className="my-5">
            <h3 className="font-bold text-slate-900 mb-2 text-xs sm:text-sm border-b border-slate-200 pb-1">
              H. Data Inspeksi Bangunan atau Gedung Terhadap Proteksi Kebakaran
            </h3>
            <div className="pl-4 text-xs text-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border-l-2 border-slate-300 pl-2">
                <div className="font-semibold">Bangunan Rendah (1-4 Lantai)</div>
                <div>• Total Bangunan : <strong>{report.bagianH.bangunanRendah}</strong></div>
                <div>• Telah Diinspeksi : <strong className="text-emerald-700">{report.bagianH.bangunanRendahDiinspeksi}</strong></div>
              </div>
              <div className="border-l-2 border-slate-300 pl-2">
                <div className="font-semibold">Bangunan Menengah (5-8 Lantai)</div>
                <div>• Total Bangunan : <strong>{report.bagianH.bangunanMenengah}</strong></div>
                <div>• Telah Diinspeksi : <strong className="text-emerald-700">{report.bagianH.bangunanMenengahDiinspeksi}</strong></div>
              </div>
              <div className="border-l-2 border-slate-300 pl-2">
                <div className="font-semibold">Bangunan Tinggi (&gt;8 Lantai)</div>
                <div>• Total Bangunan : <strong>{report.bagianH.bangunanTinggi}</strong></div>
                <div>• Telah Diinspeksi : <strong className="text-emerald-700">{report.bagianH.bangunanTinggiDiinspeksi}</strong></div>
              </div>
            </div>
          </div>

          {/* Signature Area */}
          <div className="mt-14 pt-6 border-t border-slate-200 grid grid-cols-2 text-xs text-center">
            
            {/* Kiri: Mengetahui Kadis/Kasat/Kalak */}
            <div className="space-y-1">
              <p className="font-semibold text-slate-700">Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala {region.instansiName}</p>
              
              {/* Stamp & Signature Space */}
              <div className="h-24 flex items-center justify-center relative">
                <div className="border border-emerald-400/70 bg-emerald-50/70 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <QrCode className="w-10 h-10 text-emerald-800" />
                  <div className="text-left text-[10px] text-emerald-900 leading-tight">
                    <div className="font-bold">TTE DISAHKAN</div>
                    <div>Sertifikat BSrE BSSN</div>
                    <div className="font-mono text-[9px] text-emerald-700">{report.id}</div>
                  </div>
                </div>
              </div>

              <p className="font-bold underline text-slate-900 mt-2">
                {report.pejabat.nama || '(Belum Diisi Oleh Operator)'}
              </p>
              <p className="text-slate-600 font-mono text-[11px]">
                NIP. {report.pejabat.nip || '-'}
              </p>
            </div>

            {/* Kanan: Yang Membuat */}
            <div className="space-y-1">
              <p className="font-semibold text-slate-700">Yang Membuat,</p>
              <p className="font-medium text-slate-600">{report.pengisi.jabatan || 'Petugas Operator Pelapor'}</p>
              
              {/* Signature Space */}
              <div className="h-24 flex items-center justify-center">
                <div className="text-[11px] text-slate-500 italic bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  (Telah Diverifikasi & Ditandatangani secara Digital)
                </div>
              </div>

              <p className="font-bold underline text-slate-900 mt-2">
                {report.pengisi.nama || '(Belum Diisi)'}
              </p>
              <p className="text-slate-600 font-mono text-[11px]">
                NIP. {report.pengisi.nip || '-'}
              </p>
            </div>

          </div>

          {/* BSrE BSSN Legal Verification Footer */}
          <div className="mt-12 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 space-y-1">
            <p className="italic">
              Dokumen ini disahkan secara elektronik menggunakan Sertifikat Elektronik Balai Besar Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara (BSSN) sesuai format resmi Surat Edaran Sekda Prov. Kaltim No. {SURAT_EDARAN_DATA.nomor}.
            </p>
            <p className="text-[9px] text-slate-400">
              SIMPROKAS - Sistem Informasi Manajemen Profil Kebakaran dan Penyelamatan Provinsi Kalimantan Timur
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

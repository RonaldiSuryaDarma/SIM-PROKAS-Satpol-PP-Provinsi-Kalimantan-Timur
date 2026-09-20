import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  RotateCcw, 
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  BookOpen,
  Code2,
  Server
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface BimtekGuideProps {
  onStartSimulation: () => void;
}

export const BimtekGuide: React.FC<BimtekGuideProps> = ({ onStartSimulation }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke skenario awal Bimtek 2026?')) {
      storageService.resetToBimtekDemo();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const bimtekSteps = [
    {
      step: '01',
      title: 'Pemilihan Hak Akses & Daerah Operasional',
      desc: 'Peserta Bimtek memilih peran "Operator Kab/Kota" pada menu atas, lalu memilih instansi wilayah yang diwakilinya (misal: Disdamkar Samarinda, BPBD Balikpapan, atau Satpol PP Kubar).'
    },
    {
      step: '02',
      title: 'Pengisian Identitas Pengisi & Pejabat Definitif',
      desc: 'Lengkapi Nama, NIP, Jabatan operator teknis dan Kepala Dinas/Badan/Kasat lengkap dengan gelar akademik/kebangsawanan untuk keperluan legalitas pengesahan dokumen.'
    },
    {
      step: '03',
      title: 'Pengisian Data Bagian A s/d H',
      desc: 'Masukkan data kelembagaan, SDM (PNS/PPPK/Non-ASN), Sarpras armada, Relawan Redkar, laporan kebakaran, operasi rescue, korban & kerugian materi, serta inspeksi proteksi gedung.'
    },
    {
      step: '04',
      title: 'Perhitungan Otomatis Standar SPM 15 Menit',
      desc: 'Sistem SIMPROKAS secara real-time menghitung persentase kepatuhan response time 15 menit dan menjumlahkan total insiden tanpa perlu kalkulasi manual.'
    },
    {
      step: '05',
      title: 'Validasi & Pengajuan Verifikasi Laporan',
      desc: 'Periksa indikator kelengkapan (harus mencapai 100%). Klik "Ajukan Laporan" untuk mengirimkan data ke verifikator provinsi.'
    },
    {
      step: '06',
      title: 'Pencetakan Berita Acara & Dokumen Ber-QR Code',
      desc: 'Setelah diverifikasi oleh provinsi, cetak dokumen PDF resmi yang sesuai dengan Lampiran II/III Surat Edaran lengkap dengan pengesahan tanda tangan elektronik BSrE BSSN.'
    }
  ];

  const faqs = [
    {
      q: 'Apa perbedaan pelaporan Semester I dan Semester II?',
      a: 'Berdasarkan Surat Edaran Sekda Kaltim No. 300.1/3326/SATPOL.PP-IV, Semester I mencakup data kinerja Januari s.d Juni (batas 13 Juli 2026). Sedangkan Semester II merupakan hitungan akumulasi satu tahun penuh (Januari s.d Desember, batas 11 Januari 2027).'
    },
    {
      q: 'Bagaimana bila instansi di wilayah kami berupa Satpol PP atau BPBD, bukan Dinas Damkar?',
      a: 'Pada Bagian A, pilih Bentuk Kelembagaan yang sesuai (Satuan Polisi Pamong Praja atau Badan Penanggulangan Bencana Daerah) dengan Tipe A, B, atau C. Format instrumen tetap mengacu pada tugas sub urusan kebakaran yang dijalankan.'
    },
    {
      q: 'Apakah taksiran aset selamat dan kerugian harus melampirkan BAP?',
      a: 'Taksiran aset dan kerugian dihitung berdasarkan estimasi luas bangunan terdampak dan objek terselamatkan. Untuk verifikasi provinsi, data dapat diselaraskan dengan BAP investigasi kepolisian setempat.'
    },
    {
      q: 'Apakah sistem bisa bekerja jika jaringan internet lambat saat Bimtek?',
      a: 'Ya! SIMPROKAS menggunakan arsitektur High-Speed Local & Realtime Sync Engine dengan 0ms latency. Data Anda tersimpan secara instan di perangkat dan otomatis tersinkronisasi saat koneksi stabil.'
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 rounded-2xl p-6 text-white border border-slate-700 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Modul Bimbingan Teknis (BIMTEK) Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Panduan Operasional & Simulasi Pengisian Data SIMPROKAS
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Panduan bagi aparatur dan operator Dinas Pemadam Kebakaran, Satpol PP, dan BPBD Kabupaten/Kota se-Kalimantan Timur 
              untuk pemutakhiran data profil dan kesiapsiagaan kebakaran sesuai format Surat Edaran No. 300.1/3326/SATPOL.PP-IV.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onStartSimulation}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition"
            >
              <span>Pengisian</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {resetSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 font-semibold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            Data simulasi berhasil dikembalikan ke kondisi standar Bimtek 2026.
          </div>
        )}
      </div>

      {/* 6-Langkah Alur Kerja Penginputan Bimtek */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>Alur Kerja Penginputan & Verifikasi (Standar Bimtek Prov. Kaltim)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikuti 6 tahapan terpadu berikut saat sesi bimbingan teknis bersama narasumber provinsi:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bimtekSteps.map((s, idx) => (
            <div 
              key={s.step}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 hover:border-amber-400 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-md font-mono">
                    LANGKAH {s.step}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">Tahap {idx + 1}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1.5">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Inisiasi Mandiri & Kesiapan Bimtek */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Inisiasi & Arsitektur Mandiri */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-500" />
              <span>Inisiasi & Arsitektur Mandiri SIMPROKAS</span>
            </h2>
            <p className="text-xs text-slate-500">Dibangun sebagai solusi digitalisasi terpadu profil kebakaran 10 Kab/Kota</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Optimalisasi Performa & Sinkronisasi Cepat</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Database dan arsitektur penyimpanan telah dirombak dengan engine sinkronisasi lokal dan cloud yang responsif, memastikan penginputan data tetap lancar tanpa latensi saat sesi Bimtek.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-sky-600" />
                <span>Kesiapan Migrasi Domain & Hosting Diskominfo</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Struktur kode bersih, terdokumentasi penuh, dan dirancang sesuai arsitektur SPBE Pemerintah Provinsi Kalimantan Timur untuk proses permohonan domain dan hosting resmi awal tahun.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Praktis Pengisian Data */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Tanya Jawab Teknis Pengisian (FAQ)</span>
            </h2>
            <p className="text-xs text-slate-500">Pertanyaan umum peserta bimbingan teknis</p>
          </div>

          <div className="space-y-2 text-xs">
            {faqs.map((f, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="rounded-xl border border-slate-200 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 font-bold text-slate-800 flex justify-between items-center"
                  >
                    <span>{f.q}</span>
                    <span className="text-slate-400 font-mono text-base">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="p-3.5 bg-white text-slate-600 leading-relaxed border-t border-slate-200">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

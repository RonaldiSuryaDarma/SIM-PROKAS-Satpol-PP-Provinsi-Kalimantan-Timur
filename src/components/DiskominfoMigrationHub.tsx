import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Download, 
  FileCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Network, 
  HardDrive, 
  FileText, 
  Printer,
  Upload,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { PROVINSI_INFO } from '../data/regions';

export const DiskominfoMigrationHub: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedSurat, setCopiedSurat] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState<'postgres' | 'mysql'>('postgres');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sqlDump = storageService.generateSQLDump(selectedDialect);

  const handleDownloadSQL = () => {
    const blob = new Blob([sqlDump], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `simprokas_kaltim_${selectedDialect}_migration.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const jsonStr = storageService.exportJSONBackup();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `simprokas_kaltim_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const suratPermohonanText = `PEMERINTAH PROVINSI KALIMANTAN TIMUR
SATUAN POLISI PAMONG PRAJA
Jalan Gajah Mada Nomor 2, Samarinda, Kalimantan Timur 75121
Telepon (0541) 733333; Pos-el: satpolpp@kaltimprov.go.id

Nomor       : 300.1/     /SATPOL.PP-IV/2026
Sifat       : Penting
Lampiran    : 1 (satu) Berkas Proposal Teknis
Hal         : Permohonan Penyediaan Subdomain dan Fasilitasi Server Hosting SIMPROKAS Prov. Kaltim

Yth. Kepala Dinas Komunikasi dan Informatika Provinsi Kalimantan Timur
di Samarinda.

Dalam rangka pelaksanaan Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah terkait Pemetaan Rawan Kebakaran serta tindak lanjut Surat Edaran Sekretaris Daerah Provinsi Kalimantan Timur Nomor 300.1/3326/SATPOL.PP-IV, Satuan Polisi Pamong Praja Provinsi Kalimantan Timur (Bidang Kebakaran) telah mengembangkan aplikasi sistem pelaporan terpadu profil dan kesiapsiagaan kebakaran 10 Kabupaten/Kota bernama SIMPROKAS (Sistem Informasi Manajemen Profil Kebakaran dan Penyelamatan).

Sehubungan dengan hal tersebut dan menyongsong integrasi layanan Sistem Pemerintahan Berbasis Elektronik (SPBE) Pemerintah Provinsi Kalimantan Timur, kami mengajukan permohonan penyediaan infrastruktur sebagai berikut:

1. Penyediaan Nama Subdomain Resmi:
   - Nama Subdomain yang diusulkan : simprokas.kaltimprov.go.id
   - Peruntukan : Portal Resmi Pelaporan Profil Damkar se-Kaltim

2. Fasilitasi Alokasi Server Hosting / Virtual Data Center (VDC) Pemprov Kaltim:
   - Arsitektur Aplikasi : Node.js / React / TypeScript Engine
   - Sistem Manajemen Basis Data : PostgreSQL / MySQL (Relational Schema)
   - Rekomendasi Spesifikasi Minimum : 2 vCPU, 4 GB RAM, 40 GB SSD Storage
   - Kebutuhan Protokol : HTTPS / SSL TLS Certificate (Let's Encrypt / DigiCert Diskominfo)

Demikian permohonan ini kami sampaikan. Atas perhatian, dukungan, dan kerja samanya diucapkan terima kasih.

Kepala Satuan Polisi Pamong Praja
Provinsi Kalimantan Timur,




(...............................................)
NIP.`;

  const handleCopySurat = () => {
    navigator.clipboard.writeText(suratPermohonanText);
    setCopiedSurat(true);
    setTimeout(() => setCopiedSurat(false), 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importJSONBackup(content);
      if (res.success) {
        setImportMessage({ type: 'success', text: res.message });
      } else {
        setImportMessage({ type: 'error', text: res.message });
      }
      setTimeout(() => setImportMessage(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950/40 rounded-2xl p-6 text-white border border-slate-700 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Server className="w-3.5 h-3.5" />
            <span>Kesiapan SPBE & Infrastruktur Diskominfo Prov. Kaltim</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pusat Migrasi, Domain & Hosting Diskominfo Kaltim
          </h1>
          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
            Modul khusus untuk memudahkan proses pengajuan domain resmi <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">simprokas.kaltimprov.go.id</code>, 
            persiapan hosting di Data Center Pemprov Kaltim, serta ekspor skrip database (SQL/PostgreSQL/MySQL) siap deploy.
          </p>
        </div>
      </div>

      {/* Grid: 2 Kolom (Surat Permohonan & Arsitektur SPBE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom 1: Draf Surat Permohonan Domain & Hosting */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Draf Surat Resmi Permohonan ke Diskominfo Kaltim</span>
                </h2>
                <p className="text-xs text-slate-500">Siap dicetak atau disalin untuk diajukan ke Kadiskominfo Kaltim</p>
              </div>
              <button
                type="button"
                onClick={handleCopySurat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {copiedSurat ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
              {suratPermohonanText}
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Standar Administrasi Persuratan Pemprov Kaltim</span>
            <button
              type="button"
              onClick={() => window.print()}
              className="text-amber-600 font-bold hover:underline flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Surat</span>
            </button>
          </div>
        </div>

        {/* Kolom 2: Arsitektur Server & Checklist Kesiapan SPBE */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-600" />
              <span>Spesifikasi Teknis Hosting & Standar Keamanan SPBE</span>
            </h2>
            <p className="text-xs text-slate-500">Rekomendasi konfigurasi server untuk Tim Jaringan & IT Diskominfo</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-500" />
                <span>Kebutuhan Server / Virtual Machine (Diskominfo Data Center)</span>
              </div>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li><strong>OS:</strong> Ubuntu Server 22.04 LTS / 24.04 LTS atau Rocky Linux</li>
                <li><strong>Processor:</strong> 2 Core vCPU (Cukup untuk beban operasional 10 Kab/Kota)</li>
                <li><strong>RAM Memory:</strong> 4 GB RAM (High Performance)</li>
                <li><strong>Storage:</strong> 40 GB NVMe / SSD Storage (Disertai auto-backup snapshot harian)</li>
                <li><strong>Web Server / Reverse Proxy:</strong> Nginx dengan SSL TLS 1.3 Terminated</li>
              </ul>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Checklist Keamanan & Kepatuhan SPBE</span>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Role-Based Access Control (RBAC) terpisah tiap Kab/Kota</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Audit Trail Logging: pencatatan setiap input data & validasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Enkripsi HTTPS & Port 3000 Ingress Restriction</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sertifikat TTE Elektronik BSSN / BSrE Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SQL & Database Migration Engine */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Generator Skrip Migrasi Basis Data (SQL Exporter)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Skrip DDL (Tabel) dan DML (Data Seeding 10 Kab/Kota) siap dieksekusi di database server Diskominfo
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedDialect('postgres')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedDialect === 'postgres'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PostgreSQL
              </button>
              <button
                type="button"
                onClick={() => setSelectedDialect('mysql')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedDialect === 'mysql'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                MySQL / MariaDB
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopySQL}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin SQL</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadSQL}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .SQL</span>
            </button>
          </div>
        </div>

        {/* Code Preview Box */}
        <div className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-emerald-400 max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
          <pre>{sqlDump.substring(0, 1800)}...</pre>
          <div className="text-slate-500 mt-2 text-[10px] italic">
            -- Menampilkan preview awal skrip migrasi SQL (Unduh file lengkap melalui tombol di atas) --
          </div>
        </div>

        {/* Secondary: JSON Backup & Restore for Emergency / Offline Bimtek */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800">Cadangan Penuh JSON (Full Snapshot Backup)</span>
            <p className="text-slate-500 text-[11px]">
              Dapat digunakan untuk memindahkan seluruh data antar-laptop panitia Bimtek secara instan tanpa internet.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Backup JSON</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Pulihkan JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importMessage && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            importMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span>{importMessage.text}</span>
          </div>
        )}

      </div>

    </div>
  );
};

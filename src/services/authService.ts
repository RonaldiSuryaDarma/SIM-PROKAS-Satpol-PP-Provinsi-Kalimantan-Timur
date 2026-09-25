import { UserRole, UserSession } from '../types';
import { REGIONS_KALTIM } from '../data/regions';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface OfficialAccount {
  username: string;
  aliases: string[];
  password: string;
  session: UserSession;
  description: string;
}

export const OFFICIAL_ACCOUNTS: OfficialAccount[] = [
  // 1. Satpol PP Provinsi Kalimantan Timur (Inisiator Sistem)
  {
    username: 'admin',
    aliases: ['admin', 'satpolpp.kaltim', 'inisiator', 'admin.provinsi'],
    password: 'SIMPROKAS@2026',
    session: {
      role: 'admin_provinsi',
      userName: 'Satpol PP Provinsi Kalimantan Timur',
      nip: '19841116 200902 1 001',
      jabatan: 'Inisiator SIM-PROKAS / Admin Prov. Kaltim',
      instansi: 'Bidang Kebakaran Satpol PP Provinsi Kalimantan Timur',
      regionId: 'kaltim'
    },
    description: 'Akses penuh Inisiator & Satpol PP Provinsi: Agregat 10 Kab/Kota, Verifikasi & Pengesahan SE Sekda'
  },

  // 2. 10 Kabupaten / Kota - Masing-masing memiliki Akun & Kata Sandi Berbeda
  {
    username: 'damkar_samarinda',
    aliases: ['damkar_samarinda', 'samarinda', 'operator_samarinda'],
    password: 'Samarinda@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'samarinda',
      userName: 'Damkar Kota Samarinda',
      nip: '19880512 201201 1 002',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kota Samarinda'
    },
    description: 'Entri Laporan SE Sekda wilayah Kota Samarinda'
  },
  {
    username: 'damkar_balikpapan',
    aliases: ['damkar_balikpapan', 'balikpapan', 'operator_balikpapan'],
    password: 'Balikpapan@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'balikpapan',
      userName: 'Damkar Kota Balikpapan',
      nip: '19890723 201302 1 003',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kota Balikpapan'
    },
    description: 'Entri Laporan SE Sekda wilayah Kota Balikpapan'
  },
  {
    username: 'damkar_kukar',
    aliases: ['damkar_kukar', 'kukar', 'operator_kukar'],
    password: 'Kukar@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'kukar',
      userName: 'Damkar Kab. Kutai Kartanegara',
      nip: '19900315 201403 1 004',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kab. Kutai Kartanegara'
    },
    description: 'Entri Laporan SE Sekda wilayah Kab. Kutai Kartanegara'
  },
  {
    username: 'damkar_kutim',
    aliases: ['damkar_kutim', 'kutim', 'operator_kutim'],
    password: 'Kutim@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'kutim',
      userName: 'Damkar Kab. Kutai Timur',
      nip: '19871104 201101 1 005',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kab. Kutai Timur'
    },
    description: 'Entri Laporan SE Sekda wilayah Kab. Kutai Timur'
  },
  {
    username: 'damkar_paser',
    aliases: ['damkar_paser', 'paser', 'operator_paser'],
    password: 'Paser@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'paser',
      userName: 'Damkar Kab. Paser',
      nip: '19910218 201502 1 006',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kab. Paser'
    },
    description: 'Entri Laporan SE Sekda wilayah Kab. Paser'
  },
  {
    username: 'damkar_berau',
    aliases: ['damkar_berau', 'berau', 'operator_berau'],
    password: 'Berau@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'berau',
      userName: 'Damkar Kab. Berau',
      nip: '19860909 201001 1 007',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kab. Berau'
    },
    description: 'Entri Laporan SE Sekda wilayah Kab. Berau'
  },
  {
    username: 'damkar_bontang',
    aliases: ['damkar_bontang', 'bontang', 'operator_bontang'],
    password: 'Bontang@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'bontang',
      userName: 'Damkar Kota Bontang',
      nip: '19920412 201603 1 008',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kota Bontang'
    },
    description: 'Entri Laporan SE Sekda wilayah Kota Bontang'
  },
  {
    username: 'damkar_kubar',
    aliases: ['damkar_kubar', 'kubar', 'operator_kubar'],
    password: 'Kubar@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'kubar',
      userName: 'Damkar Kab. Kutai Barat',
      nip: '19881225 201301 1 009',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kab. Kutai Barat'
    },
    description: 'Entri Laporan SE Sekda wilayah Kab. Kutai Barat'
  },
  {
    username: 'damkar_ppu',
    aliases: ['damkar_ppu', 'ppu', 'operator_ppu', 'penajam'],
    password: 'PPU@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'ppu',
      userName: 'Damkar Kab. Penajam Paser Utara',
      nip: '19930614 201704 1 010',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kab. Penajam Paser Utara'
    },
    description: 'Entri Laporan SE Sekda wilayah Kab. Penajam Paser Utara'
  },
  {
    username: 'damkar_mahulu',
    aliases: ['damkar_mahulu', 'mahulu', 'operator_mahulu', 'mahakam_ulu'],
    password: 'Mahulu@2026',
    session: {
      role: 'operator_kabkota',
      regionId: 'mahulu',
      userName: 'Damkar Kab. Mahakam Ulu',
      nip: '19940830 201802 1 011',
      jabatan: 'Pengelola Data SIM-PROKAS',
      instansi: 'Kab. Mahakam Ulu'
    },
    description: 'Entri Laporan SE Sekda wilayah Kab. Mahakam Ulu'
  }
];

const SESSION_STORAGE_KEY = 'simprokas_session_auth_v1';
const CUSTOM_PASSWORDS_KEY = 'simprokas_custom_passwords_v2';

class AuthService {
  private currentSession: UserSession | null = null;
  private customPasswords: Record<string, string> = {};
  private listeners: Set<(session: UserSession | null) => void> = new Set();

  constructor() {
    // Load custom passwords if set by Admin
    try {
      const savedPass = localStorage.getItem(CUSTOM_PASSWORDS_KEY);
      if (savedPass) {
        this.customPasswords = JSON.parse(savedPass);
      }
    } catch (e) {}

    // Session expires when browser tab closes (sessionStorage)
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure removed provincial users (Arih Frananta / Akmal Malik) or legacy roles are cleared
        if (
          parsed.userName?.toLowerCase().includes('arih') || 
          parsed.userName?.toLowerCase().includes('akmal') ||
          parsed.role === 'eksekutif'
        ) {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          this.currentSession = null;
        } else {
          this.currentSession = parsed;
        }
      } catch {
        this.currentSession = null;
      }
    } else {
      this.currentSession = null;
    }
  }

  public getAccounts(): (OfficialAccount & { isCustomPassword?: boolean })[] {
    return OFFICIAL_ACCOUNTS.map(acc => {
      const custom = this.customPasswords[acc.username.toLowerCase()];
      return {
        ...acc,
        password: custom || acc.password,
        isCustomPassword: Boolean(custom)
      };
    });
  }

  public updatePassword(username: string, newPass: string): { success: boolean; message: string } {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = newPass.trim();
    if (!cleanPass) {
      return { success: false, message: 'Kata sandi tidak boleh kosong.' };
    }
    const acc = OFFICIAL_ACCOUNTS.find(a => a.username.toLowerCase() === cleanUser);
    if (!acc) {
      return { success: false, message: 'Akun operator tidak ditemukan.' };
    }
    this.customPasswords[cleanUser] = cleanPass;
    try {
      localStorage.setItem(CUSTOM_PASSWORDS_KEY, JSON.stringify(this.customPasswords));
    } catch (e) {}
    this.notify();
    return { success: true, message: `Kata sandi akun "${acc.session.userName}" berhasil diperbarui!` };
  }

  public resetPasswordToDefault(username: string): { success: boolean; message: string } {
    const cleanUser = username.trim().toLowerCase();
    const acc = OFFICIAL_ACCOUNTS.find(a => a.username.toLowerCase() === cleanUser);
    if (!acc) {
      return { success: false, message: 'Akun operator tidak ditemukan.' };
    }
    delete this.customPasswords[cleanUser];
    try {
      localStorage.setItem(CUSTOM_PASSWORDS_KEY, JSON.stringify(this.customPasswords));
    } catch (e) {}
    this.notify();
    return { success: true, message: `Kata sandi akun "${acc.session.userName}" berhasil direset ke standar.` };
  }

  public getSession(): UserSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  public isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  public subscribe(fn: (session: UserSession | null) => void): () => void {
    this.listeners.add(fn);
    fn(this.currentSession);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentSession));
  }

  private persistSession() {
    if (this.currentSession) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  /**
   * Login with username and password
   */
  public async login(usernameInput: string, passwordInput: string): Promise<{ success: boolean; message: string }> {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Harap masukkan nama pengguna dan kata sandi.' };
    }

    // Match against official accounts
    const matched = OFFICIAL_ACCOUNTS.find(acc => 
      acc.username.toLowerCase() === cleanUser || 
      acc.aliases.some(alias => alias.toLowerCase() === cleanUser)
    );

    if (!matched) {
      return { 
        success: false, 
        message: 'Nama pengguna tidak terdaftar. Periksa kembali nama pengguna Anda.' 
      };
    }

    const effectivePassword = this.customPasswords[matched.username.toLowerCase()] || matched.password;
    if (effectivePassword !== cleanPass) {
      return { 
        success: false, 
        message: 'Kata sandi tidak sesuai. Silakan masukkan kata sandi yang benar.' 
      };
    }

    // Set authenticated session
    this.currentSession = { ...matched.session };
    this.persistSession();
    this.notify();

    // Log to Firestore in background
    try {
      const uid = `user_${matched.session.role}_${matched.session.regionId || 'prov'}`;
      setDoc(doc(db, 'users', uid), {
        uid,
        username: matched.username,
        displayName: matched.session.userName,
        role: matched.session.role,
        regionId: matched.session.regionId || 'kaltim',
        instansi: matched.session.instansi,
        lastLoginAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    } catch {
      // Non-blocking
    }

    return { 
      success: true, 
      message: `Berhasil masuk sebagai ${matched.session.userName}` 
    };
  }

  /**
   * Fast switch for Bimtek / Training demonstration
   */
  public async switchAccount(account: OfficialAccount): Promise<void> {
    this.currentSession = { ...account.session };
    this.persistSession();
    this.notify();
  }

  /**
   * Log out and destroy session
   */
  public logout(): void {
    this.currentSession = null;
    this.persistSession();
    this.notify();
  }
}

export const authService = new AuthService();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, ReportPeriod, SyncState, UserSession } from './types';
import { REGIONS_KALTIM } from './data/regions';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { db } from './lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { 
  GasIncident, 
  GasVehicle, 
  GasPersonel, 
  INITIAL_GAS_INCIDENTS, 
  INITIAL_GAS_VEHICLES, 
  INITIAL_GAS_PERSONNEL 
} from './data/gasAppData';

// Components matching user GAS app design
import { Sidebar, GasTabType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PersonelView } from './components/PersonelView';
import { KejadianView } from './components/KejadianView';
import { KendaraanView } from './components/KendaraanView';
import { EksekutifView } from './components/EksekutifView';
import { LaporanView } from './components/LaporanView';
import { ReportForm } from './components/ReportForm';
import { BimtekDiskominfoView } from './components/BimtekDiskominfoView';
import { AccountManagementView } from './components/AccountManagementView';
import { ToastContainer, ToastItem } from './components/ToastContainer';
import { LoginView } from './components/LoginView';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<GasTabType>('dashboard');
  const [userSession, setUserSession] = useState<UserSession | null>(() => authService.getSession());
  const [userRole, setUserRole] = useState<UserRole>(() => authService.getSession()?.role || 'admin_provinsi');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(() => {
    const sess = authService.getSession();
    if (sess?.role === 'admin_provinsi') {
      return 'samarinda';
    }
    return sess?.regionId || 'samarinda';
  });
  const [period, setPeriod] = useState<ReportPeriod>('SEMESTER_1');
  const [syncState, setSyncState] = useState<SyncState>(storageService.getSyncState());
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);

  // App databases initialized from localStorage or defaults
  const [incidents, setIncidents] = useState<GasIncident[]>(() => {
    const saved = localStorage.getItem('simprokas_gas_incidents_clean_v1');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { }
    }
    return INITIAL_GAS_INCIDENTS;
  });

  const [vehicles, setVehicles] = useState<GasVehicle[]>(() => {
    const saved = localStorage.getItem('simprokas_gas_vehicles_clean_v1');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { }
    }
    return INITIAL_GAS_VEHICLES;
  });

  const [personnel, setPersonnel] = useState<GasPersonel[]>(() => {
    const saved = localStorage.getItem('simprokas_gas_personnel_clean_v1');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { }
    }
    return INITIAL_GAS_PERSONNEL;
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Ensure operator_kabkota never lands on or accesses 'laporan' tab
  useEffect(() => {
    if (userRole !== 'admin_provinsi' && currentTab === 'laporan') {
      setCurrentTab('form_kabkota');
    }
  }, [userRole, currentTab]);

  // Clear legacy cache on mount
  useEffect(() => {
    try {
      localStorage.removeItem('simprokas_gas_incidents');
      localStorage.removeItem('simprokas_gas_vehicles');
      localStorage.removeItem('simprokas_gas_personnel');
      localStorage.removeItem('simprokas_kaltim_reports_v2');
      localStorage.removeItem('simprokas_kaltim_reports');
    } catch (e) {}
  }, []);

  // Subscribe to auth service session updates
  useEffect(() => {
    const unsubAuth = authService.subscribe((sess) => {
      setUserSession(sess);
      if (sess) {
        setUserRole(sess.role);
        if (sess.regionId && sess.role === 'operator_kabkota') {
          setSelectedRegionId(sess.regionId);
        }
      }
    });

    return () => {
      unsubAuth();
    };
  }, []);

  // Listen to Firestore real-time incidents collection
  useEffect(() => {
    try {
      const unsubFirestore = onSnapshot(collection(db, 'incidents'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteIncidents: GasIncident[] = [];
          snapshot.forEach((snap) => {
            remoteIncidents.push(snap.data() as GasIncident);
          });
          if (remoteIncidents.length > 0) {
            setIncidents(remoteIncidents);
          }
        }
      }, (err) => {
        console.warn('Firestore incidents live listener notice:', err);
      });

      return () => unsubFirestore();
    } catch (err) {
      console.warn('Firestore subscription notice:', err);
    }
  }, []);

  // Listen to Firestore real-time vehicles collection
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
        if (!snapshot.empty) {
          const list: GasVehicle[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as GasVehicle));
          if (list.length > 0) {
            setVehicles(list);
          }
        }
      }, (err) => {
        console.warn('Firestore vehicles listener notice:', err);
      });
      return () => unsub();
    } catch (err) {
      console.warn('Vehicles subscription notice:', err);
    }
  }, []);

  // Listen to Firestore real-time personnel collection
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'personnel'), (snapshot) => {
        if (!snapshot.empty) {
          const list: GasPersonel[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as GasPersonel));
          if (list.length > 0) {
            setPersonnel(list);
          }
        }
      }, (err) => {
        console.warn('Firestore personnel listener notice:', err);
      });
      return () => unsub();
    } catch (err) {
      console.warn('Personnel subscription notice:', err);
    }
  }, []);

  // Persist local app state changes
  useEffect(() => {
    localStorage.setItem('simprokas_gas_incidents_clean_v1', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('simprokas_gas_vehicles_clean_v1', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('simprokas_gas_personnel_clean_v1', JSON.stringify(personnel));
  }, [personnel]);

  // Subscribe to storage synchronization updates
  useEffect(() => {
    const unsubSync = storageService.subscribeSync((state) => {
      setSyncState(state);
    });

    return () => {
      unsubSync();
    };
  }, []);

  // Guard admin-only tabs from operator access
  useEffect(() => {
    if (userRole !== 'admin_provinsi' && (currentTab === 'bimtek_diskominfo' || currentTab === 'manajemen_akun')) {
      setCurrentTab('dashboard');
    }
  }, [userRole, currentTab]);

  // Toast Helper
  const showToast = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync incident to Firestore helper
  const syncIncidentToFirestore = (incident: GasIncident) => {
    try {
      setDoc(doc(db, 'incidents', incident.id), incident, { merge: true }).catch(err => {
        console.warn('Firestore incident write notice:', err);
      });
    } catch (e) {
      console.warn('Firestore incident error:', e);
    }
  };

  // Sync vehicle to Firestore helper
  const syncVehicleToFirestore = (vehicle: GasVehicle) => {
    try {
      setDoc(doc(db, 'vehicles', String(vehicle.id)), vehicle, { merge: true }).catch(err => {
        console.warn('Firestore vehicle write notice:', err);
      });
    } catch (e) {
      console.warn('Firestore vehicle error:', e);
    }
  };

  // Sync personnel to Firestore helper
  const syncPersonelToFirestore = (person: GasPersonel) => {
    try {
      setDoc(doc(db, 'personnel', String(person.id)), person, { merge: true }).catch(err => {
        console.warn('Firestore personnel write notice:', err);
      });
    } catch (e) {
      console.warn('Firestore personnel error:', e);
    }
  };

  // Emergency Simulation Trigger (matching user app triggerSimulationAlert)
  const handleTriggerSimulation = () => {
    const simCoords: [number, number] = [-0.4622, 117.1536]; // Sempaja Selatan, Samarinda
    const newIncident: GasIncident = {
      id: `ID-DMK-2026-${String(incidents.length + 1).padStart(3, '0')}`,
      title: 'Kebakaran Rumah & Kios Sempaja',
      type: 'Kebakaran Rumah',
      status: 'Aktif',
      priority: 'Tinggi',
      location: 'Jl. Wahid Hasyim, Sempaja Selatan, Samarinda',
      coords: simCoords,
      reporter: 'Call Center 112 / Disdamkar',
      desc: 'Api cepat membesar pada deretan ruko semi-permanen. Armada Posko 01 & 02 telah dikerahkan ke lokasi.',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA',
      loss: 180000000,
      regionId: 'samarinda',
      responseTimeMinutes: 6
    };

    setIncidents(prev => [newIncident, ...prev]);
    syncIncidentToFirestore(newIncident);
    setFlyToCoords(simCoords);
    setCurrentTab('dashboard');

    showToast(
      'KEBAKARAN BARU TERDETEKSI!',
      'Laporan darurat masuk dari Sempaja Selatan, Samarinda. Regu siaga posko diterjunkan dengan response time 6 menit.',
      'danger'
    );
  };

  // Add Incident handler
  const handleAddIncident = (newInc: GasIncident) => {
    setIncidents(prev => [newInc, ...prev]);
    syncIncidentToFirestore(newInc);
    setFlyToCoords(newInc.coords);
    showToast('LAPORAN DITERIMA', `Insiden "${newInc.title}" berhasil dicatat dan dipetakan ke Cloud.`, 'success');
  };

  // Complete Incident handler
  const handleCompleteIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        const updated = { ...inc, status: 'Selesai' as const };
        syncIncidentToFirestore(updated);
        return updated;
      }
      return inc;
    }));
    showToast('STATUS DIPERBARUI', 'Insiden kebakaran telah ditandai Selesai / Terkendali.', 'success');
  };

  // Delete Incident handler
  const handleDeleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(inc => inc.id !== id));
    try {
      deleteDoc(doc(db, 'incidents', id)).catch(err => {
        console.warn('Firestore incident delete notice:', err);
      });
    } catch (e) { }
    showToast('LAPORAN DIHAPUS', 'Data laporan insiden berhasil dihapus dari sistem.', 'info');
  };

  // Vehicle fuel refill
  const handleRefillFuel = (id: number) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        const updated = { ...v, bensin: 100 };
        syncVehicleToFirestore(updated);
        return updated;
      }
      return v;
    }));
    showToast('PENGISIAN BBM BERHASIL', 'Tangki bahan bakar armada telah diisi penuh (100%).', 'success');
  };

  // Vehicle status cycle
  const handleToggleVehicleStatus = (id: number) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        const nextStatus: 'Siap' | 'Bertugas' | 'Servis' = 
          v.status === 'Siap' ? 'Bertugas' : v.status === 'Bertugas' ? 'Servis' : 'Siap';
        const updated = { ...v, status: nextStatus };
        syncVehicleToFirestore(updated);
        return updated;
      }
      return v;
    }));
    showToast('STATUS ARMADA DIPERBARUI', 'Status operasional armada telah diperbarui.', 'info');
  };

  // Add Vehicle handler
  const handleAddVehicle = (newV: GasVehicle) => {
    setVehicles(prev => [newV, ...prev]);
    syncVehicleToFirestore(newV);
    showToast('ARMADA DITAMBAHKAN', `Armada ${newV.name} (${newV.plat}) berhasil didaftarkan.`, 'success');
  };

  // Add Personnel handler
  const handleAddPersonel = (newP: GasPersonel) => {
    setPersonnel(prev => [newP, ...prev]);
    syncPersonelToFirestore(newP);
    showToast('PERSONIL DITAMBAHKAN', `Data personil ${newP.nama} berhasil didaftarkan.`, 'success');
  };

  const activeIncidentsCount = incidents.filter(i => i.status === 'Aktif').length;
  const readyVehiclesCount = vehicles.filter(v => v.status === 'Siap').length;

  const handleLogout = () => {
    authService.logout();
    setUserSession(null);
    showToast('LOGOUT BERHASIL', 'Anda telah keluar dari sistem SIM-PROKAS.', 'info');
  };

  // If not authenticated, display the dedicated login screen matching Image 1
  if (!userSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
        <LoginView
          onLoginSuccess={(session) => {
            setUserSession(session);
            setUserRole(session.role);
            if (session.regionId && session.role === 'operator_kabkota') {
              setSelectedRegionId(session.regionId);
            }
            showToast('LOGIN BERHASIL', `Selamat datang di SIM-PROKAS, ${session.userName}`, 'success');
          }}
        />
        <ToastContainer
          toasts={toasts}
          onDismiss={handleDismissToast}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-rose-600 selection:text-white">
      
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        personnelCount={personnel.length}
        activeIncidentsCount={activeIncidentsCount}
        readyVehiclesCount={readyVehiclesCount}
        userRole={userRole}
        userSession={userSession}
        onChangeUserRole={setUserRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onTriggerSimulation={handleTriggerSimulation}
          selectedRegionId={selectedRegionId}
          onSelectRegion={setSelectedRegionId}
          period={period}
          onSelectPeriod={setPeriod}
          userRole={userRole}
          userSession={userSession}
          onLogout={handleLogout}
          onChangeUserRole={setUserRole}
          unreadAlertsCount={activeIncidentsCount}
        />

        {/* View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {currentTab === 'dashboard' && (
            <DashboardView
              incidents={incidents}
              onAddIncident={handleAddIncident}
              onTriggerSimulation={handleTriggerSimulation}
              onNavigateToTab={setCurrentTab}
              flyToCoords={flyToCoords}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
              period={period}
              onSelectPeriod={setPeriod}
              userRole={userRole}
              userSession={userSession}
            />
          )}

          {currentTab === 'personel' && (
            <PersonelView
              personnel={personnel}
              onAddPersonel={handleAddPersonel}
              userRole={userRole}
              userSession={userSession}
            />
          )}

          {currentTab === 'kejadian' && (
            <KejadianView
              incidents={incidents}
              onAddIncident={handleAddIncident}
              onCompleteIncident={handleCompleteIncident}
              onDeleteIncident={handleDeleteIncident}
            />
          )}

          {currentTab === 'kendaraan' && (
            <KendaraanView
              vehicles={vehicles}
              onRefillFuel={handleRefillFuel}
              onToggleStatus={handleToggleVehicleStatus}
              onAddVehicle={handleAddVehicle}
              userRole={userRole}
              userSession={userSession}
            />
          )}

          {currentTab === 'eksekutif' && (
            <EksekutifView
              period={period}
              userRole={userRole}
              onNavigateToReport={(regId) => {
                setSelectedRegionId(regId);
                if (userRole === 'admin_provinsi') {
                  setCurrentTab('laporan');
                } else {
                  setCurrentTab('form_kabkota');
                }
              }}
            />
          )}

          {currentTab === 'laporan' && userRole === 'admin_provinsi' && (
            <LaporanView
              regionId={selectedRegionId}
              period={period}
              userRole={userRole}
              onSelectRegion={setSelectedRegionId}
              onNavigateToForm={() => setCurrentTab('form_kabkota')}
            />
          )}

          {currentTab === 'form_kabkota' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <ReportForm
                regionId={selectedRegionId}
                period={period}
                userRole={userRole}
                userSession={userSession}
                onGoToPdf={() => {
                  if (userRole === 'admin_provinsi') {
                    setCurrentTab('laporan');
                  }
                }}
                onSelectRegion={setSelectedRegionId}
                onSelectPeriod={setPeriod}
              />
            </div>
          )}

          {currentTab === 'manajemen_akun' && userRole === 'admin_provinsi' && (
            <AccountManagementView
              onShowToast={showToast}
            />
          )}

          {currentTab === 'bimtek_diskominfo' && userRole === 'admin_provinsi' && (
            <BimtekDiskominfoView
              onStartSimulation={() => setCurrentTab('form_kabkota')}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="bg-slate-900/80 border-t border-slate-800/80 py-4 px-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">SIM-PROKAS Prov. Kalimantan Timur</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">SE Sekda No. 300.1/3326/SATPOL.PP-IV</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Inisiasi Mandiri oleh <strong className="text-slate-300">Ronaldi Surya Darma</strong> • SPBE & TTE BSrE Ready
          </div>
        </footer>

      </div>

      {/* Floating Toast Notification System */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
      />

    </div>
  );
}

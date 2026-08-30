import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { GisMapTab } from './components/GisMapTab';
import { DeskSurveyTab } from './components/DeskSurveyTab';
import { Fgd1Tab } from './components/Fgd1Tab';
import { GroundCheckTab } from './components/GroundCheckTab';
import { Fgd2Tab } from './components/Fgd2Tab';
import { FinalExportTab } from './components/FinalExportTab';
import { SurveyDetailModal } from './components/SurveyDetailModal';
import { LoginPage } from './components/LoginPage';
import { TabType, SurveyRecord, FgdRecord, User } from './types';
import {
  loadSurveyRecords,
  saveSurveyRecords,
  loadFgdRecords,
  saveFgdRecords,
  resetToSampleData,
} from './utils/storage';
import { getStoredUser, saveStoredUser, DEFAULT_SYSTEM_ACCOUNTS } from './utils/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [fgdRecords, setFgdRecords] = useState<FgdRecord[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyRecord | null>(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return getStoredUser() || {
      id: DEFAULT_SYSTEM_ACCOUNTS[0].id,
      name: DEFAULT_SYSTEM_ACCOUNTS[0].name,
      email: DEFAULT_SYSTEM_ACCOUNTS[0].email,
      role: DEFAULT_SYSTEM_ACCOUNTS[0].role,
      roleTitle: DEFAULT_SYSTEM_ACCOUNTS[0].roleTitle,
      agency: DEFAULT_SYSTEM_ACCOUNTS[0].agency,
      avatarBg: DEFAULT_SYSTEM_ACCOUNTS[0].avatarBg,
      initials: DEFAULT_SYSTEM_ACCOUNTS[0].initials,
    };
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Cross-tab coordinate passing (from GIS map to Ground Check)
  const [presetLat, setPresetLat] = useState<number | null>(null);
  const [presetLng, setPresetLng] = useState<number | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const loadedSurveys = loadSurveyRecords();
    const loadedFgds = loadFgdRecords();
    setSurveys(loadedSurveys);
    setFgdRecords(loadedFgds);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveStoredUser(user);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredUser(null);
    setShowLoginModal(true);
  };

  const handleSwitchAccount = () => {
    setShowLoginModal(true);
  };

  // Save surveys whenever they change
  const handleUpdateSurveys = (newSurveys: SurveyRecord[]) => {
    setSurveys(newSurveys);
    saveSurveyRecords(newSurveys);
  };

  // Save FGDs whenever they change
  const handleUpdateFgds = (newFgds: FgdRecord[]) => {
    setFgdRecords(newFgds);
    saveFgdRecords(newFgds);
  };

  // Add / Import multiple surveys
  const handleImportSurveys = (imported: SurveyRecord[]) => {
    const combined = [...surveys, ...imported];
    handleUpdateSurveys(combined);
    setActiveTab('dashboard');
  };

  // Save or update single survey record
  const handleSaveSingleSurvey = (record: SurveyRecord) => {
    const idx = surveys.findIndex((s) => s.id === record.id);
    let updated: SurveyRecord[];
    if (idx >= 0) {
      updated = [...surveys];
      updated[idx] = record;
    } else {
      updated = [record, ...surveys];
    }
    handleUpdateSurveys(updated);
  };

  // Delete survey record
  const handleDeleteSurvey = (id: string) => {
    const updated = surveys.filter((s) => s.id !== id);
    handleUpdateSurveys(updated);
    if (selectedSurvey?.id === id) {
      setSelectedSurvey(null);
    }
  };

  // Save FGD record
  const handleSaveFgd = (fgd: FgdRecord) => {
    const idx = fgdRecords.findIndex((f) => f.id === fgd.id);
    let updated: FgdRecord[];
    if (idx >= 0) {
      updated = [...fgdRecords];
      updated[idx] = fgd;
    } else {
      updated = [fgd, ...fgdRecords];
    }
    handleUpdateFgds(updated);
  };

  // Delete FGD record
  const handleDeleteFgd = (id: string) => {
    const updated = fgdRecords.filter((f) => f.id !== id);
    handleUpdateFgds(updated);
  };

  // Update survey verification status by corridor name
  const handleUpdateSurveyStatus = (corridorName: string, status: string) => {
    const updated = surveys.map((s) => {
      if (s.nama_jalan.toLowerCase() === corridorName.toLowerCase()) {
        return { ...s, status_verifikasi: status };
      }
      return s;
    });
    handleUpdateSurveys(updated);
  };

  // Reset to default sample dataset
  const handleResetSample = () => {
    if (confirm('Kembalikan data ke 15 koridor baseline studi Kota Makassar? Perubahan yang belum diexport akan ditimpa.')) {
      resetToSampleData();
      const loadedSurveys = loadSurveyRecords();
      const loadedFgds = loadFgdRecords();
      setSurveys(loadedSurveys);
      setFgdRecords(loadedFgds);
      alert('Data berhasil di-reset ke 15 koridor percontohan Makassar!');
    }
  };

  // Jump from GIS to Ground Check with picked coordinate
  const handlePickCoordinateForGroundCheck = (lat: number, lng: number) => {
    setPresetLat(lat);
    setPresetLng(lng);
    setActiveTab('ground');
  };

  if (!currentUser || showLoginModal) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onResetData={handleResetSample}
        totalRuas={surveys.length}
        totalP1={surveys.filter((s) => (s.prioritas || '').startsWith('P1')).length}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchAccount={handleSwitchAccount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'dashboard' && (
          <DashboardTab
            surveys={surveys}
            fgds={fgdRecords}
            onSelectSurvey={(s) => setSelectedSurvey(s)}
            onDeleteSurvey={handleDeleteSurvey}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'gis' && (
          <GisMapTab
            surveys={surveys}
            onSelectSurvey={(s) => setSelectedSurvey(s)}
            onPickCoordinateForGroundCheck={handlePickCoordinateForGroundCheck}
          />
        )}

        {activeTab === 'desk' && (
          <DeskSurveyTab
            onImportSurveys={handleImportSurveys}
            onLoadSample={handleResetSample}
            existingCount={surveys.length}
          />
        )}

        {activeTab === 'fgd1' && (
          <Fgd1Tab
            surveys={surveys}
            fgds={fgdRecords}
            onSaveFgd={handleSaveFgd}
            onDeleteFgd={handleDeleteFgd}
            onUpdateSurveyStatus={handleUpdateSurveyStatus}
          />
        )}

        {activeTab === 'ground' && (
          <GroundCheckTab
            surveys={surveys}
            onSaveGroundCheck={handleSaveSingleSurvey}
            presetLat={presetLat}
            presetLng={presetLng}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'fgd2' && (
          <Fgd2Tab
            surveys={surveys}
            fgds={fgdRecords}
            onSaveFgd={handleSaveFgd}
            onDeleteFgd={handleDeleteFgd}
            onUpdateSurveyStatus={handleUpdateSurveyStatus}
          />
        )}

        {activeTab === 'export' && (
          <FinalExportTab surveys={surveys} fgds={fgdRecords} />
        )}
      </main>

      {/* Detail / Edit Modal */}
      {selectedSurvey && (
        <SurveyDetailModal
          survey={selectedSurvey}
          isOpen={!!selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
          onUpdate={handleSaveSingleSurvey}
          onDelete={handleDeleteSurvey}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Sistem Informasi Survei & Penataan Kabel Udara Terpadu (Ducting) Kota Makassar
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-mono text-[11px]">V4 FGD Master Study</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Pemerintah Kota Makassar &copy; {new Date().getFullYear()} • Kokek Konsulting
          </div>
        </div>
      </footer>
    </div>
  );
}


import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart3,
  MapPin,
  FileSpreadsheet,
  Users,
  ClipboardCheck,
  Building2,
  Download,
  RotateCcw,
  Layers,
  ChevronRight,
  LogOut,
  UserCheck,
  User as UserIcon,
  Shield,
  HardHat,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { TabType, User, UserRole } from '../types';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onResetData: () => void;
  totalRuas: number;
  totalP1: number;
  currentUser: User | null;
  onLogout: () => void;
  onSwitchAccount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onResetData,
  totalRuas,
  totalP1,
  currentUser,
  onLogout,
  onSwitchAccount,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-indigo-400" />;
      case 'surveyor':
        return <HardHat className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const getRoleBadgeClass = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'surveyor':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const tabs: { key: TabType; label: string; icon: any; badge?: string }[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      badge: `${totalRuas} Ruas`,
    },
    {
      key: 'gis',
      label: 'Peta GIS',
      icon: MapPin,
      badge: `${totalP1} P1`,
    },
    {
      key: 'desk',
      label: 'Desk Survey',
      icon: FileSpreadsheet,
    },
    {
      key: 'fgd1',
      label: 'FGD-1',
      icon: Users,
    },
    {
      key: 'ground',
      label: 'Ground Check',
      icon: ClipboardCheck,
    },
    {
      key: 'fgd2',
      label: 'FGD-2',
      icon: Building2,
    },
    {
      key: 'export',
      label: 'Final Export',
      icon: Download,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800/80 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20 shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Makassar Ducting Survey V4</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  FGD Edition
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-normal truncate max-w-md">
              Sistem Informasi Survei, Scoring Prioritas & Penataan Kabel Udara Terpadu Kota Makassar
            </p>
          </div>
        </div>

        {/* Action, Workflow & User Profile Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2 text-xs flex-wrap">
          <div className="hidden xl:flex items-center bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] gap-2 shadow-xs">
            <span className="text-sky-400 font-medium">Desk Survey</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-amber-400 font-medium">FGD-1</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-emerald-400 font-medium">Ground Check</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-purple-400 font-medium">FGD-2</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-pink-400 font-medium">Master Export</span>
          </div>

          <button
            id="btn-reset-sample-data"
            onClick={onResetData}
            title="Reset data ke 15 koridor baseline Makassar"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800 hover:border-slate-700 text-xs font-medium cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Sample</span>
          </button>

          {/* User Profile Badge & Dropdown */}
          {currentUser ? (
            <div className="relative" ref={profileRef}>
              <button
                id="btn-user-profile-menu"
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group shadow-xs"
              >
                <div
                  className={`w-6 h-6 rounded-md ${currentUser.avatarBg || 'bg-indigo-600'} text-white text-[11px] font-bold flex items-center justify-center shadow-xs shrink-0`}
                >
                  {currentUser.initials || 'U'}
                </div>
                <div className="hidden sm:block max-w-[130px] truncate">
                  <div className="text-xs font-medium text-white truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate leading-tight">
                    {currentUser.roleTitle}
                  </div>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded border font-mono uppercase font-semibold shrink-0 ${getRoleBadgeClass(
                    currentUser.role
                  )}`}
                >
                  {currentUser.role}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900/98 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl z-50 py-2 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      {getRoleIcon(currentUser.role)}
                      <span className="text-xs font-bold text-white truncate">
                        {currentUser.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">{currentUser.agency}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      id="btn-switch-account"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onSwitchAccount();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-medium">Ganti Peran / Akun</div>
                        <div className="text-[10px] text-slate-400">
                          Beralih antara Administrator atau Surveyor Lapangan
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="btn-logout"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-800/80 mt-1"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span className="font-medium">Keluar dari Sesi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              id="btn-nav-login"
              onClick={onSwitchAccount}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer shadow-xs transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/60 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-1.5 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  id={`tab-nav-${tab.key}`}
                  onClick={() => onSelectTab(tab.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                        isActive
                          ? 'bg-indigo-800/80 text-indigo-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

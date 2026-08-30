import React from 'react';
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
} from 'lucide-react';
import { TabType } from '../types';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onResetData: () => void;
  totalRuas: number;
  totalP1: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onResetData,
  totalRuas,
  totalP1,
}) => {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
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
            <p className="text-[11px] text-slate-400 font-normal">
              Sistem Informasi Survei, Scoring Prioritas & Penataan Kabel Udara Terpadu Kota Makassar
            </p>
          </div>
        </div>

        {/* Workflow breadcrumb & Action */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 text-xs">
          <div className="hidden lg:flex items-center bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] gap-2 shadow-xs">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800 hover:border-slate-700 text-xs font-medium cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Sample</span>
          </button>
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

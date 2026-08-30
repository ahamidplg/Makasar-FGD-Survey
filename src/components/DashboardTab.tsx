import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  BarChart2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowUpDown,
  Eye,
  Trash2,
  FileSpreadsheet,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { SurveyRecord, FgdRecord } from '../types';
import { getPriorityColor } from '../utils/scoring';
import { calculateRekapKecamatan } from '../utils/excelExport';

interface DashboardTabProps {
  surveys: SurveyRecord[];
  fgds: FgdRecord[];
  onSelectSurvey: (survey: SurveyRecord) => void;
  onDeleteSurvey: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  surveys,
  fgds,
  onSelectSurvey,
  onDeleteSurvey,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'panjang' | 'nama' | 'tiang'>('score');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // All distinct kecamatans
  const allKecamatans = useMemo(() => {
    const set = new Set<string>();
    surveys.forEach((s) => {
      if (s.kecamatan) set.add(s.kecamatan);
    });
    return Array.from(set).sort();
  }, [surveys]);

  // Metrics
  const totalRuas = surveys.length;
  const totalPanjangKm = useMemo(() => {
    const sum = surveys.reduce((acc, curr) => acc + (Number(curr.panjang_m) || 0), 0);
    return Math.round((sum / 1000) * 100) / 100;
  }, [surveys]);

  const p1Count = useMemo(
    () => surveys.filter((s) => (s.prioritas || '').startsWith('P1')).length,
    [surveys]
  );
  const p2Count = useMemo(
    () => surveys.filter((s) => (s.prioritas || '').startsWith('P2')).length,
    [surveys]
  );
  const p3Count = useMemo(
    () => surveys.filter((s) => (s.prioritas || '').startsWith('P3')).length,
    [surveys]
  );
  const p4Count = useMemo(
    () => surveys.filter((s) => (s.prioritas || '').startsWith('P4')).length,
    [surveys]
  );

  const groundCheckedCount = useMemo(
    () =>
      surveys.filter((s) =>
        (s.status_verifikasi || '').toLowerCase().includes('ground')
      ).length,
    [surveys]
  );

  const totalFgdCount = fgds.length;

  // Filtered & Sorted survey list
  const filteredSurveys = useMemo(() => {
    return surveys
      .filter((s) => {
        if (selectedKecamatan !== 'ALL' && s.kecamatan !== selectedKecamatan) {
          return false;
        }
        if (selectedPriority !== 'ALL' && !s.prioritas.startsWith(selectedPriority)) {
          return false;
        }
        if (selectedStatus !== 'ALL' && s.status_verifikasi !== selectedStatus) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = (s.nama_jalan || '').toLowerCase().includes(q);
          const matchKec = (s.kecamatan || '').toLowerCase().includes(q);
          const matchKel = (s.kelurahan || '').toLowerCase().includes(q);
          const matchSurveyor = (s.surveyor || '').toLowerCase().includes(q);
          const matchCatatan = (s.catatan || '').toLowerCase().includes(q);
          if (!matchName && !matchKec && !matchKel && !matchSurveyor && !matchCatatan) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'score') {
          diff = (a.score || 0) - (b.score || 0);
        } else if (sortBy === 'panjang') {
          diff = (a.panjang_m || 0) - (b.panjang_m || 0);
        } else if (sortBy === 'nama') {
          diff = (a.nama_jalan || '').localeCompare(b.nama_jalan || '');
        } else if (sortBy === 'tiang') {
          const ta = (a.jumlah_tiang_telkom || 0) + (a.jumlah_tiang_pln_pju || 0);
          const tb = (b.jumlah_tiang_telkom || 0) + (b.jumlah_tiang_pln_pju || 0);
          diff = ta - tb;
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [
    surveys,
    selectedKecamatan,
    selectedPriority,
    selectedStatus,
    searchQuery,
    sortBy,
    sortOrder,
  ]);

  // Chart Data: Priority Distribution
  const pieData = [
    { name: 'P1 - Sangat Urgent', value: p1Count, color: '#dc2626' },
    { name: 'P2 - Urgent', value: p2Count, color: '#ea580c' },
    { name: 'P3 - Menengah', value: p3Count, color: '#d97706' },
    { name: 'P4 - Jangka Panjang', value: p4Count, color: '#16a34a' },
  ].filter((d) => d.value > 0);

  // Chart Data: Top Kecamatan by Ruas & Avg Score
  const rekapKec = useMemo(() => calculateRekapKecamatan(surveys).slice(0, 8), [surveys]);

  return (
    <div className="space-y-6 pb-12">
      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Ruas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ruas</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{totalRuas}</div>
          <span className="text-[11px] text-slate-500 font-medium">Segmen Koridor</span>
        </div>

        {/* Total Panjang */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Panjang (km)</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{totalPanjangKm}</div>
          <span className="text-[11px] text-slate-500 font-medium">Total Jaringan</span>
        </div>

        {/* P1 Sangat Urgent */}
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-gradient-to-br from-red-50/40 to-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Prioritas P1</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-red-700">{p1Count}</div>
          <span className="text-[11px] text-red-600 font-medium">Score ≥ 80 (Urgent)</span>
        </div>

        {/* P2 Urgent */}
        <div className="bg-white p-4 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50/40 to-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Prioritas P2</span>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-orange-700">{p2Count}</div>
          <span className="text-[11px] text-orange-600 font-medium">Score 60 - 79.9</span>
        </div>

        {/* Ground Checked */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Ground Checked</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-800">{groundCheckedCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {totalRuas > 0 ? Math.round((groundCheckedCount / totalRuas) * 100) : 0}% Validasi Lapangan
          </span>
        </div>

        {/* Catatan FGD */}
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/40 to-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Catatan FGD</span>
            <AlertCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-purple-800">{totalFgdCount}</div>
          <span className="text-[11px] text-purple-600 font-medium">Log Sesi FGD 1 & 2</span>
        </div>
      </div>

      {/* Visual Charts Overview */}
      {surveys.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Priority Distribution Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900">Distribusi Prioritas Ducting</h3>
                <span className="text-xs text-slate-500 font-medium">{surveys.length} Ruas</span>
              </div>
              <p className="text-xs text-slate-500">
                Proporsi kesegeraan penataan kabel udara berdasarkan scoring terbobot.
              </p>
            </div>

            <div className="h-56 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} Ruas (${Math.round(((value as number) / totalRuas) * 100)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="text-slate-600">P1: {p1Count} ruas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-slate-600">P2: {p2Count} ruas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">P3: {p3Count} ruas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-slate-600">P4: {p4Count} ruas</span>
              </div>
            </div>
          </div>

          {/* Top Kecamatan Comparison Bar Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900">Rekapitulasi Kecamatan & Rata-rata Score</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Top 8 Wilayah
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Perbandingan jumlah ruas jalan dan rata-rata indeks kesemrawutan kabel per kecamatan.
              </p>
            </div>

            <div className="h-56 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rekapKec} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis
                    dataKey="kecamatan"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={40}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="score_rata2" name="Rata-rata Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="jumlah_ruas" name="Jumlah Ruas" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Koridor prioritas terkonsentrasi di Panakkukang, Ujung Pandang, dan Rappocini.</span>
              <button
                onClick={() => onNavigateTab('gis')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Lihat di Peta GIS →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama jalan, kelurahan, surveyor, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('ground')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Ground Check</span>
            </button>

            <button
              onClick={() => onNavigateTab('desk')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import Excel/CSV</span>
            </button>
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Kecamatan Filter */}
          <select
            value={selectedKecamatan}
            onChange={(e) => setSelectedKecamatan(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Kecamatan ({allKecamatans.length})</option>
            {allKecamatans.map((kec) => (
              <option key={kec} value={kec}>
                Kec. {kec}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="P1">P1 - Sangat Urgent (≥80)</option>
            <option value="P2">P2 - Urgent (60-79.9)</option>
            <option value="P3">P3 - Menengah (40-59.9)</option>
            <option value="P4">P4 - Jangka Panjang (&lt;40)</option>
          </select>

          {/* Status Verifikasi */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Status Verifikasi</option>
            <option value="Desk Only">Desk Only</option>
            <option value="Ground Checked">Ground Checked</option>
            <option value="FGD-1 Validated">FGD-1 Validated</option>
            <option value="FGD-2 Final Recommendation">FGD-2 Final Recommendation</option>
          </select>

          {/* Sorting */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-slate-400">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium"
            >
              <option value="score">Score Tertinggi</option>
              <option value="panjang">Panjang Jalan</option>
              <option value="tiang">Total Tiang</option>
              <option value="nama">Nama Jalan</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              title="Ganti Urutan"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Survey Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Koridor Survey Ducting Kota Makassar
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Menampilkan {filteredSurveys.length} dari {surveys.length} ruas
            </span>
          </div>

          <div className="text-xs text-slate-500">
            Klik baris atau tombol <span className="font-semibold text-indigo-600">Detail</span> untuk melihat foto & kalkulasi bobot.
          </div>
        </div>

        {filteredSurveys.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">Tidak ada data koridor yang cocok.</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau filter kecamatan / prioritas.
            </p>
            {surveys.length === 0 && (
              <button
                onClick={() => onNavigateTab('desk')}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
              >
                Mulai Import Desk Survey
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Prioritas & Score</th>
                  <th className="py-3 px-4">Nama Jalan & Koridor</th>
                  <th className="py-3 px-4">Wilayah</th>
                  <th className="py-3 px-4">Panjang</th>
                  <th className="py-3 px-4">Kelas Jalan</th>
                  <th className="py-3 px-4">Kepadatan Kabel</th>
                  <th className="py-3 px-4">Kelayakan</th>
                  <th className="py-3 px-4">Tiang (Tlk/PLN)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSurveys.map((row) => {
                  const prioStyle = getPriorityColor(row.prioritas);
                  const totalTiang =
                    (Number(row.jumlah_tiang_telkom) || 0) +
                    (Number(row.jumlah_tiang_pln_pju) || 0);

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectSurvey(row)}
                    >
                      {/* Prioritas & Score */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${prioStyle.badge}`}
                          >
                            {row.prioritas.split(' - ')[0]}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900">
                            {row.score}
                          </span>
                        </div>
                      </td>

                      {/* Nama Jalan */}
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                        <div className="line-clamp-1">{row.nama_jalan}</div>
                        {row.photo_path && (
                          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                            📷 Ada Foto Lapangan
                          </span>
                        )}
                      </td>

                      {/* Wilayah */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <div>Kec. {row.kecamatan}</div>
                        <div className="text-[11px] text-slate-400">Kel. {row.kelurahan || '-'}</div>
                      </td>

                      {/* Panjang */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                        {row.panjang_m.toLocaleString('id-ID')} m
                      </td>

                      {/* Kelas Jalan */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {row.kelas_jalan}
                        </span>
                      </td>

                      {/* Kepadatan Kabel */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium">
                        <span
                          className={
                            row.kepadatan_kabel === 'Sangat Tinggi'
                              ? 'text-red-600 font-bold'
                              : row.kepadatan_kabel === 'Tinggi'
                              ? 'text-orange-600 font-semibold'
                              : 'text-slate-600'
                          }
                        >
                          {row.kepadatan_kabel}
                        </span>
                      </td>

                      {/* Kelayakan Ducting */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={
                            row.kelayakan_ducting === 'Sangat Layak'
                              ? 'text-emerald-700 font-semibold'
                              : 'text-slate-700'
                          }
                        >
                          {row.kelayakan_ducting}
                        </span>
                      </td>

                      {/* Tiang */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <span className="font-semibold text-slate-900">{totalTiang}</span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({row.jumlah_tiang_telkom || 0}/{row.jumlah_tiang_pln_pju || 0})
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            row.status_verifikasi.includes('Ground')
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : row.status_verifikasi.includes('FGD')
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {row.status_verifikasi}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectSurvey(row)}
                            className="p-1 rounded hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            title="Lihat Detail & Edit"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data survei "${row.nama_jalan}"?`)) {
                                onDeleteSurvey(row.id);
                              }
                            }}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

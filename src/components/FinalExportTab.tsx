import React from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Building,
  Layers,
  Award,
  TrendingUp,
  CheckCircle2,
  Table,
  Sparkles,
} from 'lucide-react';
import { SurveyRecord, FgdRecord } from '../types';
import { exportMasterExcel, exportSurveyCsv, exportFgdCsv, calculateRekapKecamatan } from '../utils/excelExport';
import { getPriorityColor } from '../utils/scoring';

interface FinalExportTabProps {
  surveys: SurveyRecord[];
  fgds: FgdRecord[];
}

export const FinalExportTab: React.FC<FinalExportTabProps> = ({ surveys, fgds }) => {
  const rekapKecamatan = calculateRekapKecamatan(surveys);

  const top30Surveys = [...surveys]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 30);

  const totalPanjangKm = Math.round(
    (surveys.reduce((acc, curr) => acc + (Number(curr.panjang_m) || 0), 0) / 1000) * 100
  ) / 100;

  const totalTiang = surveys.reduce(
    (acc, curr) =>
      acc + (Number(curr.jumlah_tiang_telkom) || 0) + (Number(curr.jumlah_tiang_pln_pju) || 0),
    0
  );

  const p1Count = surveys.filter((s) => (s.prioritas || '').startsWith('P1')).length;
  const p2Count = surveys.filter((s) => (s.prioritas || '').startsWith('P2')).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-500/30 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Dokumen Output Kajian Master Terpadu</span>
            </div>
            <h2 className="text-xl font-bold text-white">📤 Final Export — Bahan Kajian & Rekomendasi Master</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Unduh buku kerja Excel komprehensif berformat multi-sheet (Survey, Log FGD, Rekapitulasi Wilayah,
              dan Top Prioritas) untuk lampiran naskah akademik, lelang KPBU, atau Peraturan Walikota.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => exportMasterExcel(surveys, fgds)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>⬇️ Download Excel Kajian Master (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Download Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Excel Master */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h4>Excel Kajian Master</h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Workbook multi-sheet memuat: Data Survey + FGD Log + Rekap Kecamatan + Top 30 + Metodologi Bobot.
            </p>
          </div>
          <button
            onClick={() => exportMasterExcel(surveys, fgds)}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Master .XLSX</span>
          </button>
        </div>

        {/* CSV Survey */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileText className="w-5 h-5 text-sky-600" />
              <h4>CSV Data Survey</h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Seluruh baris ruas survey, koordinat GPS, score, dan status verifikasi dalam format CSV (UTF-8).
            </p>
          </div>
          <button
            onClick={() => exportSurveyCsv(surveys)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Survey .CSV</span>
          </button>
        </div>

        {/* CSV FGD Log */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileText className="w-5 h-5 text-purple-600" />
              <h4>CSV Notulensi FGD</h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Catatan komprehensif sesi FGD-1 dan FGD-2, kesepakatan stakeholder, dan status validasi.
            </p>
          </div>
          <button
            onClick={() => exportFgdCsv(fgds)}
            className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download FGD Log .CSV</span>
          </button>
        </div>
      </div>

      {/* Executive Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Total Ruas Terdata</span>
          <span className="text-xl font-bold text-slate-900">{surveys.length} Ruas</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Panjang Total Jaringan</span>
          <span className="text-xl font-bold text-slate-900">{totalPanjangKm} km</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Total Tiang Terinventarisasi</span>
          <span className="text-xl font-bold text-slate-900">{totalTiang} Unit</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Ruas Mendesak (P1 & P2)</span>
          <span className="text-xl font-bold text-red-600">{p1Count + p2Count} Ruas</span>
        </div>
      </div>

      {/* Rekapitulasi Kecamatan Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rekapitulasi Wilayah & Rata-rata Skor per Kecamatan
            </h3>
            <p className="text-xs text-slate-500">
              Agregasi koridor jalan, panjang total (km), dan konsentrasi tiang utilitas per kecamatan di Makassar.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {rekapKecamatan.length} Kecamatan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Kecamatan</th>
                <th className="py-2.5 px-3">Jumlah Ruas</th>
                <th className="py-2.5 px-3">Panjang (km)</th>
                <th className="py-2.5 px-3">Rata-rata Score</th>
                <th className="py-2.5 px-3">Ruas P1</th>
                <th className="py-2.5 px-3">Ruas P2</th>
                <th className="py-2.5 px-3">Total Tiang (Telkom/PLN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekapKecamatan.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    Kec. {row.kecamatan}
                  </td>
                  <td className="py-2.5 px-3">{row.jumlah_ruas} ruas</td>
                  <td className="py-2.5 px-3">{row.panjang_km} km</td>
                  <td className="py-2.5 px-3 font-bold text-indigo-700">{row.score_rata2}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                      {row.p1_count}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">
                      {row.p2_count}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {row.tiang_telkom_total + row.tiang_pln_total} unit
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({row.tiang_telkom_total} Telkom / {row.tiang_pln_total} PLN)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 30 Priority Corridors */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top 30 Koridor Prioritas Tertinggi (Urutan Pembangunan)
            </h3>
            <p className="text-xs text-slate-500">
              Daftar ruas jalan dengan skor indeks tertinggi yang direkomendasikan masuk prioritas eksekusi tahap pertama.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-bold">
            Prioritas P1 & P2
          </span>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Nama Jalan</th>
                <th className="py-2.5 px-3">Kecamatan</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Prioritas</th>
                <th className="py-2.5 px-3">Panjang (m)</th>
                <th className="py-2.5 px-3">Status Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top30Surveys.map((row, idx) => {
                const pColor = getPriorityColor(row.prioritas);
                return (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{row.nama_jalan}</td>
                    <td className="py-2.5 px-3 text-slate-600">{row.kecamatan}</td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{row.score}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pColor.badge}`}>
                        {row.prioritas.split(' - ')[0]}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{row.panjang_m.toLocaleString('id-ID')} m</td>
                    <td className="py-2.5 px-3 text-slate-600">{row.status_verifikasi}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

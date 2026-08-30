import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';
import { SurveyRecord } from '../types';
import { calculateScore, getPriority, getPriorityColor } from '../utils/scoring';
import { downloadImportTemplate } from '../utils/excelExport';

interface DeskSurveyTabProps {
  onImportSurveys: (records: SurveyRecord[]) => void;
  onLoadSample: () => void;
  existingCount: number;
}

export const DeskSurveyTab: React.FC<DeskSurveyTabProps> = ({
  onImportSurveys,
  onLoadSample,
  existingCount,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setErrorMsg(null);
    setSuccessMsg(null);

    const fileName = selected.name.toLowerCase();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            setErrorMsg('File Excel kosong atau format tidak sesuai.');
            return;
          }
          setParsedRows(jsonData);
        } catch (err: any) {
          setErrorMsg(`Gagal membaca file Excel: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(selected);
    } else if (fileName.endsWith('.csv')) {
      Papa.parse(selected, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            setErrorMsg('File CSV kosong.');
            return;
          }
          setParsedRows(results.data);
        },
        error: (err) => {
          setErrorMsg(`Gagal mem-parse file CSV: ${err.message}`);
        },
      });
    } else {
      setErrorMsg('Format file harus berupa .xlsx, .xls, atau .csv');
    }
  };

  const handleProcessImport = () => {
    if (parsedRows.length === 0) {
      setErrorMsg('Tidak ada data untuk diimport.');
      return;
    }

    setIsProcessing(true);
    try {
      const newRecords: SurveyRecord[] = parsedRows.map((row, idx) => {
        const id = `survey-import-${Date.now()}-${idx + 1}`;
        const kecamatan = String(row.kecamatan || row.Kecamatan || '').trim();
        const kelurahan = String(row.kelurahan || row.Kelurahan || '').trim();
        const nama_jalan = String(
          row.nama_jalan || row['Nama Jalan'] || row.nama || `Ruas Import #${idx + 1}`
        ).trim();
        const latitude = parseFloat(row.latitude || row.lat || row.Latitude || '-5.1477') || -5.1477;
        const longitude = parseFloat(row.longitude || row.lng || row.Longitude || '119.4327') || 119.4327;
        const panjang_m = parseFloat(row.panjang_m || row.panjang || row['Panjang (m)'] || '500') || 500;
        const kelas_jalan = String(row.kelas_jalan || row['Kelas Jalan'] || 'Arteri Sekunder').trim();
        const kepadatan_kabel = String(row.kepadatan_kabel || row['Kepadatan Kabel'] || 'Tinggi').trim();
        const kepadatan_kawasan = String(row.kepadatan_kawasan || row['Kepadatan Kawasan'] || 'Tinggi').trim();
        const kepentingan_kawasan = String(
          row.kepentingan_kawasan || row['Kepentingan Kawasan'] || 'Tinggi'
        ).trim();
        const kondisi_kabel = String(row.kondisi_kabel || row['Kondisi Kabel'] || 'Sedang').trim();
        const potensi_jaringan = String(row.potensi_jaringan || row['Potensi Jaringan'] || 'Tinggi').trim();
        const kelayakan_ducting = String(
          row.kelayakan_ducting || row['Kelayakan Ducting'] || 'Layak'
        ).trim();
        const hambatan = String(row.hambatan || row.Hambatan || '').trim();
        const jumlah_tiang_telkom =
          parseInt(row.jumlah_tiang_telkom || row['Tiang Telkom'] || '0', 10) || 0;
        const jumlah_tiang_pln_pju =
          parseInt(row.jumlah_tiang_pln_pju || row['Tiang PLN'] || '0', 10) || 0;
        const trotoar = String(row.trotoar || row.Trotoar || 'Ada').trim();
        const drainase = String(row.drainase || row.Drainase || 'Ada').trim();
        const kawasan = String(row.kawasan || row.Kawasan || 'Komersial / Publik').trim();
        const surveyor = String(row.surveyor || row.Surveyor || 'Google Maps / Desk').trim();
        const tanggal_survey = String(
          row.tanggal_survey || row['Tanggal Survey'] || new Date().toISOString().split('T')[0]
        ).trim();
        const catatan = String(row.catatan || row.Catatan || '').trim();
        const photo_path = String(row.photo_path || row.Foto || '').trim();

        const score = calculateScore({
          kelas_jalan,
          kepadatan_kabel,
          kepadatan_kawasan,
          kepentingan_kawasan,
          kondisi_kabel,
          potensi_jaringan,
          kelayakan_ducting,
        });

        const prioritas = getPriority(score);

        return {
          id,
          kecamatan,
          kelurahan,
          nama_jalan,
          latitude,
          longitude,
          panjang_m,
          kelas_jalan,
          kepadatan_kabel,
          kepadatan_kawasan,
          kepentingan_kawasan,
          kondisi_kabel,
          potensi_jaringan,
          kelayakan_ducting,
          hambatan,
          jumlah_tiang_telkom,
          jumlah_tiang_pln_pju,
          trotoar,
          drainase,
          kawasan,
          sumber_data: 'Google Maps / Desk Survey',
          status_verifikasi: 'Desk Only',
          surveyor,
          tanggal_survey,
          catatan,
          score,
          prioritas,
          photo_path,
        };
      });

      onImportSurveys(newRecords);
      setSuccessMsg(
        `Sukses mengimpor dan menghitung otomatis ${newRecords.length} ruas koridor!`
      );
      setParsedRows([]);
      setFile(null);
    } catch (err: any) {
      setErrorMsg(`Error saat kalkulasi & import: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tahap 1: Desk Survey & Scoring Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white">Import Data Google Maps / Desk Survey</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Unggah berkas Excel atau CSV berisi data segmen jalan. Sistem akan secara otomatis
              menghitung bobot indeks kesemrawutan kabel dan menetapkan tingkat urgensi (P1 hingga P4).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={downloadImportTemplate}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/20 cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download Template Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-2xl p-8 text-center transition-colors">
          <input
            type="file"
            id="file-desk-upload"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="file-desk-upload" className="cursor-pointer block space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <span className="text-sm font-bold text-indigo-900 block">
                {file ? file.name : 'Klik untuk Pilih Berkas Excel atau CSV'}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Mendukung format .xlsx, .xls, dan .csv (maksimal 50 MB)
              </span>
            </div>
          </label>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Parsed Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pratinjau Data Unggahan ({parsedRows.length} Ruas Terdeteksi)
              </h3>
              <p className="text-xs text-slate-500">
                Periksa kolom data sebelum melakukan kalkulasi bobot dan penyimpanan ke basis data.
              </p>
            </div>

            <button
              onClick={handleProcessImport}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menghitung Bobot...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Import & Hitung Bobot Score (P1-P4)</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nama Jalan</th>
                  <th className="py-2.5 px-3">Kecamatan</th>
                  <th className="py-2.5 px-3">Kelas Jalan</th>
                  <th className="py-2.5 px-3">Kepadatan Kabel</th>
                  <th className="py-2.5 px-3">Kelayakan Ducting</th>
                  <th className="py-2.5 px-3">Panjang (m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.slice(0, 30).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {row.nama_jalan || row['Nama Jalan'] || row.nama || '-'}
                    </td>
                    <td className="py-2 px-3">{row.kecamatan || row.Kecamatan || '-'}</td>
                    <td className="py-2 px-3">{row.kelas_jalan || row['Kelas Jalan'] || '-'}</td>
                    <td className="py-2 px-3">{row.kepadatan_kabel || row['Kepadatan Kabel'] || '-'}</td>
                    <td className="py-2 px-3">{row.kelayakan_ducting || row['Kelayakan Ducting'] || '-'}</td>
                    <td className="py-2 px-3">{row.panjang_m || row.panjang || row['Panjang (m)'] || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 30 && (
            <p className="text-[11px] text-slate-400 italic text-center">
              Menampilkan 30 baris pertama dari total {parsedRows.length} data.
            </p>
          )}
        </div>
      )}

      {/* Scoring Weight Info Card */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Formula & Bobot Penilaian Multi-Kriteria</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Kepadatan Kabel</span>
            <span className="text-base font-extrabold text-indigo-600">25%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Kelas Jalan</span>
            <span className="text-base font-extrabold text-indigo-600">20%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Kepadatan Kawasan</span>
            <span className="text-base font-extrabold text-indigo-600">15%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Kepentingan Kawasan</span>
            <span className="text-base font-extrabold text-indigo-600">15%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Kondisi Kabel Fisik</span>
            <span className="text-base font-extrabold text-indigo-600">10%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Potensi Jaringan</span>
            <span className="text-base font-extrabold text-indigo-600">10%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Kelayakan Ducting</span>
            <span className="text-base font-extrabold text-indigo-600">5%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Kategori Urgensi</span>
            <span className="text-xs font-bold text-slate-800">P1 (≥80), P2 (≥60)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

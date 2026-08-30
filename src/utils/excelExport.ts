import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { SurveyRecord, FgdRecord, RekapKecamatan } from '../types';
import { WEIGHTS, LEVEL_SCORES, CLASS_SCORES } from './scoring';

export function calculateRekapKecamatan(surveys: SurveyRecord[]): RekapKecamatan[] {
  const map = new Map<
    string,
    {
      jumlah_ruas: number;
      panjang_m: number;
      total_score: number;
      p1_count: number;
      p2_count: number;
      p3_count: number;
      p4_count: number;
      tiang_telkom_total: number;
      tiang_pln_total: number;
    }
  >();

  surveys.forEach((s) => {
    const kec = s.kecamatan || 'Tidak Terdefinisi';
    const current = map.get(kec) || {
      jumlah_ruas: 0,
      panjang_m: 0,
      total_score: 0,
      p1_count: 0,
      p2_count: 0,
      p3_count: 0,
      p4_count: 0,
      tiang_telkom_total: 0,
      tiang_pln_total: 0,
    };

    current.jumlah_ruas += 1;
    current.panjang_m += Number(s.panjang_m) || 0;
    current.total_score += Number(s.score) || 0;
    current.tiang_telkom_total += Number(s.jumlah_tiang_telkom) || 0;
    current.tiang_pln_total += Number(s.jumlah_tiang_pln_pju) || 0;

    const prio = s.prioritas || '';
    if (prio.startsWith('P1')) current.p1_count += 1;
    else if (prio.startsWith('P2')) current.p2_count += 1;
    else if (prio.startsWith('P3')) current.p3_count += 1;
    else current.p4_count += 1;

    map.set(kec, current);
  });

  const result: RekapKecamatan[] = [];
  map.forEach((val, key) => {
    result.push({
      kecamatan: key,
      jumlah_ruas: val.jumlah_ruas,
      panjang_km: Math.round((val.panjang_m / 1000) * 100) / 100,
      score_rata2:
        val.jumlah_ruas > 0
          ? Math.round((val.total_score / val.jumlah_ruas) * 10) / 10
          : 0,
      p1_count: val.p1_count,
      p2_count: val.p2_count,
      p3_count: val.p3_count,
      p4_count: val.p4_count,
      tiang_telkom_total: val.tiang_telkom_total,
      tiang_pln_total: val.tiang_pln_total,
    });
  });

  return result.sort((a, b) => b.score_rata2 - a.score_rata2);
}

export function exportMasterExcel(surveys: SurveyRecord[], fgds: FgdRecord[]): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Survey
  const surveyData = surveys.map((s) => ({
    ID: s.id,
    Kecamatan: s.kecamatan,
    Kelurahan: s.kelurahan,
    'Nama Jalan': s.nama_jalan,
    'Latitude (GPS)': s.latitude,
    'Longitude (GPS)': s.longitude,
    'Panjang (m)': s.panjang_m,
    'Kelas Jalan': s.kelas_jalan,
    'Kepadatan Kabel': s.kepadatan_kabel,
    'Kepadatan Kawasan': s.kepadatan_kawasan,
    'Kepentingan Kawasan': s.kepentingan_kawasan,
    'Kondisi Kabel': s.kondisi_kabel,
    'Potensi Jaringan': s.potensi_jaringan,
    'Kelayakan Ducting': s.kelayakan_ducting,
    Hambatan: s.hambatan,
    'Tiang Telkom': s.jumlah_tiang_telkom,
    'Tiang PLN / PJU': s.jumlah_tiang_pln_pju,
    Trotoar: s.trotoar,
    Drainase: s.drainase,
    Kawasan: s.kawasan,
    'Sumber Data': s.sumber_data,
    'Status Verifikasi': s.status_verifikasi,
    Surveyor: s.surveyor,
    'Tanggal Survey': s.tanggal_survey,
    Catatan: s.catatan,
    'Score Akhir': s.score,
    Prioritas: s.prioritas,
    'Link Foto Lapangan': s.photo_path || '',
  }));
  const wsSurvey = XLSX.utils.json_to_sheet(surveyData);
  XLSX.utils.book_append_sheet(wb, wsSurvey, 'Survey');

  // Sheet 2: FGD Log
  const fgdData = fgds.map((f) => ({
    ID: f.id,
    Sesi: f.session,
    Tanggal: f.tanggal,
    'Stakeholder / Instansi': f.stakeholder,
    'Isu / Temuan': f.isu,
    'Koridor / Ruas': f.koridor,
    'Keputusan / Validasi': f.keputusan,
    'Tindak Lanjut': f.tindak_lanjut,
    Status: f.status,
    Catatan: f.catatan,
  }));
  const wsFgd = XLSX.utils.json_to_sheet(fgdData);
  XLSX.utils.book_append_sheet(wb, wsFgd, 'FGD_Log');

  // Sheet 3: Rekap Kecamatan
  const rekap = calculateRekapKecamatan(surveys);
  const rekapData = rekap.map((r) => ({
    Kecamatan: r.kecamatan,
    'Jumlah Ruas': r.jumlah_ruas,
    'Panjang Total (km)': r.panjang_km,
    'Rata-rata Score': r.score_rata2,
    'Jumlah P1': r.p1_count,
    'Jumlah P2': r.p2_count,
    'Jumlah P3': r.p3_count,
    'Jumlah P4': r.p4_count,
    'Total Tiang Telkom': r.tiang_telkom_total,
    'Total Tiang PLN': r.tiang_pln_total,
  }));
  const wsRekap = XLSX.utils.json_to_sheet(rekapData);
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap Kecamatan');

  // Sheet 4: Top 30
  const top30 = [...surveys]
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((s, idx) => ({
      Ranking: idx + 1,
      'Nama Jalan': s.nama_jalan,
      Kecamatan: s.kecamatan,
      'Kelas Jalan': s.kelas_jalan,
      'Panjang (m)': s.panjang_m,
      Score: s.score,
      Prioritas: s.prioritas,
      'Status Verifikasi': s.status_verifikasi,
      'Kepadatan Kabel': s.kepadatan_kabel,
      'Kelayakan Ducting': s.kelayakan_ducting,
      'Total Tiang': (s.jumlah_tiang_telkom || 0) + (s.jumlah_tiang_pln_pju || 0),
    }));
  const wsTop30 = XLSX.utils.json_to_sheet(top30);
  XLSX.utils.book_append_sheet(wb, wsTop30, 'Top 30');

  // Sheet 5: Metodologi & Bobot
  const bobotData = [
    { Kriteria: 'Kepadatan Kabel', Bobot: '25%', Keterangan: 'Skala 1-5 (Sangat Rendah - Sangat Tinggi)' },
    { Kriteria: 'Kelas Jalan', Bobot: '20%', Keterangan: 'Arteri (5), Kolektor Primer/Sekunder (4), Lokal (3), Lingkungan (2)' },
    { Kriteria: 'Kepadatan Kawasan', Bobot: '15%', Keterangan: 'Skala 1-5' },
    { Kriteria: 'Kepentingan Kawasan', Bobot: '15%', Keterangan: 'Skala 1-5 (Pariwisata/Pemerintahan/CBD)' },
    { Kriteria: 'Kondisi Kabel', Bobot: '10%', Keterangan: 'Skala 1-5 (Tingkat kesemrawutan & kendala fisik)' },
    { Kriteria: 'Potensi Jaringan', Bobot: '10%', Keterangan: 'Skala 1-5 (Kebutuhan bandwidth & ekspansi)' },
    { Kriteria: 'Kelayakan Ducting', Bobot: '5%', Keterangan: 'Skala 1-5 (Sangat Layak - Tidak Layak)' },
    { Kriteria: 'Kategori P1 (Sangat Urgent)', Bobot: 'Score >= 80', Keterangan: 'Penanganan Tahun Berjalan (Tahun 1)' },
    { Kriteria: 'Kategori P2 (Urgent)', Bobot: 'Score 60 - 79.9', Keterangan: 'Penanganan Tahun Ke-2' },
    { Kriteria: 'Kategori P3 (Menengah)', Bobot: 'Score 40 - 59.9', Keterangan: 'Penanganan Tahun Ke-3/4' },
    { Kriteria: 'Kategori P4 (Jangka Panjang)', Bobot: 'Score < 40', Keterangan: 'Penanganan Terjadwal Berkala' },
  ];
  const wsBobot = XLSX.utils.json_to_sheet(bobotData);
  XLSX.utils.book_append_sheet(wb, wsBobot, 'Metodologi & Bobot');

  // Trigger download
  XLSX.writeFile(wb, 'Makassar_Ducting_Kajian_Master.xlsx');
}

export function exportSurveyCsv(surveys: SurveyRecord[]): void {
  const csv = Papa.unparse(surveys);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Makassar_Survey_Final.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportFgdCsv(fgds: FgdRecord[]): void {
  const csv = Papa.unparse(fgds);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Makassar_FGD_Log.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadImportTemplate(): void {
  const templateColumns = [
    'kecamatan',
    'kelurahan',
    'nama_jalan',
    'latitude',
    'longitude',
    'panjang_m',
    'kelas_jalan',
    'kepadatan_kabel',
    'kepadatan_kawasan',
    'kepentingan_kawasan',
    'kondisi_kabel',
    'potensi_jaringan',
    'kelayakan_ducting',
    'hambatan',
    'jumlah_tiang_telkom',
    'jumlah_tiang_pln_pju',
    'trotoar',
    'drainase',
    'kawasan',
    'surveyor',
    'tanggal_survey',
    'catatan',
  ];

  const sampleRows = [
    {
      kecamatan: 'Panakkukang',
      kelurahan: 'Pandang',
      nama_jalan: 'Jl. Pengayoman',
      latitude: -5.1542,
      longitude: 119.4485,
      panjang_m: 1800,
      kelas_jalan: 'Kolektor Primer',
      kepadatan_kabel: 'Sangat Tinggi',
      kepadatan_kawasan: 'Sangat Tinggi',
      kepentingan_kawasan: 'Tinggi',
      kondisi_kabel: 'Tinggi',
      potensi_jaringan: 'Sangat Tinggi',
      kelayakan_ducting: 'Sangat Layak',
      hambatan: 'Kepadatan ruko toko komputer dan kafe',
      jumlah_tiang_telkom: 58,
      jumlah_tiang_pln_pju: 42,
      trotoar: 'Ada',
      drainase: 'Ada',
      kawasan: 'Komersial',
      surveyor: 'Desk Surveyor 1',
      tanggal_survey: '2026-08-30',
      catatan: 'Contoh pengisian data desk survey',
    },
    {
      kecamatan: 'Ujung Pandang',
      kelurahan: 'Sawerigading',
      nama_jalan: 'Jl. Haji Bau',
      latitude: -5.1481,
      longitude: 119.4102,
      panjang_m: 1200,
      kelas_jalan: 'Arteri Sekunder',
      kepadatan_kabel: 'Tinggi',
      kepadatan_kawasan: 'Sangat Tinggi',
      kepentingan_kawasan: 'Sangat Tinggi',
      kondisi_kabel: 'Sedang',
      potensi_jaringan: 'Tinggi',
      kelayakan_ducting: 'Sangat Layak',
      hambatan: 'Kawasan rumah dinas pejabat dan cagar budaya',
      jumlah_tiang_telkom: 40,
      jumlah_tiang_pln_pju: 30,
      trotoar: 'Ada',
      drainase: 'Ada',
      kawasan: 'Pemerintahan / VIP',
      surveyor: 'Desk Surveyor 2',
      tanggal_survey: '2026-08-30',
      catatan: 'Dekat Rujab Gubernur Sulsel',
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleRows, { header: templateColumns });
  
  // Set column widths
  ws['!cols'] = templateColumns.map(() => ({ wch: 22 }));

  XLSX.utils.book_append_sheet(wb, ws, 'DATA_GOOGLE_MAPS');
  XLSX.writeFile(wb, 'Template_Import_Desk_V4.xlsx');
}

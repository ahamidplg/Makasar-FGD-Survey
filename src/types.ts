export type TabType =
  | 'dashboard'
  | 'gis'
  | 'desk'
  | 'fgd1'
  | 'ground'
  | 'fgd2'
  | 'export';

export type KelasJalanType =
  | 'Arteri'
  | 'Arteri Primer'
  | 'Arteri Sekunder'
  | 'Kolektor Primer'
  | 'Kolektor Sekunder'
  | 'Lokal'
  | 'Jalan Lingkungan';

export type LevelType =
  | 'Sangat Tinggi'
  | 'Tinggi'
  | 'Sedang'
  | 'Rendah'
  | 'Sangat Rendah';

export type KelayakanType =
  | 'Sangat Layak'
  | 'Layak'
  | 'Cukup'
  | 'Kurang'
  | 'Tidak Layak';

export type PriorityType =
  | 'P1 - Sangat Urgent'
  | 'P2 - Urgent'
  | 'P3 - Menengah'
  | 'P4 - Jangka Panjang';

export type TrotoarDrainaseType = 'Ada' | 'Tidak Ada' | 'Tidak Terlihat';

export type StatusVerifikasiType =
  | 'Desk Only'
  | 'Ground Checked'
  | 'FGD-1 Validated'
  | 'FGD-2 Final Recommendation';

export interface SurveyRecord {
  id: string;
  kecamatan: string;
  kelurahan: string;
  nama_jalan: string;
  latitude: number;
  longitude: number;
  panjang_m: number;
  kelas_jalan: KelasJalanType | string;
  kepadatan_kabel: LevelType | string;
  kepadatan_kawasan: LevelType | string;
  kepentingan_kawasan: LevelType | string;
  kondisi_kabel: LevelType | string;
  potensi_jaringan: LevelType | string;
  kelayakan_ducting: KelayakanType | string;
  hambatan: string;
  jumlah_tiang_telkom: number;
  jumlah_tiang_pln_pju: number;
  trotoar: TrotoarDrainaseType | string;
  drainase: TrotoarDrainaseType | string;
  kawasan: string;
  sumber_data: string;
  status_verifikasi: StatusVerifikasiType | string;
  surveyor: string;
  tanggal_survey: string;
  catatan: string;
  score: number;
  prioritas: PriorityType | string;
  photo_path: string; // semicolon-separated or data URIs
}

export type FgdSessionType = 'FGD-1' | 'FGD-2';

export type FgdStatusType =
  | 'Open'
  | 'Validated'
  | 'Need Ground Check'
  | 'Rejected'
  | 'Final'
  | 'Need Revision'
  | 'Need Additional Survey';

export interface FgdRecord {
  id: string;
  session: FgdSessionType;
  tanggal: string;
  stakeholder: string;
  isu: string;
  koridor: string;
  keputusan: string;
  tindak_lanjut: string;
  status: FgdStatusType | string;
  catatan: string;
}

export interface RekapKecamatan {
  kecamatan: string;
  jumlah_ruas: number;
  panjang_km: number;
  score_rata2: number;
  p1_count: number;
  p2_count: number;
  p3_count: number;
  p4_count: number;
  tiang_telkom_total: number;
  tiang_pln_total: number;
}

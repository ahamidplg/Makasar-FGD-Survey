import {
  KelasJalanType,
  LevelType,
  KelayakanType,
  PriorityType,
  SurveyRecord,
} from '../types';

export const WEIGHTS = {
  kepadatan_kabel: 25,
  kelas_jalan: 20,
  kepadatan_kawasan: 15,
  kepentingan_kawasan: 15,
  kondisi_kabel: 10,
  potensi_jaringan: 10,
  kelayakan_ducting: 5,
} as const;

export const LEVEL_SCORES: Record<string, number> = {
  'Sangat Tinggi': 5,
  Tinggi: 4,
  Sedang: 3,
  Rendah: 2,
  'Sangat Rendah': 1,
  'Sangat Layak': 5,
  Layak: 4,
  Cukup: 3,
  Kurang: 2,
  'Tidak Layak': 1,
};

export const CLASS_SCORES: Record<string, number> = {
  Arteri: 5,
  'Arteri Primer': 5,
  'Arteri Sekunder': 5,
  'Kolektor Primer': 4,
  'Kolektor Sekunder': 4,
  Lokal: 3,
  'Jalan Lingkungan': 2,
};

export function calculateScore(
  record: Partial<
    Pick<
      SurveyRecord,
      | 'kelas_jalan'
      | 'kepadatan_kabel'
      | 'kepadatan_kawasan'
      | 'kepentingan_kawasan'
      | 'kondisi_kabel'
      | 'potensi_jaringan'
      | 'kelayakan_ducting'
    >
  >
): number {
  let total = 0;

  // kepadatan_kabel (w: 25)
  const kabelScore = LEVEL_SCORES[record.kepadatan_kabel || ''] || 0;
  total += (kabelScore / 5) * WEIGHTS.kepadatan_kabel;

  // kelas_jalan (w: 20)
  const jalanScore = CLASS_SCORES[record.kelas_jalan || ''] || 0;
  total += (jalanScore / 5) * WEIGHTS.kelas_jalan;

  // kepadatan_kawasan (w: 15)
  const kawasanScore = LEVEL_SCORES[record.kepadatan_kawasan || ''] || 0;
  total += (kawasanScore / 5) * WEIGHTS.kepadatan_kawasan;

  // kepentingan_kawasan (w: 15)
  const kepentinganScore = LEVEL_SCORES[record.kepentingan_kawasan || ''] || 0;
  total += (kepentinganScore / 5) * WEIGHTS.kepentingan_kawasan;

  // kondisi_kabel (w: 10)
  const kondisiScore = LEVEL_SCORES[record.kondisi_kabel || ''] || 0;
  total += (kondisiScore / 5) * WEIGHTS.kondisi_kabel;

  // potensi_jaringan (w: 10)
  const potensiScore = LEVEL_SCORES[record.potensi_jaringan || ''] || 0;
  total += (potensiScore / 5) * WEIGHTS.potensi_jaringan;

  // kelayakan_ducting (w: 5)
  const kelayakanScore = LEVEL_SCORES[record.kelayakan_ducting || ''] || 0;
  total += (kelayakanScore / 5) * WEIGHTS.kelayakan_ducting;

  return Math.round(total * 10) / 10;
}

export function getPriority(score: number): PriorityType {
  if (score >= 80) return 'P1 - Sangat Urgent';
  if (score >= 60) return 'P2 - Urgent';
  if (score >= 40) return 'P3 - Menengah';
  return 'P4 - Jangka Panjang';
}

export function getPriorityColor(priority: string | PriorityType): {
  bg: string;
  text: string;
  border: string;
  hex: string;
  badge: string;
} {
  if (priority.startsWith('P1')) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-300',
      hex: '#dc2626',
      badge: 'bg-red-600 text-white',
    };
  }
  if (priority.startsWith('P2')) {
    return {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-300',
      hex: '#ea580c',
      badge: 'bg-orange-500 text-white',
    };
  }
  if (priority.startsWith('P3')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      hex: '#d97706',
      badge: 'bg-amber-500 text-white',
    };
  }
  return {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    hex: '#16a34a',
    badge: 'bg-emerald-600 text-white',
  };
}

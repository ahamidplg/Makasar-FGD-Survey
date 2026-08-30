import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  User,
  Zap,
  Radio,
  CheckCircle2,
  Trash2,
  Edit3,
  Save,
  AlertTriangle,
  ExternalLink,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { SurveyRecord, KelasJalanType, LevelType, KelayakanType, TrotoarDrainaseType } from '../types';
import { calculateScore, getPriority, getPriorityColor, WEIGHTS } from '../utils/scoring';

interface SurveyDetailModalProps {
  survey: SurveyRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: SurveyRecord) => void;
  onDelete: (id: string) => void;
}

export const SurveyDetailModal: React.FC<SurveyDetailModalProps> = ({
  survey,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!isOpen || !survey) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SurveyRecord>({ ...survey });

  const handleFieldChange = (field: keyof SurveyRecord, value: any) => {
    const next = { ...formData, [field]: value };
    const nextScore = calculateScore(next);
    const nextPriority = getPriority(nextScore);
    next.score = nextScore;
    next.prioritas = nextPriority;
    setFormData(next);
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const prioColor = getPriorityColor(formData.prioritas);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg text-xs font-bold ${prioColor.badge}`}>
              {formData.prioritas}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {formData.nama_jalan}
              </h2>
              <p className="text-xs text-slate-400">
                Kec. {formData.kecamatan}, Kel. {formData.kelurahan || '-'} • ID: {formData.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 hover:text-sky-300 border border-slate-700 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Ruas</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* Score & Key Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs text-slate-500 font-medium">Score Akhir (Bobot)</div>
              <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1">
                {formData.score}
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Panjang Segmen</div>
              <div className="text-xl font-bold text-slate-900">
                {formData.panjang_m.toLocaleString('id-ID')} m
                <span className="text-xs text-slate-400 font-normal ml-1">
                  ({(formData.panjang_m / 1000).toFixed(2)} km)
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Tiang Telkom vs PLN</div>
              <div className="text-xl font-bold text-slate-900">
                {formData.jumlah_tiang_telkom} <span className="text-slate-400 text-xs font-normal">Tlk</span> / {formData.jumlah_tiang_pln_pju} <span className="text-slate-400 text-xs font-normal">PLN</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Status Verifikasi</div>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                {formData.status_verifikasi}
              </span>
            </div>
          </div>

          {/* Edit Form or Read View */}
          {isEditing ? (
            <div className="space-y-4 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
              <h3 className="text-xs font-bold tracking-wider uppercase text-indigo-900">
                Form Edit Parameter & Otomatis Hitung Ulang Score
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Jalan</label>
                  <input
                    type="text"
                    value={formData.nama_jalan}
                    onChange={(e) => handleFieldChange('nama_jalan', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={formData.kecamatan}
                    onChange={(e) => handleFieldChange('kecamatan', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelurahan</label>
                  <input
                    type="text"
                    value={formData.kelurahan}
                    onChange={(e) => handleFieldChange('kelurahan', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleFieldChange('latitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleFieldChange('longitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Panjang (meter)</label>
                  <input
                    type="number"
                    value={formData.panjang_m}
                    onChange={(e) => handleFieldChange('panjang_m', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 7 Scoring Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas Jalan <span className="text-indigo-600 font-bold">(Bobot 20%)</span>
                  </label>
                  <select
                    value={formData.kelas_jalan}
                    onChange={(e) => handleFieldChange('kelas_jalan', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Arteri Primer">Arteri Primer (5)</option>
                    <option value="Arteri Sekunder">Arteri Sekunder (5)</option>
                    <option value="Arteri">Arteri (5)</option>
                    <option value="Kolektor Primer">Kolektor Primer (4)</option>
                    <option value="Kolektor Sekunder">Kolektor Sekunder (4)</option>
                    <option value="Lokal">Lokal (3)</option>
                    <option value="Jalan Lingkungan">Jalan Lingkungan (2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kepadatan Kabel <span className="text-indigo-600 font-bold">(Bobot 25%)</span>
                  </label>
                  <select
                    value={formData.kepadatan_kabel}
                    onChange={(e) => handleFieldChange('kepadatan_kabel', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kepadatan Kawasan <span className="text-indigo-600 font-bold">(Bobot 15%)</span>
                  </label>
                  <select
                    value={formData.kepadatan_kawasan}
                    onChange={(e) => handleFieldChange('kepadatan_kawasan', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kepentingan Kawasan <span className="text-indigo-600 font-bold">(Bobot 15%)</span>
                  </label>
                  <select
                    value={formData.kepentingan_kawasan}
                    onChange={(e) => handleFieldChange('kepentingan_kawasan', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kondisi Kabel <span className="text-indigo-600 font-bold">(Bobot 10%)</span>
                  </label>
                  <select
                    value={formData.kondisi_kabel}
                    onChange={(e) => handleFieldChange('kondisi_kabel', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Potensi Jaringan <span className="text-indigo-600 font-bold">(Bobot 10%)</span>
                  </label>
                  <select
                    value={formData.potensi_jaringan}
                    onChange={(e) => handleFieldChange('potensi_jaringan', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelayakan Ducting <span className="text-indigo-600 font-bold">(Bobot 5%)</span>
                  </label>
                  <select
                    value={formData.kelayakan_ducting}
                    onChange={(e) => handleFieldChange('kelayakan_ducting', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {['Sangat Layak', 'Layak', 'Cukup', 'Kurang', 'Tidak Layak'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Verifikasi</label>
                  <select
                    value={formData.status_verifikasi}
                    onChange={(e) => handleFieldChange('status_verifikasi', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Desk Only">Desk Only</option>
                    <option value="Ground Checked">Ground Checked</option>
                    <option value="FGD-1 Validated">FGD-1 Validated</option>
                    <option value="FGD-2 Final Recommendation">FGD-2 Final Recommendation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Surveyor</label>
                  <input
                    type="text"
                    value={formData.surveyor}
                    onChange={(e) => handleFieldChange('surveyor', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan & Hambatan</label>
                <textarea
                  rows={2}
                  value={formData.catatan}
                  onChange={(e) => handleFieldChange('catatan', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Detailed parameters */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Parameter Penilaian & Bobot
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Kelas Jalan (20%)</span>
                    <span className="font-semibold text-slate-900">{formData.kelas_jalan}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Kepadatan Kabel (25%)</span>
                    <span className="font-semibold text-slate-900">{formData.kepadatan_kabel}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Kepadatan Kawasan (15%)</span>
                    <span className="font-semibold text-slate-900">{formData.kepadatan_kawasan}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Kepentingan Kawasan (15%)</span>
                    <span className="font-semibold text-slate-900">{formData.kepentingan_kawasan}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Kondisi Fisik Kabel (10%)</span>
                    <span className="font-semibold text-slate-900">{formData.kondisi_kabel}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Potensi Jaringan (10%)</span>
                    <span className="font-semibold text-slate-900">{formData.potensi_jaringan}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Kelayakan Ducting (5%)</span>
                    <span className="font-semibold text-slate-900">{formData.kelayakan_ducting}</span>
                  </div>
                </div>
              </div>

              {/* Physical & Field Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Kondisi Lapangan & Utilitas
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Jenis Kawasan</span>
                    <span className="font-semibold text-slate-900 text-right">{formData.kawasan || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Trotoar & Drainase</span>
                    <span className="font-semibold text-slate-900">
                      Trotoar: {formData.trotoar} • Drainase: {formData.drainase}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Koordinat GPS</span>
                    <span className="font-mono text-xs font-semibold text-indigo-700">
                      {formData.latitude}, {formData.longitude}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Surveyor & Tanggal</span>
                    <span className="font-semibold text-slate-900">
                      {formData.surveyor || '-'} ({formData.tanggal_survey || '-'})
                    </span>
                  </div>
                  <div className="py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 block text-xs">Hambatan Fisik:</span>
                    <span className="font-medium text-slate-800 text-xs mt-0.5 block">
                      {formData.hambatan || 'Tidak ada hambatan signifikan.'}
                    </span>
                  </div>
                  <div className="py-1.5">
                    <span className="text-slate-600 block text-xs">Catatan Lapangan:</span>
                    <span className="font-medium text-slate-800 text-xs mt-0.5 block italic">
                      "{formData.catatan || 'Tidak ada catatan khusus.'}"
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Photo Gallery if Available */}
          {formData.photo_path && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dokumentasi Lapangan / Foto Survei
              </h4>
              <div className="flex flex-wrap gap-3">
                {formData.photo_path.split(';').map((url, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm max-w-xs group">
                    <img
                      src={url}
                      alt={`Dokumentasi ${formData.nama_jalan}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-900"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka Foto</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`Hapus ruas "${formData.nama_jalan}" dari data survey?`)) {
                onDelete(formData.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Ruas</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

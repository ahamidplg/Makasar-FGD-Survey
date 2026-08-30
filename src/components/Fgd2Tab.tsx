import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Trash2,
  Search,
  ArrowRight,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { FgdRecord, SurveyRecord, FgdStatusType } from '../types';
import { getPriorityColor } from '../utils/scoring';

interface Fgd2TabProps {
  surveys: SurveyRecord[];
  fgds: FgdRecord[];
  onSaveFgd: (fgd: FgdRecord) => void;
  onDeleteFgd: (id: string) => void;
  onUpdateSurveyStatus?: (corridorName: string, status: string) => void;
}

export const Fgd2Tab: React.FC<Fgd2TabProps> = ({
  surveys,
  fgds,
  onSaveFgd,
  onDeleteFgd,
  onUpdateSurveyStatus,
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState<string>(
    surveys.length > 0 ? surveys[0].nama_jalan : ''
  );
  const [tanggal, setTanggal] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [stakeholder, setStakeholder] = useState<string>('');
  const [isu, setIsu] = useState<string>('');
  const [keputusan, setKeputusan] = useState<string>('');
  const [tindakLanjut, setTindakLanjut] = useState<string>('');
  const [status, setStatus] = useState<FgdStatusType>('Final');
  const [catatan, setCatatan] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected corridor details
  const currentCorridorRecord = surveys.find((s) => s.nama_jalan === selectedCorridor);

  // Filter FGD-2 records only
  const fgd2Records = fgds.filter((f) => f.session === 'FGD-2');

  const filteredFgd2 = fgd2Records.filter((f) => {
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchK = (f.koridor || '').toLowerCase().includes(q);
      const matchS = (f.stakeholder || '').toLowerCase().includes(q);
      const matchI = (f.isu || '').toLowerCase().includes(q);
      const matchD = (f.keputusan || '').toLowerCase().includes(q);
      if (!matchK && !matchS && !matchI && !matchD) return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeholder.trim() || !selectedCorridor) {
      alert('Mohon pilih koridor dan isi nama stakeholder / instansi.');
      return;
    }

    const newRecord: FgdRecord = {
      id: `fgd2-${Date.now()}`,
      session: 'FGD-2',
      tanggal,
      stakeholder,
      isu,
      koridor: selectedCorridor,
      keputusan,
      tindak_lanjut: tindakLanjut,
      status,
      catatan,
    };

    onSaveFgd(newRecord);

    // If final, update survey status
    if (status === 'Final' && onUpdateSurveyStatus) {
      onUpdateSurveyStatus(selectedCorridor, 'FGD-2 Final Recommendation');
    }

    setIsu('');
    setKeputusan('');
    setTindakLanjut('');
    setCatatan('');
    alert('Catatan FGD-2 & Rekomendasi Final berhasil disimpan!');
  };

  const getStatusBadge = (st: string) => {
    if (st === 'Final') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (st === 'Need Revision') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (st === 'Need Additional Survey') {
      return 'bg-sky-100 text-sky-800 border-sky-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Tahap 4: Validasi Lapangan & Penetapan Rekomendasi Final</span>
        </div>
        <h2 className="text-xl font-bold text-white">🏛️ FGD-2 — Validasi Hasil Ground Check & Keputusan Final</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
          FGD-2 membandingkan hasil desk survey dengan temuan faktual ground check untuk menetapkan
          koridor prioritas pembangunan ducting terpadu, spesifikasi teknis subduct, dan kesiapan KPBU.
        </p>
      </div>

      {/* Selected Corridor Overview Card */}
      {currentCorridorRecord && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Koridor Terpilih untuk Pembahasan FGD-2:
            </span>
            <h3 className="text-base font-bold text-slate-900">{currentCorridorRecord.nama_jalan}</h3>
            <p className="text-xs text-slate-500">
              Kec. {currentCorridorRecord.kecamatan} • Panjang: {(currentCorridorRecord.panjang_m / 1000).toFixed(2)} km • Total Tiang: {(currentCorridorRecord.jumlah_tiang_telkom || 0) + (currentCorridorRecord.jumlah_tiang_pln_pju || 0)}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 block">Score Akhir</span>
              <span className="text-xl font-extrabold text-slate-900">{currentCorridorRecord.score}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Prioritas</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                  getPriorityColor(currentCorridorRecord.prioritas).badge
                }`}
              >
                {currentCorridorRecord.prioritas.split(' - ')[0]}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Status Lapangan</span>
              <span className="text-xs font-semibold text-indigo-700">
                {currentCorridorRecord.status_verifikasi}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-purple-600" />
          <h3 className="font-bold text-slate-900 text-sm">Formulir Rekomendasi Final Sesi FGD-2</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Koridor Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pilih Koridor / Ruas Jalan <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCorridor}
                onChange={(e) => setSelectedCorridor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500"
              >
                {surveys.map((s) => (
                  <option key={s.id} value={s.nama_jalan}>
                    {s.nama_jalan} (Score: {s.score} - {s.prioritas.split(' - ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal FGD */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Sesi FGD-2</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status Rekomendasi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Rekomendasi Final</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
              >
                <option value="Final">Final (Siap Masuk Dokumen Kajian Master)</option>
                <option value="Need Revision">Need Revision (Perlu Penyesuaian DED/Spesifikasi)</option>
                <option value="Need Additional Survey">Need Additional Survey (Butuh Data Tambahan)</option>
                <option value="Open">Open (Masih Dalam Pembahasan)</option>
              </select>
            </div>
          </div>

          {/* Stakeholder / Instansi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Stakeholder / Instansi Penyelenggara <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Bappeda Kota Makassar, Tim Ahli Smart City, Asosiasi Operator Telekomunikasi"
              value={stakeholder}
              onChange={(e) => setStakeholder(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Isu & Keputusan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Perubahan / Temuan Pasca Ground Check</label>
              <textarea
                rows={3}
                placeholder="Perbedaan jumlah tiang aktual, utilitas bawah tanah (PDAM/Gas) yang ditemukan, kondisi trotoar..."
                value={isu}
                onChange={(e) => setIsu(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Keputusan / Rekomendasi Final</label>
              <textarea
                rows={3}
                placeholder="Spesifikasi ducting (HDPE 4-way / Box Culvert), skema penertiban tiang bersama, estimasi waktu konstruksi..."
                value={keputusan}
                onChange={(e) => setKeputusan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Tindak Lanjut & Catatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tindak Lanjut Implementasi</label>
              <textarea
                rows={2}
                placeholder="Penyusunan Peraturan Walikota (Perwali), penyiapan lelang KPBU, sosialisasi cut-over ke operator..."
                value={tindakLanjut}
                onChange={(e) => setTindakLanjut(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan FGD-2</label>
              <textarea
                rows={2}
                placeholder="Catatan persetujuan bersama atau poin mitigasi risiko..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Rekomendasi FGD-2</span>
            </button>
          </div>
        </form>
      </div>

      {/* FGD-2 Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Riwayat Rekomendasi Final FGD-2 ({fgd2Records.length} Catatan)
            </h3>
          </div>

          {/* Search and Status filter */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari rekomendasi / koridor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="Final">Final</option>
              <option value="Need Revision">Need Revision</option>
              <option value="Need Additional Survey">Need Additional Survey</option>
              <option value="Open">Open</option>
            </select>
          </div>
        </div>

        {filteredFgd2.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada catatan rekomendasi final FGD-2 yang tersimpan atau sesuai filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Koridor / Ruas</th>
                  <th className="py-3 px-3">Stakeholder</th>
                  <th className="py-3 px-3">Temuan Lapangan</th>
                  <th className="py-3 px-3">Rekomendasi Final</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFgd2.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-500">
                      {item.tanggal}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs">
                      {item.koridor}
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs">{item.stakeholder}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs">
                      <div className="line-clamp-2">{item.isu}</div>
                    </td>
                    <td className="py-3 px-3 text-purple-950 font-medium max-w-xs">
                      <div className="line-clamp-2">{item.keputusan}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm('Hapus log FGD-2 ini?')) {
                            onDeleteFgd(item.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

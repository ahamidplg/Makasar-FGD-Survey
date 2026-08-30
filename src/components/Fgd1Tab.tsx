import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Save,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { FgdRecord, SurveyRecord, FgdStatusType } from '../types';

interface Fgd1TabProps {
  surveys: SurveyRecord[];
  fgds: FgdRecord[];
  onSaveFgd: (fgd: FgdRecord) => void;
  onDeleteFgd: (id: string) => void;
  onUpdateSurveyStatus?: (corridorName: string, status: string) => void;
}

export const Fgd1Tab: React.FC<Fgd1TabProps> = ({
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
  const [status, setStatus] = useState<FgdStatusType>('Validated');
  const [catatan, setCatatan] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter FGD-1 records only
  const fgd1Records = fgds.filter((f) => f.session === 'FGD-1');

  const filteredFgd1 = fgd1Records.filter((f) => {
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
      id: `fgd1-${Date.now()}`,
      session: 'FGD-1',
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

    // If validated, update survey status as well
    if (status === 'Validated' && onUpdateSurveyStatus) {
      onUpdateSurveyStatus(selectedCorridor, 'FGD-1 Validated');
    }

    // Reset form
    setIsu('');
    setKeputusan('');
    setTindakLanjut('');
    setCatatan('');
    alert('Catatan FGD-1 berhasil disimpan ke database!');
  };

  const getStatusBadge = (st: string) => {
    if (st === 'Validated') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (st === 'Need Ground Check') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (st === 'Rejected') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-sky-100 text-sky-800 border-sky-200';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>Tahap 2: Validasi Bersama Pemangku Kepentingan</span>
        </div>
        <h2 className="text-xl font-bold text-white">🏛️ FGD-1 — Validasi Baseline & Kesepakatan Awal</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
          Gunakan FGD-1 untuk memvalidasi data desk survey, menyaring isu strategis, dan menentukan
          kandidat koridor utama bersama Dinas PU, Diskominfo, APJATEL, Telkom, PLN, dan Balai Jalan.
        </p>
      </div>

      {/* Form Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Formulir Pencatatan Sesi FGD-1</h3>
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
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
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Sesi FGD-1</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Validasi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Validasi</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Validated">Validated (Disetujui Masuk Tahap Lapangan)</option>
                <option value="Need Ground Check">Need Ground Check (Perlu Cek Khusus)</option>
                <option value="Open">Open (Masih Diskusi)</option>
                <option value="Rejected">Rejected (Ditolak / Ditunda)</option>
              </select>
            </div>
          </div>

          {/* Stakeholder / Instansi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Stakeholder / Instansi Terkait <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Dinas PU Kota Makassar, APJATEL Sulsel, PT Telkom Witel Sulsel, PLN UID Sulselrabar"
              value={stakeholder}
              onChange={(e) => setStakeholder(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Isu & Keputusan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Isu / Temuan Utama</label>
              <textarea
                rows={3}
                placeholder="Deskripsikan kepadatan kabel, utilitas lain (PDAM/Gas), keluhan masyarakat, atau kendala regulasi..."
                value={isu}
                onChange={(e) => setIsu(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Keputusan / Kesepakatan Validasi</label>
              <textarea
                rows={3}
                placeholder="Rangkuman hasil keputusan forum, urgensi penanganan, dan komitmen operator..."
                value={keputusan}
                onChange={(e) => setKeputusan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tindak Lanjut & Catatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rencana Tindak Lanjut</label>
              <textarea
                rows={2}
                placeholder="Jadwal ground check bersama, survei utilitas tanah, pengumpulan data tiang eksisting..."
                value={tindakLanjut}
                onChange={(e) => setTindakLanjut(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
              <textarea
                rows={2}
                placeholder="Catatan khusus notulensi atau arahan pimpinan rapat..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Catatan FGD-1</span>
            </button>
          </div>
        </form>
      </div>

      {/* FGD-1 Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Riwayat Notulensi & Validasi FGD-1 ({fgd1Records.length} Catatan)
            </h3>
          </div>

          {/* Search and Status filter */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari isu / koridor..."
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
              <option value="Validated">Validated</option>
              <option value="Need Ground Check">Need Ground Check</option>
              <option value="Open">Open</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredFgd1.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada catatan FGD-1 yang tersimpan atau sesuai filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Koridor / Ruas</th>
                  <th className="py-3 px-3">Stakeholder</th>
                  <th className="py-3 px-3">Isu / Temuan</th>
                  <th className="py-3 px-3">Keputusan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFgd1.map((item) => (
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
                    <td className="py-3 px-3 text-slate-800 font-medium max-w-xs">
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
                          if (confirm('Hapus log FGD-1 ini?')) {
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

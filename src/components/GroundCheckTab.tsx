import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Camera,
  Navigation,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Zap,
  Radio,
  Image as ImageIcon,
  X,
  Upload,
} from 'lucide-react';
import { SurveyRecord, KelasJalanType, LevelType, KelayakanType, TrotoarDrainaseType } from '../types';
import { calculateScore, getPriority, getPriorityColor, WEIGHTS } from '../utils/scoring';

interface GroundCheckTabProps {
  surveys: SurveyRecord[];
  onSaveGroundCheck: (record: SurveyRecord) => void;
  presetLat?: number | null;
  presetLng?: number | null;
}

export const GroundCheckTab: React.FC<GroundCheckTabProps> = ({
  surveys,
  onSaveGroundCheck,
  presetLat,
  presetLng,
}) => {
  const [selectedExistingId, setSelectedExistingId] = useState<string>('NEW');

  const [kecamatan, setKecamatan] = useState('Panakkukang');
  const [kelurahan, setKelurahan] = useState('Pandang');
  const [namaJalan, setNamaJalan] = useState('');
  const [latitude, setLatitude] = useState<number>(-5.1477);
  const [longitude, setLongitude] = useState<number>(119.4327);
  const [panjangM, setPanjangM] = useState<number>(500);

  const [kelasJalan, setKelasJalan] = useState<KelasJalanType>('Arteri Sekunder');
  const [kepadatanKabel, setKepadatanKabel] = useState<LevelType>('Sangat Tinggi');
  const [kepadatanKawasan, setKepadatanKawasan] = useState<LevelType>('Sangat Tinggi');
  const [kepentinganKawasan, setKepentinganKawasan] = useState<LevelType>('Sangat Tinggi');
  const [kondisiKabel, setKondisiKabel] = useState<LevelType>('Tinggi');
  const [potensiJaringan, setPotensiJaringan] = useState<LevelType>('Sangat Tinggi');
  const [kelayakanDucting, setKelayakanDucting] = useState<KelayakanType>('Sangat Layak');

  const [tiangTelkom, setTiangTelkom] = useState<number>(12);
  const [tiangPln, setTiangPln] = useState<number>(8);
  const [trotoar, setTrotoar] = useState<TrotoarDrainaseType>('Ada');
  const [drainase, setDrainase] = useState<TrotoarDrainaseType>('Ada');
  const [kawasan, setKawasan] = useState('Komersial / Pusat Bisnis');
  const [hambatan, setHambatan] = useState('Kabel optik menumpuk pada tiang sudut persimpangan');
  const [surveyor, setSurveyor] = useState('Tim Lapangan Ground Check');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [catatan, setCatatan] = useState('Hasil survei fisik lapangan terverifikasi.');

  const [photos, setPhotos] = useState<string[]>([]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Set preset coordinates if passed from GIS map picker
  useEffect(() => {
    if (typeof presetLat === 'number' && typeof presetLng === 'number') {
      setLatitude(presetLat);
      setLongitude(presetLng);
    }
  }, [presetLat, presetLng]);

  // Handle choosing existing road to populate
  const handleSelectExisting = (id: string) => {
    setSelectedExistingId(id);
    if (id === 'NEW') {
      setNamaJalan('');
      setPhotos([]);
      return;
    }
    const found = surveys.find((s) => s.id === id);
    if (found) {
      setKecamatan(found.kecamatan || 'Panakkukang');
      setKelurahan(found.kelurahan || '');
      setNamaJalan(found.nama_jalan || '');
      setLatitude(found.latitude || -5.1477);
      setLongitude(found.longitude || 119.4327);
      setPanjangM(found.panjang_m || 500);
      setKelasJalan((found.kelas_jalan as any) || 'Arteri Sekunder');
      setKepadatanKabel((found.kepadatan_kabel as any) || 'Tinggi');
      setKepadatanKawasan((found.kepadatan_kawasan as any) || 'Tinggi');
      setKepentinganKawasan((found.kepentingan_kawasan as any) || 'Tinggi');
      setKondisiKabel((found.kondisi_kabel as any) || 'Sedang');
      setPotensiJaringan((found.potensi_jaringan as any) || 'Tinggi');
      setKelayakanDucting((found.kelayakan_ducting as any) || 'Layak');
      setTiangTelkom(found.jumlah_tiang_telkom || 0);
      setTiangPln(found.jumlah_tiang_pln_pju || 0);
      setTrotoar((found.trotoar as any) || 'Ada');
      setDrainase((found.drainase as any) || 'Ada');
      setKawasan(found.kawasan || '');
      setHambatan(found.hambatan || '');
      setCatatan(found.catatan || '');
      if (found.photo_path) {
        setPhotos(found.photo_path.split(';').filter(Boolean));
      } else {
        setPhotos([]);
      }
    }
  };

  // Real-time score calculation
  const currentScore = calculateScore({
    kelas_jalan: kelasJalan,
    kepadatan_kabel: kepadatanKabel,
    kepadatan_kawasan: kepadatanKawasan,
    kepentingan_kawasan: kepentinganKawasan,
    kondisi_kabel: kondisiKabel,
    potensi_jaringan: potensiJaringan,
    kelayakan_ducting: kelayakanDucting,
  });
  const currentPriority = getPriority(currentScore);
  const prioColor = getPriorityColor(currentPriority);

  // GPS Acquisition
  const handleGetGps = () => {
    if (!navigator.geolocation) {
      alert('Perangkat/browser Anda tidak mendukung Geolocation.');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingGps(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
      },
      (err) => {
        setIsGettingGps(false);
        alert(`Gagal mengambil titik GPS: ${err.message}. Koordinat Makassar dipertahankan.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((f: File) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPhotos((prev) => [...prev, evt.target!.result as string]);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaJalan.trim()) {
      alert('Mohon isi nama ruas jalan.');
      return;
    }

    const id = selectedExistingId !== 'NEW' ? selectedExistingId : `gc-${Date.now()}`;

    const record: SurveyRecord = {
      id,
      kecamatan,
      kelurahan,
      nama_jalan: namaJalan,
      latitude,
      longitude,
      panjang_m: Number(panjangM) || 500,
      kelas_jalan: kelasJalan,
      kepadatan_kabel: kepadatanKabel,
      kepadatan_kawasan: kepadatanKawasan,
      kepentingan_kawasan: kepentinganKawasan,
      kondisi_kabel: kondisiKabel,
      potensi_jaringan: potensiJaringan,
      kelayakan_ducting: kelayakanDucting,
      hambatan,
      jumlah_tiang_telkom: Number(tiangTelkom) || 0,
      jumlah_tiang_pln_pju: Number(tiangPln) || 0,
      trotoar,
      drainase,
      kawasan,
      sumber_data: 'Ground Check',
      status_verifikasi: 'Ground Checked',
      surveyor,
      tanggal_survey: tanggal,
      catatan,
      score: currentScore,
      prioritas: currentPriority,
      photo_path: photos.join(';'),
    };

    onSaveGroundCheck(record);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
    alert(`Hasil Ground Check berhasil disimpan! Prioritas: ${currentPriority} (Score: ${currentScore})`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
          <Navigation className="w-3.5 h-3.5" />
          <span>Tahap 3: Ground Check & Verifikasi Lapangan</span>
        </div>
        <h2 className="text-xl font-bold text-white">📍 Ground Check — Survei Lapangan, GPS & Foto</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
          Lakukan verifikasi faktual kondisi tiang, kabel udara melorot, trotoar, dan hambatan bawah tanah.
          Nilai skor terhitung otomatis secara real-time saat Anda mengisi formulir.
        </p>
      </div>

      {/* Main Layout: Form (Left) & Real-Time Score Widget (Right) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: 2 Cols on Large */}
        <div className="lg:col-span-2 space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs">
          {/* Target Selection: Update existing desk survey or create new */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-1">
              Pilih Ruas Yang Akan Diverifikasi Lapangan:
            </label>
            <select
              value={selectedExistingId}
              onChange={(e) => handleSelectExisting(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
            >
              <option value="NEW">+ Tambah Ruas Survei Lapangan Baru</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  [Update] {s.nama_jalan} (Kec. {s.kecamatan} • Status: {s.status_verifikasi})
                </option>
              ))}
            </select>
          </div>

          {/* Location & Segment Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              1. Lokasi & Identitas Segmen Jalan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Jalan / Segmen *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jl. AP Pettarani Segmen II"
                  value={namaJalan}
                  onChange={(e) => setNamaJalan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kecamatan *</label>
                <input
                  type="text"
                  list="mks-kecamatans"
                  required
                  placeholder="Panakkukang, Ujung Pandang, dll"
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
                <datalist id="mks-kecamatans">
                  <option value="Panakkukang" />
                  <option value="Ujung Pandang" />
                  <option value="Rappocini" />
                  <option value="Mariso" />
                  <option value="Mamajang" />
                  <option value="Makassar" />
                  <option value="Wajo" />
                  <option value="Bontoala" />
                  <option value="Tamalanrea" />
                  <option value="Biringkanaya" />
                  <option value="Tamalate" />
                  <option value="Manggala" />
                  <option value="Tallo" />
                </datalist>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelurahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Losari, Pandang"
                  value={kelurahan}
                  onChange={(e) => setKelurahan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* GPS & Panjang */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Latitude</label>
                  <button
                    type="button"
                    onClick={handleGetGps}
                    disabled={isGettingGps}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{isGettingGps ? 'Mencari...' : 'GPS Auto'}</span>
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Longitude</label>
                  {gpsAccuracy && (
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Akurasi ±{gpsAccuracy}m
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Panjang Segmen (meter)</label>
                <input
                  type="number"
                  value={panjangM}
                  onChange={(e) => setPanjangM(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 7 Scoring Parameters */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>2. Parameter Penilaian Multi-Kriteria (Scoring)</span>
              <span className="text-[11px] text-indigo-600 font-normal">7 Kriteria Terbobot</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kelas Jalan <span className="text-indigo-600 font-bold">(Bobot 20%)</span>
                </label>
                <select
                  value={kelasJalan}
                  onChange={(e) => setKelasJalan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Kepadatan Kabel <span className="text-indigo-600 font-bold">(Bobot 25%)</span>
                </label>
                <select
                  value={kepadatanKabel}
                  onChange={(e) => setKepadatanKabel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
                >
                  <option value="Sangat Tinggi">Sangat Tinggi (&gt;30 tarikan kabel)</option>
                  <option value="Tinggi">Tinggi (20 - 30 tarikan kabel)</option>
                  <option value="Sedang">Sedang (10 - 20 tarikan kabel)</option>
                  <option value="Rendah">Rendah (5 - 10 tarikan kabel)</option>
                  <option value="Sangat Rendah">Sangat Rendah (&lt;5 tarikan kabel)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kepadatan Kawasan <span className="text-indigo-600 font-bold">(Bobot 15%)</span>
                </label>
                <select
                  value={kepadatanKawasan}
                  onChange={(e) => setKepadatanKawasan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kepentingan Kawasan <span className="text-indigo-600 font-bold">(15%)</span>
                </label>
                <select
                  value={kepentinganKawasan}
                  onChange={(e) => setKepentinganKawasan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kondisi Kabel Fisik <span className="text-indigo-600 font-bold">(10%)</span>
                </label>
                <select
                  value={kondisiKabel}
                  onChange={(e) => setKondisiKabel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'].map((opt) => (
                    <option key={opt} value={opt}>{opt} (Semrawut/Melorot)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Potensi Jaringan <span className="text-indigo-600 font-bold">(10%)</span>
                </label>
                <select
                  value={potensiJaringan}
                  onChange={(e) => setPotensiJaringan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kelayakan Ducting <span className="text-indigo-600 font-bold">(5%)</span>
                </label>
                <select
                  value={kelayakanDucting}
                  onChange={(e) => setKelayakanDucting(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {['Sangat Layak', 'Layak', 'Cukup', 'Kurang', 'Tidak Layak'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Physical Utilites & Surveyor */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              3. Inventarisasi Tiang & Utilitas Ruas
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiang Telekomunikasi (FO)</label>
                <input
                  type="number"
                  min="0"
                  value={tiangTelkom}
                  onChange={(e) => setTiangTelkom(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiang PLN / PJU</label>
                <input
                  type="number"
                  min="0"
                  value={tiangPln}
                  onChange={(e) => setTiangPln(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trotoar Pejalan Kaki</label>
                <select
                  value={trotoar}
                  onChange={(e) => setTrotoar(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Ada">Ada</option>
                  <option value="Tidak Ada">Tidak Ada</option>
                  <option value="Tidak Terlihat">Tidak Terlihat</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Saluran Drainase</label>
                <select
                  value={drainase}
                  onChange={(e) => setDrainase(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Ada">Ada</option>
                  <option value="Tidak Ada">Tidak Ada</option>
                  <option value="Tidak Terlihat">Tidak Terlihat</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Karakteristik Kawasan</label>
                <input
                  type="text"
                  placeholder="Komersial / Pariwisata / Pemerintahan / Hunian"
                  value={kawasan}
                  onChange={(e) => setKawasan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hambatan Fisik Lapangan</label>
                <input
                  type="text"
                  placeholder="Akar pohon, utilitas pipa PDAM eksisting, jembatan, dll"
                  value={hambatan}
                  onChange={(e) => setHambatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Surveyor Lapangan</label>
                <input
                  type="text"
                  value={surveyor}
                  onChange={(e) => setSurveyor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Survei Fisik</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Khusus Lapangan</label>
              <textarea
                rows={2}
                placeholder="Rekomendasi teknis jenis ducting atau catatan span kabel..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Field Photos Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>4. Foto Dokumentasi Lapangan (GPS Tagged)</span>
              </span>
              <span className="text-[11px] text-slate-500">{photos.length} Foto Terlampir</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="file"
                id="photo-field-upload"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <label
                htmlFor="photo-field-upload"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer flex items-center gap-2 border border-slate-300"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih / Ambil Foto Lapangan</span>
              </label>
            </div>

            {/* Photo preview list */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {photos.map((src, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={src} alt="Foto lapangan" className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Card: Real-Time Score Engine & Priority Card */}
        <div className="space-y-4">
          <div className="sticky top-24 bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">Kalkulator Bobot Real-Time</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                Formula V4
              </span>
            </div>

            {/* Score Display Card */}
            <div className={`p-4 rounded-xl border ${prioColor.border} ${prioColor.bg} text-center space-y-2`}>
              <span className="text-xs font-bold text-slate-600 block">Indeks Prioritas Ducting</span>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {currentScore}
                <span className="text-xs font-normal text-slate-500 ml-1">/ 100</span>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${prioColor.badge}`}>
                {currentPriority}
              </div>
            </div>

            {/* Parameter Contribution Bars */}
            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Kepadatan Kabel (25%)</span>
                <span className="font-bold text-slate-900">{kepadatanKabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Kelas Jalan (20%)</span>
                <span className="font-bold text-slate-900">{kelasJalan}</span>
              </div>
              <div className="flex justify-between">
                <span>Kepadatan Kawasan (15%)</span>
                <span className="font-bold text-slate-900">{kepadatanKawasan}</span>
              </div>
              <div className="flex justify-between">
                <span>Kepentingan Kawasan (15%)</span>
                <span className="font-bold text-slate-900">{kepentinganKawasan}</span>
              </div>
              <div className="flex justify-between">
                <span>Kondisi Kabel (10%)</span>
                <span className="font-bold text-slate-900">{kondisiKabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Potensi Jaringan (10%)</span>
                <span className="font-bold text-slate-900">{potensiJaringan}</span>
              </div>
              <div className="flex justify-between">
                <span>Kelayakan Ducting (5%)</span>
                <span className="font-bold text-slate-900">{kelayakanDucting}</span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Hasil Ground Check</span>
            </button>

            {savedSuccess && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-1.5 justify-center">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Berhasil tersimpan ke database!</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

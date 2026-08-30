# Makassar Ducting Survey V4 — FGD Edition

Sistem Informasi Survei Terpadu, Scoring Prioritas, dan Penataan Kabel Udara Bawah Tanah (Sistem Saluran Utilitas Terpadu / SJUT / Ducting Bersama) untuk Pemerintah Kota Makassar.

Aplikasi ini dirancang untuk mendigitalisasi dan mengotomatisasi seluruh siklus kajian dan penataan kabel udara di Kota Makassar, mulai dari telaah data sekunder (*Desk Survey*), penyerapan aspirasi operator (*FGD-1*), verifikasi lapangan terinci (*Ground Check*), penetapan skema implementasi (*FGD-2*), hingga ekspor dokumen teknis master (*Final Export*).

---

## 📋 Daftar Isi
1. [Akses Login & Manajemen Peran Pengguna](#-akses-login--manajemen-peran-pengguna)
2. [Fitur Utama](#-fitur-utama)
3. [Tahapan Metodologi Survei](#-tahapan-metodologi-survei)
4. [Formula Pembobotan & Scoring Prioritas](#-formula-pembobotan--scoring-prioritas)
5. [Tech Stack](#-tech-stack)
6. [Struktur Proyek](#-struktur-proyek)
7. [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
8. [Format Data & Ekspor](#-format-data--ekspor)

---

## 🔐 Akses Login & Manajemen Akun (Admin & Surveyor)

Sistem dilengkapi dengan **Portal Akses Otentikasi** khusus untuk 2 jenis akun penugasan resmi:

| Peran (Role) | Nama Pengguna Resmi | Email Kedinasan | Kata Sandi | Lingkup Hak Akses & Tanggung Jawab |
|:---|:---|:---|:---:|:---|
| **Administrator** | A Hamid S.Si | `admin@makassar.go.id` | `admin` | Akses penuh seluruh modul (Dashboard, Desk Survey, FGD-1, Ground Check, FGD-2, dan Final Master Export), verifikasi scoring, modifikasi bobot, impor data, dan kelola dataset. |
| **Surveyor Lapangan** | Andi Rahmat Hidayat | `surveyor@makassar.go.id` | `surveyor` | Khusus input survei fisik lapangan (Ground Check), verifikasi tiang utilitas, geotagging GPS, dan dokumentasi foto kondisi kabel eksisting. |

> 💡 **Registrasi & Pergantian Akun**: Pengguna dapat mendaftarkan akun surveyor/admin baru melalui menu **+ Buat Akun** pada halaman login atau beralih akun kapan saja melalui menu profil di bilah navigasi atas (*Navbar*).

---

## 🌟 Fitur Utama

### 1. **Executive Dashboard & Analytics**
- **Metrik Utama Real-time**: Total panjang koridor (km), jumlah titik tiang utilitas, persentase ruas prioritas tinggi (P1 & P2), dan estimasi CAPEX/OPEX penataan ducting.
- **Grafik Interaktif (Recharts)**: Distribusi tingkat keruwetan kabel, distribusi kategori fungsi jalan (Protokol, Kolektor, Wisata, Komersial), dan perbandingan skor prioritas antar kecamatan.
- **Tabel Filter & Pencarian Cepat**: Filter berdasarkan status prioritas (P1, P2, P3, P4), status FGD, dan kata kunci nama jalan / kecamatan.

### 2. **Peta GIS Interaktif (Leaflet Engine)**
- Visualisasi spasial ruas koridor jalan di Kota Makassar (Pusat Kota, Losari, Panakkukang, Pettarani, dll.).
- Penanda (*markers*) titik tiang utilitas beserta status kekusutan kabel, kondisi trotoar, dan kapasitas ducting.
- Pewarnaan otomatis rute jalan berdasarkan kategori prioritas penataan (P1 = Merah, P2 = Jingga/Kuning, P3 = Biru, P4 = Hijau/Abu-abu).
- Modal detail interaktif untuk melihat profil ruas jalan langsung dari peta.

### 3. **Modul Desk Survey (Tahap 1)**
- Pencatatan awal data koridor: Panjang jalan, lebar ruas, fungsi jalan, estimasi tiang, dan perkiraan operator terpasang.
- Import data massal melalui file CSV/Excel atau input formulir manual.
- Reset instan ke 15 koridor baseline Kota Makassar (Jl. AP Pettarani, Jl. Penghibur, Jl. Somba Opu, Jl. Hertasning, dll.).

### 4. **Modul FGD-1: Aspirasi & Verifikasi Operator (Tahap 2)**
- Pencatatan notulensi dan daftar hadir stakeholder (APJATEL, Telkom, PLN, Kokek Konsulting).
- Matriks dukungan operator per ruas jalan (kesiapan migrasi ke kabel tanah).
- Penilaian kendala teknis dan administrasi dari sudut pandang penyedia layanan jaringan.

### 5. **Modul Ground Check: Verifikasi Lapangan (Tahap 3)**
- Formulir survei lapangan komprehensif:
  - Jumlah kabel crossing & sag (lendutan kabel rendah).
  - Kondisi tiang miring/kelebihan beban (*pole overload*).
  - Ketersediaan ruang utilitas (trotoar, bahu jalan, drainase box culvert).
  - Geotagging koordinat GPS & dokumentasi foto kondisi eksisting.

### 6. **Modul FGD-2: Finalisasi & Skema Pembiayaan (Tahap 4)**
- Penetapan skema implementasi: KPBU (Kerjasama Pemerintah dan Badan Usaha), BUMD, APBD Kota Makassar, atau Sewa Slot Ducting Terpadu.
- Rekomendasi metode konstruksi (*Open Trench*, *HDD / Horizontal Directional Drilling*, *Micro-trenching*).
- Penandatanganan berita acara kesepakatan penataan.

### 7. **Final Master Export**
- **Multi-Sheet Excel (.xlsx)**: Menggabungkan Master Ruas Jalan, Log FGD-1, Hasil Ground Check, Notulensi FGD-2, dan Ringkasan Anggaran dalam satu workbook.
- **Ekspor CSV**: Format standar untuk interoperabilitas dengan software GIS (QGIS / ArcGIS).
- **Print / PDF Layout**: Template laporan kajian ringkas siap cetak untuk pimpinan instansi / stakeholder.

---

## 🔄 Tahapan Metodologi Survei

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐     ┌──────────────────┐
│ 1. Desk Survey  │ ──> │  2. FGD - 1  │ ──> │ 3. Ground Check  │ ──> │  4. FGD - 2  │ ──> │ 5. Final Export  │
│  (Data Spasial  │     │  (Validasi   │     │  (Verifikasi Lap.│     │  (Finalisasi │     │  (Dokumen Master │
│   & Sekunder)   │     │   Operator)  │     │   & Foto GPS)    │     │   & Skema)   │     │   & Rekomendasi) │
└─────────────────┘     └──────────────┘     └──────────────────┘     └──────────────┘     └──────────────────┘
```

1. **Tahap 1 — Desk Survey**: Pemetaan awal koridor target, inventarisasi data sekunder jalan, dan klasifikasi zona kawasan strategis Kota Makassar.
2. **Tahap 2 — FGD-1**: Diskusi kelompok terarah bersama asosiasi APJATEL, PLN, dan instansi daerah untuk menyepakati koridor prioritas awal.
3. **Tahap 3 — Ground Check**: Tim surveyor diterjunkan ke lapangan dengan instrumen survei detail untuk mengukur tingkat kekusutan, menghitung tiang, dan memverifikasi lintasan utilitas bawah tanah.
4. **Tahap 4 — FGD-2**: Evaluasi hasil verifikasi lapangan, kesepakatan batas waktu penurunan kabel udara (*cut over*), dan penentuan skema tarif sewa ducting.
5. **Tahap 5 — Master Export**: Kompilasi final seluruh dataset ke dalam format laporan siap tindak lanjut bagi pengambil kebijakan.

---

## 🧮 Formula Pembobotan & Scoring Prioritas

Skor prioritas dihitung secara otomatis berbasis 7 indikator utama dengan bobot terstandardisasi:

| No | Parameter Penilaian | Bobot (%) | Kriteria Skor Tertinggi |
|:---|:-------------------|:---------:|:------------------------|
| 1  | **Tingkat Kekusutan & Bahaya Kabel** | 25% | Kabel sangat semrawut, menjuntai <3 meter, tumpang tindih tinggi |
| 2  | **Nilai Estetika & Kawasan Strategis** | 20% | Kawasan wisata prioritas (Pantai Losari, CPI), cagar budaya, pusat bisnis |
| 3  | **Kepadatan Jaringan & Jumlah Tiang** | 15% | Jumlah tiang >50 per km, terdapat >25 tarikan kabel operator berbeda |
| 4  | **Volume Lalu Lintas & Hirarki Jalan** | 15% | Jalan Arteri Primer / Kolektor Utama dengan V/C ratio tinggi |
| 5  | **Kesiapan Ruang Utilitas / Trotoar** | 10% | Lebar trotoar memadai (>1.5 m) atau sudah memiliki jalur box culvert |
| 6  | **Tingkat Kesepakatan Operator (FGD)**| 10% | Mayoritas operator siap migrasi dan sewa slot ducting |
| 7  | **Kesiapan Dokumen & Anggaran** | 5% | DED siap, tersinkronisasi dengan program Dinas PU / Pemkot |

### Klasifikasi Prioritas:
- **P1 (Prioritas Sangat Tinggi — Skor ≥ 80)**: Koridor mendesak yang ditargetkan untuk *Pilot Project* dan penataan segera.
- **P2 (Prioritas Tinggi — Skor 65 - 79)**: Koridor utama tahap lanjutan penataan bertahap.
- **P3 (Prioritas Sedang — Skor 50 - 64)**: Koridor sekunder dan penghubung.
- **P4 (Prioritas Pemeliharaan — Skor < 50)**: Koridor lokal dengan kerapian kabel yang masih terkendali.

---

## 💻 Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **GIS & Visualisasi Spasial**: [Leaflet](https://leafletjs.com/)
- **Chart & Grafik Statistik**: [Recharts](https://recharts.org/)
- **Data Processing & Export**: [SheetJS (xlsx)](https://sheetjs.com/), [PapaParse](https://www.papaparse.com/)

---

## 📁 Struktur Proyek

```text
├── index.html                  # Entry point HTML & Meta tags
├── package.json                # Dependensi & script eksekusi
├── metadata.json               # Metadata & konfigurasi aplikasi AI Studio
├── src/
│   ├── main.tsx                # Bootstrap aplikasi React
│   ├── App.tsx                 # Root Component & State Management Terpadu
│   ├── index.css               # Global styling (Tailwind CSS v4)
│   ├── types.ts                # TypeScript interface & definisi tipe data survei
│   └── components/
│       ├── Navbar.tsx          # Navigasi utama, breadcrumbs alur, & reset sample
│       ├── DashboardTab.tsx    # Ringkasan analitik, grafik, & filter data ruas
│       ├── GisMapTab.tsx       # Peta spasial GIS interaktif Leaflet
│       ├── DeskSurveyTab.tsx   # Pengelolaan data awal koridor & import file
│       ├── Fgd1Tab.tsx         # Manajemen notulensi & voting stakeholder tahap 1
│       ├── GroundCheckTab.tsx  # Formulir verifikasi lapangan, GPS, & foto kondisi
│       ├── Fgd2Tab.tsx         # Notulensi penetapan skema & rekomendasi tahap 2
│       ├── FinalExportTab.tsx  # Ekspor Multi-sheet Excel, CSV, & ringkasan cetak
│       └── SurveyDetailModal.tsx # Modal detail & editor data lengkap per ruas jalan
└── README.md                   # Dokumentasi teknis sistem
```

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat
- Node.js versi 18 atau lebih baru
- npm, pnpm, atau yarn

### Langkah Instalasi
1. **Clone repository atau buka direktori proyek**:
   ```bash
   cd makassar-ducting-survey
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

4. **Build untuk produksi**:
   ```bash
   npm run build
   ```

---

## 📊 Format Data & Ekspor

Aplikasi mendukung format ekspor terintegrasi:
- **Excel (.xlsx)**: File hasil ekspor menyertakan sheet terpisah untuk `Master Ruas`, `Detail Scoring`, `Log FGD-1`, `Ground Check`, dan `Kesimpulan FGD-2`.
- **CSV (.csv)**: Kompatibel langsung untuk impor ke software GIS seperti QGIS, ArcGIS, atau Google Earth Pro.
- **Local Persistence**: Seluruh perubahan data, input survei baru, dan catatan FGD tersimpan otomatis di penyimpanan lokal browser (*LocalStorage*) sehingga aman saat me-refresh halaman.

---

## 🏛️ Instansi & Tim Pelaksana
- **Pemerintah Kota Makassar**
- **Kokek Konsulting**
- **Asosiasi Penyelenggara Jaringan Telekomunikasi (APJATEL) Sulselbarteng**
- **PT PLN (Persero) UID Sulselrabar**

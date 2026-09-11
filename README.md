# STAS RG Generator

<p align="center">
  <img src="public/assets/img/stas.png" height="70" alt="STAS RG Logo" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="public/assets/img/telu.png" height="70" alt="Telkom University Logo" />
</p>

<p align="center">
  <strong>Platform Internal Otomasi & Standardisasi Dokumen Proyek Riset STAS RG</strong><br>
  <em>Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) – Telkom University</em>
</p>

---

## 📌 Ringkasan Proyek (Overview)

**STAS RG Generator** adalah platform internal yang dirancang untuk mengorganisir, mengelola metadata, dan menghasilkan dokumen proyek riset yang terstandarisasi di lingkungan kelompok riset **Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) – Fakultas Ilmu Terapan, Telkom University**.

Aplikasi ini dibangun menggunakan arsitektur modern **Laravel 12 + Inertia.js (React) + Vite + Tailwind CSS + Framer Motion + Lucide React**.

---

## ✨ Fitur Utama (Features)

1. **🎨 Contemporary SaaS & Strict Zero Shadows**:
   - **Strict Zero Shadows**: Tampilan modern tanpa bayangan (`box-shadow: none !important`), mengandalkan hierarki card ber-radius 24px (`rounded-3xl`), border presisi 1px (`border-zinc-200` / `border-emerald-200`), dan palet warna netral minimalis.
   - **Zero Emojis**: Menggunakan icon vektor SVG presisi (**Lucide React**) untuk tampilan profesional.
   - **Tipografi Editorial**: Menggunakan font **Plus Jakarta Sans** (Google Fonts) dengan spacing yang lega dan nyaman dibaca.

2. **🌓 Dark Mode & Light Mode**:
   - Dukungan tema Gelap (Dark Mode) dan Terang (Light Mode) dengan transisi halus.
   - Deteksi preferensi sistem otomatis (`prefers-color-scheme`) dan tersimpan permanen di `localStorage`.

3. **🌐 Dukungan Multi-Bahasa (i18n) & Flag Switcher**:
   - Penggantian bahasa instan antara **Bahasa Indonesia (ID)** dan **English (EN)** melalui tombol bendera bersih tanpa teks.
   - Terintegrasi penuh ke seluruh bagian halaman (Navbar, Hero, About, Principles, How It Works, Internal Security, Footer, Privacy, dan Terms).

4. **🧭 Navigation & Active ScrollSpy**:
   - Menu navigasi berada di posisi tengah (**Centered Navigation**) dalam wadah *frosted pill*.
   - Indikator tautan aktif (**Active Link**) dinamis yang menyorot menu sesuai posisi scroll pengguna.

5. **📄 Halaman Kebijakan Privasi & Ketentuan Riset**:
   - **Kebijakan Privasi (`/privacy`)**: Informasi tata kelola data riset, enkripsi SSO, dan perlindungan arsip.
   - **Ketentuan Riset (`/terms`)**: Regulasi hak kekayaan intelektual (HKI), integritas akademik, dan standar templating CoE STAS-RG.
   - Menggunakan header navigasi dan footer yang konsisten dengan halaman utama.

6. **⚡ Komponen Interaktif**:
   - **Hero Section**: Modern SaaS Showcase Card dengan metrik live registry, verifikasi integritas, dan access tier.
   - **About Platform**: Ringkasan platform beserta 2 feature card terpadu (*Centralized Workspace* & *Standardized Outputs*).
   - **Operational Principles**: 3 kartu fase alur kerja (*Organized*, *Consistent*, *Efficient*).
   - **Sequential Protocol**: Panduan 3 langkah alur ekspor dokumen (*Create Project*, *Fill Information*, *Generate & Manage*).
   - **Internal Security & CTA**: Kartu modern login SSO terproteksi.
   - **Rich 3-Column Footer**: Informasi institusi, channel media sosial lab (GitHub, LinkedIn, Instagram, Web, Email), navigasi terpadu, dan kartu lokasi laboratorium Fakultas Ilmu Terapan Telkom University dengan tombol langsung ke Google Maps.

---

## 🛠️ Tech Stack

- **Backend**: [Laravel 12](https://laravel.com) (PHP 8.5+)
- **SPA Bridge**: [Inertia.js v3](https://inertiajs.com) (`@inertiajs/react`)
- **Frontend**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Bundler**: [Vite 8](https://vitejs.dev)
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Prasyarat Lingkungan
Pastikan telah terinstal:
- PHP >= 8.2 (Disarankan PHP 8.4 / 8.5)
- Composer >= 2.x
- Node.js >= 20.x & npm

### 2. Instalasi Dependensi
```bash
# Masuk ke direktori proyek
cd stasrg-generator

# Instal dependensi PHP
composer install

# Instal dependensi Node.js
npm install
```

### 3. Konfigurasi Environment
```bash
# Salin file environment jika belum ada
cp .env.example .env

# Generate Application Key
php artisan key:generate
```

### 4. Menjalankan Server Pengembangan (Dev Server)

Jalankan backend Laravel dan frontend Vite:

```bash
# Terminal 1 - Jalankan backend Laravel
php artisan serve

# Terminal 2 - Jalankan Vite Dev Server
npm run dev
```

Buka peramban di: **`http://localhost:8000`**

### 5. Kompilasi Produksi (Production Build)
```bash
npm run build
```

---

## 📂 Struktur Direktori Utama

```
stasrg-generator/
├── app/
│   └── Http/
│       └── Middleware/HandleInertiaRequests.php  # Middleware Inertia
├── docs/
│   └── design.md                                 # Dokumentasi Design System & UI Specs
├── public/
│   └── assets/
│       └── img/
│           ├── stas.png                          # Logo STAS RG
│           └── telu.png                          # Logo Telkom University
├── resources/
│   ├── css/
│   │   └── app.css                               # Konfigurasi Tailwind v4 & Strict Zero-Shadow rules
│   ├── js/
│   │   ├── Components/
│   │   │   ├── AboutSection.jsx                  # Komponen About Platform
│   │   │   ├── Footer.jsx                        # Komponen 3-Column Editorial Footer
│   │   │   ├── HeroSection.jsx                   # Komponen SaaS Hero & Metric Showcase
│   │   │   ├── HowItWorksSection.jsx             # Komponen Sequential Protocol
│   │   │   ├── InternalNoteBanner.jsx            # Komponen Security & Login CTA
│   │   │   ├── Navbar.jsx                        # Komponen Centered Navbar + Theme & Flag Toggle
│   │   │   └── PrinciplesSection.jsx             # Komponen Operational Principles
│   │   ├── Context/
│   │   │   └── AppContext.jsx                    # Context Provider Dark Mode & i18n
│   │   ├── Pages/
│   │   │   ├── Welcome.jsx                       # Root Inertia Landing Page
│   │   │   ├── Privacy.jsx                       # Halaman Kebijakan Privasi
│   │   │   └── Terms.jsx                         # Halaman Ketentuan Riset
│   │   ├── translations/
│   │   │   └── translations.js                   # Kamus Terjemahan ID & EN
│   │   └── app.jsx                               # Client Mount Entrypoint
│   └── views/
│       └── app.blade.php                         # Blade Root Template
├── routes/
│   └── web.php                                   # Routing Web Laravel (/, /privacy, /terms)
└── vite.config.js                                # Konfigurasi Vite & React Plugin
```

---

## 🔒 Lisensi & Hak Cipta

© 2025 **CoE STAS-RG – Fakultas Ilmu Terapan, Telkom University**. All rights reserved.
Akses sistem ini terbatas khusus untuk civitas akademik dan peneliti internal yang berwenang.

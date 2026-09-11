# STAS RG Generator — Design System & Landing Page Specification

Dokumentasi ini menjelaskan standar desain visual, tata letak, tipografi, palet warna, aturan komponen, dan perilaku animasi untuk **STAS RG Generator Landing Page** berbasis **Contemporary SaaS / Modern Editorial UI**.

---

## 1. Core Design Principles

1. **Strictly Zero Shadows (`*, ::before, ::after { box-shadow: none !important; }`)**:
    - Seluruh elemen antarmuka (Card, Button, Banner, Modal, Pill Badge) **tidak menggunakan box-shadow**.
    - Pemisahan kedalaman dan hierarki visual dicapai melalui **border 1px yang presisi (`border-zinc-200/80`, `border-emerald-200/70`, `border-zinc-800/80`)**, **sudut lengkung card 24px (`rounded-3xl`)**, dan **kontras latar belakang bernuansa halus (`bg-[#FAFAFA]`, `bg-white`, `bg-[#090D16]`)**.

2. **Contemporary SaaS Aesthetics**:
    - Spacing lega (*breathable layout*) dengan padding bagian `py-20` hingga `py-28`.
    - Navigasi floating frosted pill dengan rounded-full active states.
    - Card showcase metrik dengan ikon pastel dan tipografi bersih tanpa monospace berlebihan.

3. **Clean & Purposeful Hierarchy (No Redundant Badges)**:
    - Hindari penggunaan *pill badge* yang berlebihan atau berulang di setiap bagian antarmuka.
    - Pada halaman formulir dan autentikasi (seperti Login & Auth), antarmuka difokuskan langsung pada judul utama (`h1`/`h2`) yang bersih dan tegas tanpa badge mengambang jika tidak esensial.

4. **Strictly Zero Emojis / Emotes**:
    - Dilarang menggunakan emoji atau karakter emote pada antarmuka teks.
    - Semua representasi visual dan indikator status menggunakan icon vektor SVG bergaris presisi (**Lucide React**) dan bendera SVG kustom tanpa teks.

5. **Typography — Plus Jakarta Sans**:
    - Font primer: **Plus Jakarta Sans** (`sans-serif`), dimuat langsung dari Google Fonts.
    - Variasi bobot: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800).

6. **Dynamic Micro-Interactions (Framer Motion)**:
    - Transisi halus pada pemuatan awal (fade-in, staggered card reveals).
    - Efek interaksi hover berupa pergeseran border color dan elevasi mikro (`whileHover={{ y: -4 }}`).

---

## 2. Color Palette & Tokens

### Primary / Brand (Deep Forest & Emerald Greens)
- **Primary Brand**: `#0D5A34`
- **Primary Hover**: `#094226`
- **Accent Emerald**: `#10B981` (`emerald-500`) / `#059669` (`emerald-600`)
- **Subtle Mint Background**: `#ECFDF5` (`emerald-50`)
- **Subtle Mint Border**: `#A7F3D0` (`emerald-200`) / `#6EE7B7` (`emerald-300`)

### Neutral Grayscale (Light & Dark)
- **Light Mode Background**: `#FAFAFA` / `#FFFFFF`
- **Dark Mode Background**: `#090D16` / `#0D121F`
- **Dark Mode Surface & Card**: `#18181B` (zinc-900) / `#1E293B`
- **Dark Mode Card Border**: `border-zinc-800/80`
- **Text Main / Headings**: `#0F172A` (Light) / `#FFFFFF` & `#F8FAFC` (Dark)
- **Text Secondary / Muted**: `#52525B` (Light) / `#A1A1AA` (Dark)
- **Border Default**: `border-zinc-200/80` (Light) / `border-zinc-800/80` (Dark)

---

## 3. Komponen & Halaman

- **Navbar**: Centered navigation menu, flag switcher ID/EN, dark/light toggle, rounded-full CTA.
- **Hero Section**: Headline besar, sub-headline, tombol aksi rounded-full, dan SaaS metrics showcase card (24px radius).
- **About Platform**: 2 feature cards dengan benefit list terintegrasi.
- **Operational Principles**: 3 kartu proses (*Organized*, *Consistent*, *Efficient*).
- **Sequential Protocol**: 3 kartu tahapan alur dokumen.
- **Internal SSO CTA**: Banner otentikasi login terpusat.
- **Footer**: 3 kolom editorial (Brand & Socials, Navigasi, Lokasi Lab CoE STAS-RG FIT Telkom University).
- **Halaman Legal**: Kebijakan Privasi (`/privacy`) & Ketentuan Riset (`/terms`).
- **Halaman Autentikasi**:
  - **Login (`/login`)**: Desain form bersih tanpa pill badge, form email/username, password, Google OAuth, dan Passkey/Biometric WebAuthn.
  - **Register (`/register`)**: Pendaftaran user/peneliti dengan role selector, validasi kata sandi, dan persetujuan legal.
  - **Forgot Password (`/forgot-password`)**: Permintaan pemulihan & verifikasi 6-digit OTP email terintegrasi Mailpit.
  - **Reset Password (`/reset-password`)**: Pembaruan kata sandi baru terproteksi token.


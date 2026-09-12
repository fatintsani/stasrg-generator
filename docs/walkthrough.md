# Walkthrough — Custom Error Pages & Design System STASIKATOR

Custom Error Pages untuk sistem **STASIKATOR** telah berhasil dibuat dan diimplementasikan secara komprehensif, mencakup seluruh HTTP error codes yang umum dengan desain kontemporer yang konsisten dengan visual identity **CoE STAS-RG**.

---

## 1. Reusable Error Layout & Blade Templates

Dibuat master layout di [`resources/views/errors/layout.blade.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/views/errors/layout.blade.php) dengan spesifikasi:
- **Header**: Dual branding resmi STAS-RG dan Telkom University yang responsif.
- **Card Surface**: Center-focused card (`rounded-3xl`, border `1px solid #E2E8F0`, surface `#FFFFFF`).
- **Status Dot Badge**: Penanda visual `● HTTP [Code] • [Status Label]` dengan warna fungsional (*Success, Pending, Warning, Error, Info*).
- **Typography & Angka Error**: Angka error besar (`72px`, font-extrabold `Plus Jakarta Sans`) dengan judul tegas berbahasa Indonesia dan deskripsi ramah tanpa istilah teknis membingungkan.
- **Action Buttons**: Primary CTA berwarna Deep Forest Green `#0D5A34` dan Secondary CTA yang relevan dengan jenis error.
- **Footer**: Hak cipta institusi CoE STAS-RG FIT Telkom University serta kontak email lab resmi.
- **Self-Contained Styling**: Dilengkapi fallback CSS terenkapsulasi sehingga tetap tampil elegan bahkan jika aset eksternal bermasalah.

---

## 2. HTTP Error Code Matrix

| Error Code | File Blade Template | Status Badge | Judul | Deskripsi | Aksi Utama / Sekunder |
|---|---|---|---|---|---|
| **400** | [`400.blade.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/views/errors/400.blade.php) | `● HTTP 400 • Bad Request` | Permintaan Tidak Valid | Format permintaan data tidak dapat diproses server. | [ Coba Muat Ulang ] [ Kembali ke Beranda ] |
| **401** | [`401.blade.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/views/errors/401.blade.php) | `● HTTP 401 • Unauthorized` | Autentikasi Diperlukan | Sesi login Anda belum aktif atau telah berakhir. | [ Masuk ke Akun ] [ Kembali ke Beranda ] |
| **403** | [`403.blade.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/views/errors/403.blade.php) | `● HTTP 403 • Forbidden` | Akses Ditolak | Tidak memiliki otorisasi untuk membuka dokumen/menu ini. | [ Kembali ] [ Ke Dashboard ] |
| **404** | [`404.blade.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/views/errors/404.blade.php) | `● HTTP 404 • Not Found` | Halaman Tidak Ditemukan | Halaman atau spesifikasi riset tidak ditemukan/dipindahkan. | [ Kembali ke Beranda / Dashboard ] [ Kembali ] |
| **419** | [`419.blade.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/views/errors/419.blade.php) | `● HTTP 419 • Page Expired` | Sesi Halaman Kedaluwarsa | Token keamanan formulir telah berakhir demi keamanan data. | [ Segarkan Halaman ] [ Masuk Kembali ] |
| **429** | [`429.blade.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/views/errors/429.blade.php) | `● HTTP 429 • Too Many Requests` | Terlalu Banyak Permintaan | Frekuensi request melebihi batas rate limit sistem. | [ Coba Lagi Sekarang ] [ Kembali ke Beranda ] |
| **500** | [`500.blade.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/views/errors/500.blade.php) | `● HTTP 500 • Internal Server Error` | Kesalahan pada Server | Kendala teknis server lab tanpa membocorkan stack trace. | [ Coba Muat Ulang ] [ Kembali ke Beranda ] |
| **503** | [`503.blade.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/views/errors/503.blade.php) | `● HTTP 503 • Service Unavailable` | Layanan Pemeliharaan | Sistem sedang menjalani maintenance atau upgrade server. | [ Coba Muat Ulang ] [ Kunjungi Website STAS-RG ] |

---

## 3. Inertia SPA Error Component ([`Error.jsx`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/resources/js/Pages/Error.jsx))

- Komponen React terpadu untuk merender error ketika navigasi SPA Inertia menerima respons status HTTP error.
- Terhubung langsung melalui `$exceptions->respond(...)` pada [`bootstrap/app.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/bootstrap/app.php).
- Mendukung mode gelap/terang, micro-interactions, dan tombol navigasi dinamis.

---

## 4. Keamanan Informasi & Zero Leaks

- Pada error `500 Internal Server Error`, sistem **tidak membocorkan** stack trace, query database SQL, ataupun struktur path server internal kepada pengguna.
- Informasi disajikan secara elegan, profesional, dan ramah pengguna.

---

## 5. Dokumentasi Global Design System ([`design.md`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/design.md) & [`docs/design.md`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/docs/design.md))

Telah diperbarui dengan **Bagian 6: Custom Error Pages Specification** yang memuat standar layout, status badge, typography, action button, dan error matrix sebagai referensi baku sistem.

---

## 6. Hasil Pengujian & Verifikasi

1. **Automated Feature Test ([`ErrorPagesTest.php`](file:///d:/INTERN/STAS%20RG%20Generator%20Projects/stasrg-generator/tests/Feature/ErrorPagesTest.php))**:
   - `test_404_not_found_renders_custom_stasikator_error_page` — **PASSED**
   - `test_403_forbidden_renders_custom_error_page` — **PASSED**
   - `test_401_unauthorized_renders_custom_error_page` — **PASSED**
   - `test_400_bad_request_renders_custom_error_page` — **PASSED**
   - `test_419_page_expired_renders_custom_error_page` — **PASSED**
   - `test_429_too_many_requests_renders_custom_error_page` — **PASSED**
   - `test_500_internal_server_error_renders_clean_page_without_stack_traces` — **PASSED**
   - `test_503_service_unavailable_renders_custom_error_page` — **PASSED**
   - `test_inertia_request_on_error_returns_inertia_error_component` — **PASSED**
2. **Full PHPUnit Test Suite**:
   - **46 tests passed, 193 assertions, 0 errors** (100% lulus).
3. **Vite Production Build**:
   - `npm run build` sukses mengompilasi 2909 modul tanpa error.
4. **Code Quality**:
   - `vendor/bin/pint --format agent` dijalankan dan seluruh kode terformat rapi.

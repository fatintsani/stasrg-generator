<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $project->title ?? $project->name ?? 'Project Flyer' }}</title>
    @php
        $regularFontPath = public_path('assets/fonts/poppins/Poppins-Regular.ttf');
        $semiBoldFontPath = public_path('assets/fonts/poppins/Poppins-SemiBold.ttf');
        $boldFontPath = public_path('assets/fonts/poppins/Poppins-Bold.ttf');
        $extraBoldFontPath = public_path('assets/fonts/poppins/Poppins-ExtraBold.ttf');
        $italicFontPath = public_path('assets/fonts/poppins/Poppins-Italic.ttf');

        $fontRegularB64 = file_exists($regularFontPath) ? base64_encode(file_get_contents($regularFontPath)) : '';
        $fontSemiBoldB64 = file_exists($semiBoldFontPath) ? base64_encode(file_get_contents($semiBoldFontPath)) : '';
        $fontBoldB64 = file_exists($boldFontPath) ? base64_encode(file_get_contents($boldFontPath)) : '';
        $fontExtraBoldB64 = file_exists($extraBoldFontPath) ? base64_encode(file_get_contents($extraBoldFontPath)) : '';
        $fontItalicB64 = file_exists($italicFontPath) ? base64_encode(file_get_contents($italicFontPath)) : '';

        /*
         * ============================================
         * IKON — didesain ulang mengikuti gaya poster asli:
         * - MANFAAT   : ikon tangan polos, tanpa lingkaran latar
         * - SPESIFIKASI: kaca pembesar + gear, dengan outline lingkaran tipis
         * - PROBLEM-SOLUTION: bohlam putih di dalam lingkaran hijau solid
         * ============================================
         */
        $handSvg = 'data:image/svg+xml;base64,' . base64_encode('
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="19" fill="none" stroke="#0D5A34" stroke-width="1.6"/>
                <path d="M12 22 Q12 15 20 15 Q28 15 28 22" fill="none" stroke="#0D5A34" stroke-width="1.6"/>
                <path d="M9 24 C9 22 11 21 13 22 L20 25 L27 22 C29 21 31 22 31 24 C31 27 27 30 20 30 C13 30 9 27 9 24 Z" fill="#0D5A34"/>
                <circle cx="20" cy="12" r="3.2" fill="none" stroke="#0D5A34" stroke-width="1.6"/>
            </svg>');

        $gearSvg = 'data:image/svg+xml;base64,' . base64_encode('
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
                <circle cx="17" cy="17" r="9" fill="none" stroke="#0D5A34" stroke-width="1.6"/>
                <circle cx="17" cy="17" r="3" fill="none" stroke="#0D5A34" stroke-width="1.6"/>
                <line x1="23.5" y1="23.5" x2="31" y2="31" stroke="#0D5A34" stroke-width="2" stroke-linecap="round"/>
                <path d="M17 6 L18.3 9 L17 10.3 L15.7 9 Z" fill="#0D5A34"/>
                <path d="M28 17 L25 18.3 L23.7 17 L25 15.7 Z" fill="#0D5A34"/>
                <path d="M17 28 L15.7 25 L17 23.7 L18.3 25 Z" fill="#0D5A34"/>
                <path d="M6 17 L9 15.7 L10.3 17 L9 18.3 Z" fill="#0D5A34"/>
            </svg>');

        $bulbSvg = 'data:image/svg+xml;base64,' . base64_encode('
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="19" fill="#0D5A34"/>
                <path d="M20 8 C15 8 12 12 12 16 C12 19 13.5 21 15.5 22.5 L15.5 26 L24.5 26 L24.5 22.5 C26.5 21 28 19 28 16 C28 12 25 8 20 8 Z" fill="none" stroke="#ffffff" stroke-width="1.6"/>
                <line x1="16" y1="29" x2="24" y2="29" stroke="#ffffff" stroke-width="1.6"/>
                <line x1="17" y1="32" x2="23" y2="32" stroke="#ffffff" stroke-width="1.6"/>
            </svg>');

        $instagramSvg = 'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D5A34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>');
        $webSvg = 'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D5A34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>');
        $youtubeSvg = 'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D5A34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>');

        // Gambar dari controller (base64 data-uri, mis. "data:image/jpeg;base64,....")
        $mainImageB64 = $images['main_image'] ?? null;
        $partnerLogoB64 = $images['partner_logo'] ?? null;
        $stasLogoB64 = $images['stas_logo'] ?? null;
        $qrCodeB64 = $images['qr_code'] ?? null;

        /*
         * ============================================
         * VALIDASI GAMBAR UTAMA
         * Ini mencegah bug "gambar rusak/berulang seperti glitch" yang
         * muncul saat data base64 tidak valid / kosong / terlalu besar
         * tetap dipaksa dirender oleh renderer PDF.
         * Hanya render <img> jika data-uri memang gambar yang valid.
         * ============================================
         */
        $mainImageValid = false;
        if (!empty($mainImageB64) && is_string($mainImageB64)) {
            if (preg_match('#^data:image/(png|jpe?g|webp);base64,([A-Za-z0-9+/=\s]+)$#i', $mainImageB64, $m)) {
                $decoded = base64_decode($m[2], true);
                // getimagesizefromstring akan false jika data bukan gambar valid / korup
                if ($decoded !== false && @getimagesizefromstring($decoded) !== false) {
                    $mainImageValid = true;
                }
            }
        }
    @endphp
    <style>
        @if($fontRegularB64)
        @font-face { font-family: 'Poppins'; font-style: normal; font-weight: 400;
            src: url('data:font/truetype;charset=utf-8;base64,{{ $fontRegularB64 }}') format('truetype'); }
        @endif
        @if($fontItalicB64)
        @font-face { font-family: 'Poppins'; font-style: italic; font-weight: 400;
            src: url('data:font/truetype;charset=utf-8;base64,{{ $fontItalicB64 }}') format('truetype'); }
        @endif
        @if($fontSemiBoldB64)
        @font-face { font-family: 'Poppins'; font-style: normal; font-weight: 600;
            src: url('data:font/truetype;charset=utf-8;base64,{{ $fontSemiBoldB64 }}') format('truetype'); }
        @endif
        @if($fontBoldB64)
        @font-face { font-family: 'Poppins'; font-style: normal; font-weight: 700;
            src: url('data:font/truetype;charset=utf-8;base64,{{ $fontBoldB64 }}') format('truetype'); }
        @endif
        @if($fontExtraBoldB64)
        @font-face { font-family: 'Poppins'; font-style: normal; font-weight: 800;
            src: url('data:font/truetype;charset=utf-8;base64,{{ $fontExtraBoldB64 }}') format('truetype'); }
        @endif

        /* @page margin sengaja 0 — jarak halaman sepenuhnya diatur
           lewat margin pada .page di bawah (lihat penjelasan di sana),
           supaya hasilnya konsisten baik di preview browser/screenshot
           maupun saat benar-benar di-export ke PDF. */
        @page { size: A4 portrait; margin: 0; }

        * { box-sizing: border-box; margin: 0; padding: 0; overflow-wrap: break-word; word-break: break-word; }

        html, body {
            width: 100%;
            height: 100%;
            overflow-x: hidden;
        }

        body {
            font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
            color: #1a1a1a;
            font-size: 9.5pt;
            line-height: 1.45;
            background: #ffffff;
        }

        /* Pembungkus utama.
           PENTING: jarak kiri/kanan pakai MARGIN, bukan padding.
           Alasan: kombinasi width:100% + padding bergantung pada
           dukungan box-sizing:border-box, dan banyak PDF engine
           (dompdf, dsb.) tidak konsisten menerapkannya — akibatnya
           padding malah ditambahkan DI LUAR lebar 100%, membuat
           total lebar .page melebihi kertas A4 sehingga sisi kanan
           (termasuk QR code) terpotong saat dicetak ke PDF.
           Margin selalu dihitung di luar box, jadi width:calc(100% - 30mm)
           + margin kiri/kanan 15mm dijamin totalnya pas 100% lebar
           halaman, di mesin render manapun. */
        .page {
            width: calc(100% - 30mm);
            margin: 18mm 15mm 14mm 15mm;
            background: #ffffff;
        }

        .page img { max-width: 100%; }

        /* HEADER */
        .header-table { width: 100%; margin-bottom: 8px; border-collapse: collapse; }
        .header-table td { vertical-align: middle; }
        .logos-cell { text-align: right; }
        .logo-img { height: 34px; margin-left: 14px; display: inline-block; vertical-align: middle; }

        /* BADGE */
        .badge-container { margin-bottom: 8px; }
        .partner-badge {
            background-color: #0d5a34;
            color: #ffffff;
            font-family: 'Poppins', sans-serif;
            font-size: 9.5pt;
            font-weight: 600;
            padding: 5px 14px;
            border-radius: 2px;
            display: inline-block;
            letter-spacing: 0.2px;
        }

        /* TITLE — dibesarkan & dirapatkan agar sesuai poster asli */
        .title {
            font-family: 'Poppins', sans-serif;
            font-size: 25pt;
            font-weight: 800;
            color: #111827;
            letter-spacing: 0.2px;
            text-transform: uppercase;
            margin-bottom: 8px;
            line-height: 1.05;
        }

        .description {
            font-family: 'Poppins', sans-serif;
            font-size: 9.5pt;
            color: #374151;
            text-align: justify;
            margin-bottom: 12px;
            line-height: 1.5;
        }

        /* GAMBAR UTAMA */
        .main-image-wrapper {
            width: 100%;
            height: 205px;
            max-height: 205px;
            text-align: center;
            margin-bottom: 14px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            background-color: #f3f4f6;
        }
        .main-image {
            width: 100%;
            height: 205px;
            object-fit: cover;
            display: block;
        }
        /* Placeholder yang tampil rapi bila gambar tidak valid,
           menggantikan hasil "glitch" yang muncul sebelumnya */
        .main-image-placeholder {
            width: 100%;
            height: 205px;
            display: table;
            color: #9ca3af;
            font-size: 9pt;
            font-family: 'Poppins', sans-serif;
        }
        .main-image-placeholder span {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }

        /* SECTIONS */
        .sections-container { margin-bottom: 8px; }
        .section-item { margin-bottom: 12px; }
        .section-table { width: 100%; border-collapse: collapse; }
        .section-table td { vertical-align: top; }

        .icon-cell { width: 40px; padding-top: 2px; }
        .icon-img { width: 30px !important; height: 30px !important; }

        .content-cell { padding-left: 6px; }
        .section-title {
            font-family: 'Poppins', sans-serif;
            font-size: 11.5pt;
            font-weight: 800;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 4px;
        }
        .section-text {
            font-family: 'Poppins', sans-serif;
            font-size: 9.5pt;
            color: #374151;
            font-style: italic;
            line-height: 1.5;
            text-align: justify;
        }
        .section-text ul, .description ul { list-style-type: disc; margin-left: 14px; margin-top: 2px; margin-bottom: 2px; }
        .section-text ol, .description ol { list-style-type: decimal; margin-left: 14px; margin-top: 2px; margin-bottom: 2px; }
        .section-text li, .description li { margin-bottom: 2px; }
        .section-text p, .description p { margin: 0; padding: 0; }
        .section-text a, .description a { color: #0d5a34; text-decoration: underline; }

        .problem-solution-box { font-style: normal; }
        .problem-solution-box strong { color: #111827; font-style: italic; font-weight: 700; }
        .problem-solution-box div + div { margin-top: 6px; }

        /* FOOTER */
        .footer-divider { border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px; }
        .footer-table { width: 100%; border-collapse: collapse; }
        .footer-table td { vertical-align: middle; }
        .footer-left { width: 60%; }
        .footer-heading { font-family: 'Poppins', sans-serif; font-size: 8pt; color: #374151; font-weight: 600; margin-bottom: 6px; }

        .social-item {
            display: inline-table;
            vertical-align: middle;
            margin-right: 16px;
        }
        .social-icon-cell, .social-text-cell {
            display: table-cell;
            vertical-align: middle;
        }
        .social-icon-cell { padding-right: 5px; }
        .social-text-cell {
            font-family: 'Poppins', sans-serif;
            font-size: 8.5pt;
            color: #1f2937;
            font-weight: 600;
            white-space: nowrap;
        }
        .social-icon-img { width: 14px; height: 14px; display: block; }

        .footer-right { width: 40%; text-align: right; }
        .qr-wrapper { display: inline-block; text-align: right; }
        .qr-label {
            font-family: 'Poppins', sans-serif;
            font-size: 8pt;
            color: #374151;
            line-height: 1.3;
            display: inline-block;
            vertical-align: middle;
            text-align: right;
            margin-right: 12px;
            max-width: 105px;
            font-weight: 600;
        }
        .qr-image { width: 56px; height: 56px; display: inline-block; vertical-align: middle; border: 1px solid #d1d5db; padding: 2px; background: #ffffff; }

        .showcase-link-row {
            margin-top: 6px;
            padding-top: 5px;
            border-top: 1px dashed #e5e7eb;
            font-family: 'Poppins', sans-serif;
            font-size: 7pt;
            color: #6b7280;
            text-align: center;
        }
        .showcase-link-url { color: #0d5a34; font-weight: 700; text-decoration: underline; word-break: break-all; }
    </style>
</head>
<body>
<div class="page">

    {{-- HEADER --}}
    <table class="header-table">
        <tr>
            <td style="width: 30%;"></td>
            <td class="logos-cell" style="width: 70%;">
                @if($partnerLogoB64)
                    <img src="{{ $partnerLogoB64 }}" alt="Partner Logo" class="logo-img">
                @endif
                @if($stasLogoB64)
                    <img src="{{ $stasLogoB64 }}" alt="STAS RG" class="logo-img">
                @endif
            </td>
        </tr>
    </table>

    {{-- BADGE --}}
    @if(!empty($project->subtitle))
        <div class="badge-container">
            <div class="partner-badge">{{ $project->subtitle }}</div>
        </div>
    @endif

    {{-- TITLE --}}
    <div class="title">{{ $project->title ?? $project->name }}</div>

    {{-- DESCRIPTION --}}
    @if(!empty($project->description))
        <div class="description">{!! $project->description !!}</div>
    @endif

    {{-- GAMBAR UTAMA — dengan fallback aman --}}
    <div class="main-image-wrapper">
        @if($mainImageValid)
            <img src="{{ $mainImageB64 }}" alt="{{ $project->title }}" class="main-image">
        @else
            <div class="main-image-placeholder"><span>Gambar produk belum tersedia</span></div>
        @endif
    </div>

    {{-- SECTIONS --}}
    <div class="sections-container">

        {{-- MANFAAT --}}
        @php
            $benefits = is_array($project->benefits) ? $project->benefits : json_decode($project->benefits ?? '[]', true);
            $benefitsText = is_array($benefits) ? ($benefits['content'] ?? '') : $benefits;
            $benefitsTitle = is_array($benefits) ? ($benefits['title'] ?? 'MANFAAT') : 'MANFAAT';
        @endphp
        @if(!empty($benefitsText))
            <div class="section-item">
                <table class="section-table">
                    <tr>
                        <td class="icon-cell"><img src="{{ $handSvg }}" class="icon-img" alt="Manfaat"></td>
                        <td class="content-cell">
                            <div class="section-title">{{ $benefitsTitle }}</div>
                            <div class="section-text">{!! $benefitsText !!}</div>
                        </td>
                    </tr>
                </table>
            </div>
        @endif

        {{-- SPESIFIKASI --}}
        @php
            $specifications = is_array($project->specifications) ? $project->specifications : json_decode($project->specifications ?? '[]', true);
            $specsText = is_array($specifications) ? ($specifications['content'] ?? '') : $specifications;
            $specsTitle = is_array($specifications) ? ($specifications['title'] ?? 'SPESIFIKASI') : 'SPESIFIKASI';
        @endphp
        @if(!empty($specsText))
            <div class="section-item">
                <table class="section-table">
                    <tr>
                        <td class="icon-cell"><img src="{{ $gearSvg }}" class="icon-img" alt="Spesifikasi"></td>
                        <td class="content-cell">
                            <div class="section-title">{{ $specsTitle }}</div>
                            <div class="section-text">{!! $specsText !!}</div>
                        </td>
                    </tr>
                </table>
            </div>
        @endif

        {{-- PROBLEM - SOLUTION --}}
        @php
            $problemSolution = is_array($project->problem_solution) ? $project->problem_solution : json_decode($project->problem_solution ?? '[]', true);
            $problem = is_array($problemSolution) ? ($problemSolution['problem'] ?? '') : '';
            $solution = is_array($problemSolution) ? ($problemSolution['solution'] ?? '') : '';
            $psTitle = is_array($problemSolution) ? ($problemSolution['title'] ?? 'PROBLEM-SOLUTION') : 'PROBLEM-SOLUTION';
            $rawPs = is_string($problemSolution) ? $problemSolution : '';
        @endphp
        @if(!empty($problem) || !empty($solution) || !empty($rawPs))
            <div class="section-item">
                <table class="section-table">
                    <tr>
                        <td class="icon-cell"><img src="{{ $bulbSvg }}" class="icon-img" alt="Problem Solution"></td>
                        <td class="content-cell">
                            <div class="section-title">{{ $psTitle }}</div>
                            <div class="section-text problem-solution-box">
                                @if(!empty($problem))
                                    <div><strong>Problem :</strong> {!! $problem !!}</div>
                                @endif
                                @if(!empty($solution))
                                    <div><strong>Solution :</strong> {!! $solution !!}</div>
                                @endif
                                @if(!empty($rawPs) && empty($problem) && empty($solution))
                                    <div>{!! $rawPs !!}</div>
                                @endif
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        @endif

    </div>

    {{-- FOOTER --}}
    <div class="footer-divider">
        <table class="footer-table">
            <tr>
                <td class="footer-left">
                    <div class="footer-heading">Kunjungi platform resmi kami untuk informasi lengkap tentang CoE STAS-RG:</div>
                    <div>
                        <span class="social-item">
                            <span class="social-icon-cell"><img src="{{ $instagramSvg }}" class="social-icon-img" alt="Instagram"></span>
                            <span class="social-text-cell">{{ $project->footer_instagram ?: '@stas.rg' }}</span>
                        </span>
                        <span class="social-item">
                            <span class="social-icon-cell"><img src="{{ $webSvg }}" class="social-icon-img" alt="Website"></span>
                            <span class="social-text-cell">{{ $project->footer_website ?: 'tel-u.ac.id/stasrg' }}</span>
                        </span>
                        <span class="social-item">
                            <span class="social-icon-cell"><img src="{{ $youtubeSvg }}" class="social-icon-img" alt="YouTube"></span>
                            <span class="social-text-cell">{{ $project->footer_youtube ?: '@stas_rg' }}</span>
                        </span>
                    </div>
                </td>
                <td class="footer-right">
                    <div class="qr-wrapper">
                        <div class="qr-label">Pindai kode QR untuk Video Produk</div>
                        @if($qrCodeB64)
                            <img src="{{ $qrCodeB64 }}" alt="QR Code" class="qr-image">
                        @else
                            <div class="qr-image" style="line-height: 52px; text-align: center; font-size: 7pt; color: #9ca3af;">[QR]</div>
                        @endif
                    </div>
                </td>
            </tr>
        </table>

        @php $showcaseUrl = url('/showcase/' . ($project->slug ?? $project->id ?? 'detail')); @endphp
        <div class="showcase-link-row">
            Untuk informasi riset lebih lengkap & demonstrasi interaktif, kunjungi:
            <span class="showcase-link-url">{{ $showcaseUrl }}</span>
        </div>
    </div>

</div>
</body>
</html>

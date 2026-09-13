<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>STAS RG Projects — Platform Showcase Riset & Manajemen Dokumen</title>

    <!-- Favicon & Touch Icons -->
    <link rel="icon" type="image/png" href="{{ asset('assets/img/stas.png') }}">
    <link rel="shortcut icon" type="image/png" href="{{ asset('assets/img/stas.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('assets/img/stas.png') }}">

    <!-- SEO Meta Tags -->
    <meta name="description" content="STAS RG Projects — Platform publikasi riset, showcase inovasi, dan generator dokumen ilmiah resmi STAS Research Group Telkom University.">
    <meta name="keywords" content="STAS Research Group, Telkom University, Smart Agriculture, IoT, Research Showcase, RG Projects, Dokumen Ilmiah, Riset Indonesia">
    <meta name="author" content="STAS Research Group Telkom University">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#10b981">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="STAS RG">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="STAS RG Projects">
    <meta property="og:title" content="STAS RG Projects — Platform Showcase Riset & Manajemen Dokumen">
    <meta property="og:description" content="Platform publikasi riset, showcase inovasi, dan generator dokumen ilmiah resmi STAS Research Group Telkom University.">
    <meta property="og:image" content="{{ asset('assets/img/stas.png') }}">
    <meta property="og:url" content="{{ url()->current() }}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="STAS RG Projects — Platform Showcase Riset & Manajemen Dokumen">
    <meta name="twitter:description" content="Platform publikasi riset, showcase inovasi, dan generator dokumen ilmiah resmi STAS Research Group Telkom University.">
    <meta name="twitter:image" content="{{ asset('assets/img/stas.png') }}">

    <!-- Google Fonts: Plus Jakarta Sans & Poppins -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
    @inertiaHead
</head>

<body class="font-sans antialiased bg-[#FAFBFD] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
    @inertia
</body>

</html>
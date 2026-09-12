@extends('errors.layout')

@section('code', '503')
@section('title', 'Layanan Sedang Pemeliharaan')

@section('content')
    <div class="status-badge badge-503">
        <span class="badge-dot"></span>
        HTTP 503 • Service Unavailable
    </div>

    <div class="error-code">503</div>
    <h1 class="error-title">Layanan Sedang dalam Pemeliharaan</h1>
    
    <p class="error-description">
        Sistem STASIKATOR saat ini sedang menjalani proses pemeliharaan rutin atau peningkatan infrastruktur server. Kami akan segera kembali aktif dalam beberapa saat.
    </p>

    <div class="actions-wrapper">
        <button type="button" onclick="window.location.reload()" class="btn btn-primary">
            Coba Muat Ulang
        </button>
        
        <a href="https://tel-u.ac.id/stasrg" target="_blank" class="btn btn-secondary">
            Kunjungi Website STAS-RG
        </a>
    </div>

    <div class="info-pill">
        Laboratorium CoE STAS-RG • Fakultas Ilmu Terapan Telkom University.
    </div>
@endsection

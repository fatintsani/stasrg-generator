@extends('errors.layout')

@section('code', '500')
@section('title', 'Terjadi Kesalahan Server')

@section('content')
    <div class="status-badge badge-500">
        <span class="badge-dot"></span>
        HTTP 500 • Internal Server Error
    </div>

    <div class="error-code">500</div>
    <h1 class="error-title">Terjadi Kesalahan pada Server</h1>
    
    <p class="error-description">
        Sistem STASIKATOR mengalami kendala teknis saat memproses permintaan ini. Tim administrator dan engineer laboratorium telah mencatat aktivitas ini untuk segera ditangani.
    </p>

    <div class="actions-wrapper">
        <button type="button" onclick="window.location.reload()" class="btn btn-primary">
            Coba Muat Ulang
        </button>
        
        <a href="{{ url('/') }}" class="btn btn-secondary">
            Kembali ke Beranda
        </a>
    </div>

    <div class="info-pill">
        Jika masalah berlanjut, hubungi tim dukungan di stas.research@telkomuniversity.ac.id
    </div>
@endsection

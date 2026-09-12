@extends('errors.layout')

@section('code', '429')
@section('title', 'Terlalu Banyak Permintaan')

@section('content')
    <div class="status-badge badge-429">
        <span class="badge-dot"></span>
        HTTP 429 • Too Many Requests
    </div>

    <div class="error-code">429</div>
    <h1 class="error-title">Terlalu Banyak Permintaan</h1>
    
    <p class="error-description">
        Sistem mendeteksi frekuensi pengiriman permintaan yang terlalu tinggi dari jaringan Anda dalam waktu singkat. Silakan tunggu beberapa saat sebelum mencoba kembali.
    </p>

    <div class="actions-wrapper">
        <button type="button" onclick="window.location.reload()" class="btn btn-primary">
            Coba Lagi Sekarang
        </button>
        
        <a href="{{ url('/') }}" class="btn btn-secondary">
            Kembali ke Beranda
        </a>
    </div>

    <div class="info-pill">
        Mekanisme Rate Limiting aktif demi menjaga stabilitas performa sistem riset.
    </div>
@endsection

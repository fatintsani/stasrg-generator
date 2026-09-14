@extends('errors.layout')

@section('code', '429')
@section('title', 'Terlalu Banyak Permintaan')

@section('content')
    <img src="{{ asset('assets/img/icon/terlalubanyakpermintaan.png') }}" alt="Terlalu Banyak Permintaan" style="width: 120px; height: auto; margin: 0 auto 16px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.04));">
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

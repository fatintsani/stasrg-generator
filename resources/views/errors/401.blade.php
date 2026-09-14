@extends('errors.layout')

@section('code', '401')
@section('title', 'Autentikasi Diperlukan')

@section('content')
    <img src="{{ asset('assets/img/icon/autentikasi.png') }}" alt="Autentikasi Diperlukan" style="width: 120px; height: auto; margin: 0 auto 16px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.04));">
    <h1 class="error-title">Autentikasi Diperlukan</h1>
    
    <p class="error-description">
        Sesi login Anda belum aktif atau telah berakhir. Silakan masuk terlebih dahulu dengan akun resmi STAS-RG untuk melanjutkan.
    </p>

    <div class="actions-wrapper">
        <a href="{{ route('login') }}" class="btn btn-primary">
            Masuk ke Akun
        </a>
        
        <a href="{{ url('/') }}" class="btn btn-secondary">
            Kembali ke Beranda
        </a>
    </div>
@endsection

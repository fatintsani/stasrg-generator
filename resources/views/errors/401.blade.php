@extends('errors.layout')

@section('code', '401')
@section('title', 'Autentikasi Diperlukan')

@section('content')
    <div class="status-badge badge-401">
        <span class="badge-dot"></span>
        HTTP 401 • Unauthorized
    </div>

    <div class="error-code">401</div>
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

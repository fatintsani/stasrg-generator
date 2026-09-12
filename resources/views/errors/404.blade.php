@extends('errors.layout')

@section('code', '404')
@section('title', 'Halaman Tidak Ditemukan')

@section('content')
    <div class="status-badge badge-404">
        <span class="badge-dot"></span>
        HTTP 404 • Not Found
    </div>

    <div class="error-code">404</div>
    <h1 class="error-title">Halaman Tidak Ditemukan</h1>
    
    <p class="error-description">
        Halaman atau dokumen spesifikasi riset yang Anda tuju tidak ditemukan pada sistem repositori STASIKATOR atau mungkin telah dipindahkan.
    </p>

    <div class="actions-wrapper">
        @auth
            <a href="{{ route('dashboard') }}" class="btn btn-primary">
                Kembali ke Dashboard
            </a>
        @else
            <a href="{{ url('/') }}" class="btn btn-primary">
                Kembali ke Beranda
            </a>
        @endauth
        
        <button type="button" onclick="window.history.length > 1 ? window.history.back() : window.location.href='/'" class="btn btn-secondary">
            Kembali ke Halaman Sebelumnya
        </button>
    </div>
@endsection

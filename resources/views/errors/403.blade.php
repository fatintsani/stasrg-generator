@extends('errors.layout')

@section('code', '403')
@section('title', 'Akses Ditolak')

@section('content')
    <img src="{{ asset('assets/img/icon/aksesditolak.png') }}" alt="Akses Ditolak" style="width: 120px; height: auto; margin: 0 auto 16px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.04));">
    <h1 class="error-title">Akses Ditolak</h1>
    
    <p class="error-description">
        Mohon maaf, Anda tidak memiliki izin otorisasi atau hak akses yang memadai untuk membuka dokumen atau menu ini.
    </p>

    <div class="actions-wrapper">
        <button type="button" onclick="window.history.length > 1 ? window.history.back() : window.location.href='/'" class="btn btn-primary">
            Kembali
        </button>
        
        @auth
            <a href="{{ route('dashboard') }}" class="btn btn-secondary">
                Menuju Dashboard
            </a>
        @else
            <a href="{{ route('login') }}" class="btn btn-secondary">
                Masuk ke Akun
            </a>
        @endauth
    </div>

    <div class="info-pill">
        Hubungi administrator laboratorium jika Anda memerlukan otorisasi tambahan.
    </div>
@endsection

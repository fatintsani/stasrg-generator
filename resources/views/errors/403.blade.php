@extends('errors.layout')

@section('code', '403')
@section('title', 'Akses Ditolak')

@section('content')
    <div class="status-badge badge-403">
        <span class="badge-dot"></span>
        HTTP 403 • Forbidden
    </div>

    <div class="error-code">403</div>
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

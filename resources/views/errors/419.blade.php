@extends('errors.layout')

@section('code', '419')
@section('title', 'Sesi Halaman Kedaluwarsa')

@section('content')
    <div class="status-badge badge-419">
        <span class="badge-dot"></span>
        HTTP 419 • Page Expired
    </div>

    <div class="error-code">419</div>
    <h1 class="error-title">Sesi Halaman Telah Kedaluwarsa</h1>
    
    <p class="error-description">
        Token keamanan sesi formulir telah berakhir karena tidak ada aktivitas dalam beberapa waktu. Silakan segarkan halaman untuk melanjutkan.
    </p>

    <div class="actions-wrapper">
        <button type="button" onclick="window.location.reload()" class="btn btn-primary">
            Segarkan Halaman
        </button>
        
        <a href="{{ route('login') }}" class="btn btn-secondary">
            Masuk Kembali
        </a>
    </div>

    <div class="info-pill">
        Tindakan pengamanan otomatis untuk melindungi integritas data riset Anda.
    </div>
@endsection

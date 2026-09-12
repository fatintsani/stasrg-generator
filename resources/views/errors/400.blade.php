@extends('errors.layout')

@section('code', '400')
@section('title', 'Permintaan Tidak Valid')

@section('content')
    <div class="status-badge badge-400">
        <span class="badge-dot"></span>
        HTTP 400 • Bad Request
    </div>

    <div class="error-code">400</div>
    <h1 class="error-title">Permintaan Tidak Valid</h1>
    
    <p class="error-description">
        Format permintaan data atau parameter yang dikirimkan tidak dapat diproses oleh server sistem STASIKATOR.
    </p>

    <div class="actions-wrapper">
        <button type="button" onclick="window.location.reload()" class="btn btn-primary">
            Coba Muat Ulang
        </button>
        
        <a href="{{ url('/') }}" class="btn btn-secondary">
            Kembali ke Beranda
        </a>
    </div>
@endsection

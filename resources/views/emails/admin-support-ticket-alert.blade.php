@extends('emails.layouts.master')

@section('title', 'Notifikasi Tiket Bantuan Baru')
@section('header_subtitle', 'Alert Sistem Layanan Bantuan & Support')

@section('content')
    <h2 class="email-title">Pesan & Tiket Bantuan Baru Masuk</h2>
    <p class="email-subtitle">Pengunjung portal mengirimkan pesan baru yang memerlukan perhatian administrator.</p>

    <!-- Info Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Nomor Tiket</td>
                <td class="card-value"><strong style="color: #b91c1c; font-family: monospace; font-size: 15px;">#{{ $ticket->ticket_number }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Nama Pengirim</td>
                <td class="card-value"><strong>{{ $ticket->name }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Email Pengirim</td>
                <td class="card-value"><a href="mailto:{{ $ticket->email }}" style="color: #2563eb;">{{ $ticket->email }}</a></td>
            </tr>
            @if($ticket->phone)
            <tr>
                <td class="card-label">Nomor Telepon/WA</td>
                <td class="card-value">{{ $ticket->phone }}</td>
            </tr>
            @endif
            @if($ticket->affiliation)
            <tr>
                <td class="card-label">Institusi / Afiliasi</td>
                <td class="card-value">{{ $ticket->affiliation }}</td>
            </tr>
            @endif
            <tr>
                <td class="card-label">Kategori</td>
                <td class="card-value">{{ ucwords(str_replace('_', ' ', $ticket->category)) }}</td>
            </tr>
            <tr>
                <td class="card-label">Prioritas</td>
                <td class="card-value">
                    <span class="badge {{ $ticket->priority === 'urgent' ? 'badge-danger' : ($ticket->priority === 'high' ? 'badge-warning' : 'badge-primary') }}">
                        {{ strtoupper($ticket->priority) }}
                    </span>
                </td>
            </tr>
            <tr>
                <td class="card-label">Subjek</td>
                <td class="card-value"><strong>{{ $ticket->subject }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Waktu Masuk</td>
                <td class="card-value">{{ $ticket->created_at->translatedFormat('d F Y, H:i') }} WIB</td>
            </tr>
        </table>
    </div>

    <!-- Message Preview Box -->
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <div style="font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Isi Pesan Masuk:</div>
        <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-line;">{{ $ticket->message }}</p>
        @if($ticket->attachment_original_name)
            <div style="margin-top: 10px; font-size: 12px; color: #7f1d1d;">
                Ada Lampiran: <strong>{{ $ticket->attachment_original_name }}</strong>
            </div>
        @endif
    </div>

    <!-- Action Button -->
    <div class="button-wrapper">
        <a href="{{ $actionUrl ?? route('support-tickets.show', $ticket) }}" class="btn-primary" target="_blank">
            Buka & Balas Tiket di Panel Admin
        </a>
    </div>

    <div class="info-callout">
        Harap segera merespon tiket terutama jika berlabel prioritas <strong>HIGH</strong> atau <strong>URGENT</strong>.
    </div>
@endsection

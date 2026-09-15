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
                <td class="card-value"><strong style="color: #B91C1C; font-family: monospace; font-size: 14px;">#{{ $ticket->ticket_number }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Nama Pengirim</td>
                <td class="card-value"><strong>{{ $ticket->name }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Email Pengirim</td>
                <td class="card-value"><a href="mailto:{{ $ticket->email }}" style="color: #0AB600; text-decoration: none; word-break: break-all;">{{ $ticket->email }}</a></td>
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
                    <span class="badge {{ $ticket->priority === 'urgent' ? 'badge-error' : ($ticket->priority === 'high' ? 'badge-warning' : 'badge-info') }}">
                        <span class="badge-dot {{ $ticket->priority === 'urgent' ? 'badge-dot-error' : ($ticket->priority === 'high' ? 'badge-dot-warning' : 'badge-dot-info') }}"></span>
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
    <div class="message-box message-box-danger">
        <div style="font-size: 11px; font-weight: 700; color: #991B1B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Isi Pesan Masuk:</div>
        <p style="margin: 0; color: #1E293B; font-size: 13.5px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">{{ $ticket->message }}</p>
        @if($ticket->attachment_original_name)
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #FECACA; font-size: 12px; color: #7F1D1D;">
                Lampiran: <strong>{{ $ticket->attachment_original_name }}</strong>
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

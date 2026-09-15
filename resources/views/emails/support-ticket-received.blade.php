@extends('emails.layouts.master')

@section('title', 'Tiket Bantuan Telah Diterima')
@section('header_subtitle', 'Pusat Layanan & Dukungan CoE STAS-RG')

@section('content')
    <h2 class="email-title">Pesan & Tiket Bantuan Anda Telah Diterima</h2>
    <p class="email-subtitle">Terima kasih telah menghubungi Center of Excellence STAS-RG Telkom University.</p>

    <div class="greeting">
        Halo {{ $ticket->name }},
    </div>

    <p class="paragraph">
        Pesan atau permohonan dukungan Anda telah berhasil kami catat ke dalam sistem antrean layanan laboratorium dengan nomor referensi tiket resmi berikut:
    </p>

    <!-- Info Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Nomor Tiket</td>
                <td class="card-value"><strong style="color: #b91c1c; font-family: monospace; font-size: 15px;">#{{ $ticket->ticket_number }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Subjek Pesan</td>
                <td class="card-value"><strong>{{ $ticket->subject }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Kategori</td>
                <td class="card-value">{{ ucwords(str_replace('_', ' ', $ticket->category)) }}</td>
            </tr>
            <tr>
                <td class="card-label">Prioritas</td>
                <td class="card-value">
                    <span class="badge {{ in_array($ticket->priority, ['urgent', 'high']) ? 'badge-warning' : 'badge-primary' }}">
                        {{ strtoupper($ticket->priority) }}
                    </span>
                </td>
            </tr>
            @if($ticket->affiliation)
            <tr>
                <td class="card-label">Institusi / Afiliasi</td>
                <td class="card-value">{{ $ticket->affiliation }}</td>
            </tr>
            @endif
            <tr>
                <td class="card-label">Status Saat Ini</td>
                <td class="card-value">
                    <span class="badge badge-warning">
                        <span class="badge-dot badge-dot-warning"></span>
                        Dalam Antrean (Pending)
                    </span>
                </td>
            </tr>
            <tr>
                <td class="card-label">Waktu Pengajuan</td>
                <td class="card-value">{{ $ticket->created_at->translatedFormat('d F Y, H:i') }} WIB</td>
            </tr>
        </table>
    </div>

    <!-- Message Summary Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Ringkasan Pesan Anda:</div>
        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-line;">{{ $ticket->message }}</p>
        @if($ticket->attachment_original_name)
            <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
                📎 Lampiran: <strong>{{ $ticket->attachment_original_name }}</strong>
            </div>
        @endif
    </div>

    <p class="paragraph">
        Tim teknis dan administrator CoE STAS-RG akan meninjau dan merespon pesan Anda dalam waktu <strong>1x24 jam kerja</strong>. Balasan resmi akan dikirimkan langsung ke alamat email ini.
    </p>

    <div class="info-callout">
        Simpan nomor tiket <strong>#{{ $ticket->ticket_number }}</strong> untuk mempermudah pengecekan atau tindak lanjut lebih lanjut.
    </div>
@endsection

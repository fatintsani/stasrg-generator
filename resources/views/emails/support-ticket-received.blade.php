@extends('emails.layouts.master')

@section('title', 'Tiket Bantuan Telah Diterima #' . $ticket->ticket_number)
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
                <td class="card-value"><strong style="color: #0AB600; font-family: monospace; font-size: 15px;">#{{ $ticket->ticket_number }}</strong></td>
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
                    <span class="badge {{ in_array($ticket->priority, ['urgent', 'high']) ? 'badge-warning' : 'badge-info' }}">
                        <span class="badge-dot {{ in_array($ticket->priority, ['urgent', 'high']) ? 'badge-dot-warning' : 'badge-dot-info' }}"></span>
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
    <div class="message-box message-box-info">
        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Ringkasan Pesan Anda:</div>
        <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">{{ $ticket->message }}</p>
        @if($ticket->attachment_original_name)
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #E2E8F0; font-size: 12px; color: #64748B;">
                Lampiran: <strong>{{ $ticket->attachment_original_name }}</strong>
            </div>
        @endif
    </div>

    <!-- Direct Live Chat & Track CTA -->
    <div style="text-align: center; margin: 28px 0 20px 0;">
        <a href="{{ url('/support/ticket/' . $ticket->ticket_number . '?email=' . urlencode($ticket->email)) }}"
           style="display: inline-block; background-color: #0AB600; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(10, 182, 0, 0.35);">
            Buka Ruang Percakapan & Lacak Tiket &rarr;
        </a>
        <div style="margin-top: 8px; font-size: 11.5px; color: #64748B;">
            Klik tombol di atas untuk berkomunikasi langsung secara real-time dengan tim CoE STAS-RG.
        </div>
    </div>

    <p class="paragraph">
        Tim teknis dan administrator CoE STAS-RG akan meninjau dan merespon pesan Anda dalam waktu <strong>1x24 jam kerja</strong>. Anda dapat memantau atau membalas percakapan kapan saja melalui ruang chat tiket di atas.
    </p>

    <div class="info-callout">
        Simpan nomor tiket <strong>#{{ $ticket->ticket_number }}</strong> dan gunakan email <strong>{{ $ticket->email }}</strong> untuk verifikasi saat mengakses portal bantuan kami.
    </div>
@endsection

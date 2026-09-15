@extends('emails.layouts.master')

@section('title', 'Balasan Tiket Bantuan #' . $ticket->ticket_number)
@section('header_subtitle', 'Pusat Layanan & Dukungan CoE STAS-RG')

@section('content')
    <h2 class="email-title">Tanggapan Resmi Tim CoE STAS-RG</h2>
    <p class="email-subtitle">Tim kami telah meninjau dan mengirimkan tanggapan atas tiket bantuan Anda.</p>

    <div class="greeting">
        Halo {{ $ticket->name }},
    </div>

    <p class="paragraph">
        Berikut adalah tanggapan resmi dari Tim Administrator CoE STAS-RG Telkom University terkait tiket bantuan <strong>#{{ $ticket->ticket_number }}</strong> (<em>{{ $ticket->subject }}</em>):
    </p>

    <!-- Highlighted Admin Reply Box -->
    <div class="message-box message-box-success">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 10px; border-bottom: 1px solid #DCFCE7; padding-bottom: 8px;">
            <tr>
                <td align="left" style="font-size: 13px; font-weight: 700; color: #166534; vertical-align: middle;">
                    Balasan dari {{ $admin ? $admin->name : 'Tim Layanan STAS-RG' }}:
                </td>
                <td align="right" style="font-size: 11px; color: #15803D; vertical-align: middle; white-space: nowrap; padding-left: 8px;">
                    {{ $reply->created_at ? $reply->created_at->translatedFormat('d M Y, H:i') : now()->translatedFormat('d M Y, H:i') }} WIB
                </td>
            </tr>
        </table>
        <div style="color: #14532D; font-size: 13.5px; line-height: 1.65; white-space: pre-wrap; word-break: break-word;">
            {{ $reply->message }}
        </div>
        @if($reply->attachment_original_name)
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #86EFAC; font-size: 12px; color: #15803D;">
                Lampiran Berkas: <strong>{{ $reply->attachment_original_name }}</strong>
            </div>
        @endif
    </div>

    <!-- Direct Chat CTA -->
    <div style="text-align: center; margin: 24px 0 20px 0;">
        <a href="{{ url('/support/ticket/' . $ticket->ticket_number . '?email=' . urlencode($ticket->email)) }}"
           style="display: inline-block; background-color: #0AB600; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 26px; border-radius: 12px; box-shadow: 0 4px 14px rgba(10, 182, 0, 0.35);">
            Buka Ruang Chat & Balas Pesan &rarr;
        </a>
    </div>

    <!-- Ticket Summary Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Nomor Referensi</td>
                <td class="card-value"><strong style="color: #0AB600; font-family: monospace; font-size: 14px;">#{{ $ticket->ticket_number }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Status Tiket Terbaru</td>
                <td class="card-value">
                    @php
                        $statusClass = match ($ticket->status) {
                            'resolved' => 'badge-success',
                            'closed' => 'badge-error',
                            'in_progress' => 'badge-info',
                            default => 'badge-warning',
                        };
                        $statusDot = match ($ticket->status) {
                            'resolved' => 'badge-dot-success',
                            'closed' => 'badge-dot-error',
                            'in_progress' => 'badge-dot-info',
                            default => 'badge-dot-warning',
                        };
                        $statusLabel = match ($ticket->status) {
                            'resolved' => 'Selesai (Resolved)',
                            'closed' => 'Ditutup (Closed)',
                            'in_progress' => 'Sedang Diproses (In Progress)',
                            default => 'Menunggu (Pending)',
                        };
                    @endphp
                    <span class="badge {{ $statusClass }}">
                        <span class="badge-dot {{ $statusDot }}"></span>
                        {{ $statusLabel }}
                    </span>
                </td>
            </tr>
            <tr>
                <td class="card-label">Subjek Awal</td>
                <td class="card-value"><strong>{{ $ticket->subject }}</strong></td>
            </tr>
        </table>
    </div>

    <!-- Original Message Quote Box -->
    <div class="message-box message-box-info" style="margin-top: 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Pesan Awal Anda:</div>
        <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.55; font-style: italic; white-space: pre-wrap; word-break: break-word;">"{{ $ticket->message }}"</p>
    </div>

    <p class="paragraph">
        Jika Anda masih memiliki pertanyaan atau membutuhkan tindak lanjut lebih lanjut, Anda dapat langsung membalas di ruang chat tiket melalui tombol di atas.
    </p>

    <div class="info-callout">
        Center of Excellence for Smart Telecom, Aerospace & Security Research Group (CoE STAS-RG)<br>
        Telkom University, Bandung, Indonesia
    </div>
@endsection

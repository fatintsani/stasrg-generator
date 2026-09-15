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
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #dcfce7; padding-bottom: 8px;">
            <span style="font-size: 13px; font-weight: 700; color: #166534;">
                💬 Balasan dari {{ $admin ? $admin->name : 'Tim Layanan STAS-RG' }}:
            </span>
            <span style="font-size: 11px; color: #15803d;">
                {{ $reply->created_at ? $reply->created_at->translatedFormat('d M Y, H:i') : now()->translatedFormat('d M Y, H:i') }} WIB
            </span>
        </div>
        <div style="color: #14532d; font-size: 14px; line-height: 1.7; white-space: pre-line; font-weight: 400;">
            {{ $reply->message }}
        </div>
    </div>

    <!-- Ticket Summary Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Nomor Referensi</td>
                <td class="card-value"><strong style="color: #b91c1c; font-family: monospace;">#{{ $ticket->ticket_number }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Status Tiket Terbaru</td>
                <td class="card-value">
                    @php
                        $statusClass = match ($ticket->status) {
                            'resolved' => 'badge-success',
                            'closed' => 'badge-secondary',
                            'in_progress' => 'badge-primary',
                            default => 'badge-warning',
                        };
                        $statusLabel = match ($ticket->status) {
                            'resolved' => 'Selesai (Resolved)',
                            'closed' => 'Ditutup (Closed)',
                            'in_progress' => 'Sedang Diproses (In Progress)',
                            default => 'Menunggu (Pending)',
                        };
                    @endphp
                    <span class="badge {{ $statusClass }}">
                        {{ $statusLabel }}
                    </span>
                </td>
            </tr>
            <tr>
                <td class="card-label">Subjek Awal</td>
                <td class="card-value">{{ $ticket->subject }}</td>
            </tr>
        </table>
    </div>

    <!-- Original Message Collapsible/Quote Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 20px 0;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Pesan Asli Anda:</div>
        <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.5; font-style: italic; white-space: pre-line;">"{{ $ticket->message }}"</p>
    </div>

    <p class="paragraph">
        Jika Anda masih memiliki pertanyaan atau membutuhkan tindak lanjut lebih lanjut, Anda dapat membalas email ini secara langsung atau menghubungi kami kembali melalui portal resmi STAS-RG.
    </p>

    <div class="info-callout">
        Center of Excellence for Smart Telecom, Aerospace & Security Research Group (CoE STAS-RG)<br>
        Telkom University, Bandung, Indonesia
    </div>
@endsection

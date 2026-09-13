@extends('emails.layouts.master')

@section('content')
    <div class="badge-pill badge-pending">
        <span class="badge-dot"></span>
        <span>Menunggu Persetujuan Admin</span>
    </div>

    <h1>Pendaftaran Akun Berhasil</h1>

    <div class="greeting">
        Halo {{ $user->name }},
    </div>

    <p>
        Terima kasih telah mendaftar di <strong>STAS RG Projects Platform</strong>. Akun Anda telah berhasil dibuat dan saat ini sedang dalam proses review verifikasi oleh Tim Administrator Lab CoE STAS-RG.
    </p>

    <!-- Account Details Card -->
    <div class="info-card">
        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;">
            Rincian Akun Peneliti
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 12.5px;">
            <tr>
                <td style="padding: 4px 0; color: #64748B; width: 35%;">Nama Lengkap</td>
                <td style="padding: 4px 0; font-weight: 600; color: #0F172A;">{{ $user->name }}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0; color: #64748B;">Username</td>
                <td style="padding: 4px 0; font-weight: 600; color: #0F172A;">{{ '@' . ($user->username ?? 'peneliti') }}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0; color: #64748B;">Email Terdaftar</td>
                <td style="padding: 4px 0; font-weight: 600; color: #0F172A;">{{ $user->email }}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0; color: #64748B;">Status Akun</td>
                <td style="padding: 4px 0; font-weight: 700; color: #D97706;">PENDING APPROVAL</td>
            </tr>
        </table>
    </div>

    <p style="font-size: 13px; color: #64748B;">
        Anda akan menerima email pemberitahuan otomatis segera setelah Administrator menyetujui akun Anda. Setelah disetujui, Anda dapat langsung masuk ke Admin Panel untuk mulai membuat dan mengelola dokumen riset.
    </p>

    <div style="margin-top: 24px;">
        <a href="{{ config('app.url') }}/login" class="btn-primary">
            Kunjungi Halaman Login
        </a>
    </div>
@endsection

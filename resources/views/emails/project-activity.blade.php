@extends('emails.layouts.master')

@php
    $titles = [
        'created' => 'Project Riset Baru Dibuat',
        'updated' => 'Project Riset Berhasil Diperbarui',
        'published' => 'Project Berhasil Dipublikasikan',
        'unpublished' => 'Status Publikasi Project Ditarik',
        'duplicated' => 'Project Berhasil Diduplikasi',
        'deleted' => 'Project Telah Dihapus',
        'pdf_downloaded' => 'Dokumen PDF Berhasil Digenerate',
    ];

    $subtitles = [
        'created' => 'Project spesifikasi riset baru telah berhasil didaftarkan ke sistem STASIKATOR.',
        'updated' => 'Perubahan data spesifikasi riset Anda telah tersimpan secara aman.',
        'published' => 'Project Anda kini tampil pada showcase publik Landing Page STAS-RG.',
        'unpublished' => 'Project telah diubah statusnya menjadi draft internal laboratorium.',
        'duplicated' => 'Salinan skema project baru telah berhasil dibuat dan siap dimodifikasi.',
        'deleted' => 'Project spesifikasi riset telah dihapus dari repositori akun Anda.',
        'pdf_downloaded' => 'Dokumen laporan resmi standar CoE STAS-RG telah berhasil digenerate dan diunduh.',
    ];

    $eventBadge = match($eventType) {
        'published' => ['class' => 'badge-success', 'dot' => 'badge-dot-success', 'label' => 'Dipublikasikan (Live)'],
        'unpublished' => ['class' => 'badge-warning', 'dot' => 'badge-dot-warning', 'label' => 'Draft Internal'],
        'deleted' => ['class' => 'badge-error', 'dot' => 'badge-dot-error', 'label' => 'Dihapus'],
        'created', 'duplicated' => ['class' => 'badge-info', 'dot' => 'badge-dot-info', 'label' => 'Project Baru'],
        'pdf_downloaded' => ['class' => 'badge-success', 'dot' => 'badge-dot-success', 'label' => 'Export PDF Selesai'],
        default => ['class' => 'badge-info', 'dot' => 'badge-dot-info', 'label' => 'Diperbarui'],
    };

    $headerTitle = $titles[$eventType] ?? 'Pemberitahuan Aktivitas Project';
    $headerSubtitle = $subtitles[$eventType] ?? 'Pembaruan data pada sistem repositori STASIKATOR.';
@endphp

@section('title', $headerTitle)
@section('header_subtitle', 'Notifikasi Aktivitas Project STAS-RG')

@section('content')
    <h2 class="email-title" style="margin: 0 0 4px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">{{ $headerTitle }}</h2>
    <p class="email-subtitle" style="margin: 0 0 20px 0; font-size: 13px; color: #64748B; line-height: 1.5;">{{ $headerSubtitle }}</p>

    <div class="greeting" style="margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #0F172A;">
        Halo {{ $user->name }},
    </div>

    <p class="paragraph" style="margin: 0 0 18px 0; font-size: 13.5px; line-height: 1.65; color: #334155;">
        Kami menginformasikan bahwa aktivitas <strong>{{ str_replace('_', ' ', $eventType) }}</strong> telah berhasil diproses untuk project riset berikut:
    </p>

    <!-- Structured Project Summary Card -->
    <div class="card" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px 22px; margin: 22px 0;">
        @if(!empty($project->main_image))
            <div style="margin-bottom: 16px; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; text-align: center; background-color: #FFFFFF;">
                <img src="{{ url('/storage/' . $project->main_image) }}" alt="{{ $project->title }}" style="max-width: 100%; height: auto; display: block; border-radius: 10px;" />
            </div>
        @endif

        <table class="card-table" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td class="card-label" style="padding: 10px 14px 10px 0; width: 36%; font-size: 12.5px; font-weight: 600; color: #64748B; vertical-align: middle; border-bottom: 1px solid #EDF2F7; white-space: nowrap;">
                    Judul Project
                </td>
                <td class="card-value" style="padding: 10px 0; font-size: 13.5px; font-weight: 700; color: #0F172A; vertical-align: middle; border-bottom: 1px solid #EDF2F7;">
                    {{ $project->title ?? $project->name }}
                </td>
            </tr>
            <tr>
                <td class="card-label" style="padding: 10px 14px 10px 0; width: 36%; font-size: 12.5px; font-weight: 600; color: #64748B; vertical-align: middle; border-bottom: 1px solid #EDF2F7; white-space: nowrap;">
                    Kategori Riset
                </td>
                <td class="card-value" style="padding: 10px 0; font-size: 13px; vertical-align: middle; border-bottom: 1px solid #EDF2F7;">
                    <span class="badge badge-info" style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; line-height: 1.2;">
                        <span class="badge-dot badge-dot-info" style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #3B82F6; margin-right: 5px; vertical-align: middle;"></span>
                        {{ $project->category ?? 'Spesifikasi Sistem & IoT' }}
                    </span>
                </td>
            </tr>
            @if(!empty($project->project_leader))
            <tr>
                <td class="card-label" style="padding: 10px 14px 10px 0; width: 36%; font-size: 12.5px; font-weight: 600; color: #64748B; vertical-align: middle; border-bottom: 1px solid #EDF2F7; white-space: nowrap;">
                    Ketua Tim / Peneliti
                </td>
                <td class="card-value" style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #1E293B; vertical-align: middle; border-bottom: 1px solid #EDF2F7;">
                    {{ $project->project_leader }}
                </td>
            </tr>
            @endif
            <tr>
                <td class="card-label" style="padding: 10px 14px 10px 0; width: 36%; font-size: 12.5px; font-weight: 600; color: #64748B; vertical-align: middle; border-bottom: 1px solid #EDF2F7; white-space: nowrap;">
                    Status Terkini
                </td>
                <td class="card-value" style="padding: 10px 0; font-size: 13px; vertical-align: middle; border-bottom: 1px solid #EDF2F7;">
                    @php
                        $bgStyle = match($eventType) {
                            'published', 'pdf_downloaded' => 'background-color: #ECFDF5; border: 1px solid #A7F3D0; color: #0D5A34;',
                            'unpublished' => 'background-color: #FFF7ED; border: 1px solid #FED7AA; color: #9A3412;',
                            'deleted' => 'background-color: #FEF2F2; border: 1px solid #FECACA; color: #991B1B;',
                            default => 'background-color: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF;',
                        };
                        $dotColor = match($eventType) {
                            'published', 'pdf_downloaded' => '#10B981',
                            'unpublished' => '#EA580C',
                            'deleted' => '#EF4444',
                            default => '#3B82F6',
                        };
                    @endphp
                    <span class="badge {{ $eventBadge['class'] }}" style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; {{ $bgStyle }} line-height: 1.2;">
                        <span class="badge-dot {{ $eventBadge['dot'] }}" style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: {{ $dotColor }}; margin-right: 5px; vertical-align: middle;"></span>
                        {{ $eventBadge['label'] }}
                    </span>
                </td>
            </tr>
            <tr>
                <td class="card-label" style="padding: 10px 14px 2px 0; width: 36%; font-size: 12.5px; font-weight: 600; color: #64748B; vertical-align: middle; border-bottom: none; white-space: nowrap;">
                    Waktu Pembaruan
                </td>
                <td class="card-value" style="padding: 10px 0 2px 0; font-size: 13px; font-weight: 600; color: #1E293B; vertical-align: middle; border-bottom: none;">
                    {{ now()->translatedFormat('d F Y, H:i') . ' WIB' }}
                </td>
            </tr>
        </table>
    </div>

    @if($eventType !== 'deleted')
        <div class="button-wrapper" style="margin: 26px 0 20px 0; text-align: left;">
            @if($eventType === 'published')
                <a href="{{ url('/#projects-showcase') }}" class="btn-primary" target="_blank" style="display: inline-block; background-color: #0D5A34; color: #FFFFFF !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 12px; text-align: center; box-shadow: 0 2px 6px rgba(13, 90, 52, 0.15);">
                    Lihat di Showcase Publik
                </a>
            @else
                <a href="{{ url('/projects/' . ($project->slug ?? $project->id)) }}" class="btn-primary" target="_blank" style="display: inline-block; background-color: #0D5A34; color: #FFFFFF !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 12px; text-align: center; box-shadow: 0 2px 6px rgba(13, 90, 52, 0.15);">
                    Buka Detail Project
                </a>
            @endif
        </div>
    @else
        <div class="button-wrapper" style="margin: 26px 0 20px 0; text-align: left;">
            <a href="{{ url('/projects') }}" class="btn-primary" target="_blank" style="display: inline-block; background-color: #0D5A34; color: #FFFFFF !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 12px; text-align: center; box-shadow: 0 2px 6px rgba(13, 90, 52, 0.15);">
                Kembali ke Daftar Project
            </a>
        </div>
    @endif

    <div class="info-callout" style="background-color: #F8FAFC; border-left: 3px solid #0D5A34; border-radius: 0 10px 10px 0; padding: 12px 16px; margin: 20px 0 0 0; font-size: 12px; color: #475569; line-height: 1.5;">
        Seluruh histori perubahan dan versi dokumen tersimpan pada repositori audit laboratorium STAS-RG.
    </div>
@endsection

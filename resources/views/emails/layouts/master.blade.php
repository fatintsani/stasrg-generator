<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $subject ?? 'Pemberitahuan — STAS RG Projects' }}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Base Reset */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            min-width: 100%;
            background-color: #F8FAFC;
            color: #0F172A;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        /* Layout */
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #F8FAFC;
            padding: 40px 0 60px 0;
        }

        .main-container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 24px;
            overflow: hidden;
        }

        .content-area {
            padding: 36px 36px 32px 36px;
        }

        /* Typography */
        h1, .email-title {
            font-size: 20px;
            font-weight: 800;
            color: #0F172A;
            line-height: 1.3;
            margin: 0 0 4px 0;
            letter-spacing: -0.3px;
        }

        h2 {
            font-size: 16px;
            font-weight: 700;
            color: #0F172A;
            line-height: 1.4;
            margin: 0 0 10px 0;
        }

        .email-subtitle {
            font-size: 13px;
            color: #64748B;
            line-height: 1.5;
            margin: 0 0 20px 0;
        }

        p, .paragraph {
            font-size: 13.5px;
            line-height: 1.65;
            color: #334155;
            margin: 0 0 18px 0;
        }

        .greeting {
            font-size: 14px;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 12px;
        }

        /* Badge Components */
        .badge, .badge-pill {
            display: inline-block;
            vertical-align: middle;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-decoration: none;
            line-height: 1.2;
            letter-spacing: 0.2px;
        }

        .badge-dot, .badge-dot-success, .badge-dot-info, .badge-dot-warning, .badge-dot-error {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            margin-right: 5px;
            vertical-align: middle;
        }

        /* Badge Variants */
        .badge-success {
            background-color: #ECFDF5;
            border: 1px solid #A7F3D0;
            color: #0D5A34 !important;
        }
        .badge-dot-success {
            background-color: #10B981;
        }

        .badge-pending {
            background-color: #FFFBEB;
            border: 1px solid #FDE68A;
            color: #92400E !important;
        }
        .badge-pending .badge-dot {
            background-color: #F59E0B;
        }

        .badge-warning {
            background-color: #FFF7ED;
            border: 1px solid #FED7AA;
            color: #9A3412 !important;
        }
        .badge-dot-warning {
            background-color: #EA580C;
        }

        .badge-error {
            background-color: #FEF2F2;
            border: 1px solid #FECACA;
            color: #991B1B !important;
        }
        .badge-dot-error {
            background-color: #EF4444;
        }

        .badge-info {
            background-color: #EFF6FF;
            border: 1px solid #BFDBFE;
            color: #1E40AF !important;
        }
        .badge-dot-info {
            background-color: #3B82F6;
        }

        /* Cards & Structured Data */
        .card, .info-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 16px;
            padding: 18px 20px;
            margin: 20px 0;
        }

        .card-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            padding: 0;
        }

        .card-label {
            padding: 9px 12px 9px 0;
            font-size: 12.5px;
            font-weight: 600;
            color: #64748B;
            vertical-align: middle;
            border-bottom: 1px solid #EDF2F7;
            width: 36%;
            white-space: nowrap;
        }

        .card-value {
            padding: 9px 0;
            font-size: 13px;
            font-weight: 600;
            color: #0F172A;
            vertical-align: middle;
            border-bottom: 1px solid #EDF2F7;
        }

        .card-table tr:last-child .card-label,
        .card-table tr:last-child .card-value {
            border-bottom: none;
            padding-bottom: 2px;
        }

        .status-box {
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
        }

        .status-box-otp {
            background: linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%);
            border: 1.5px solid #86EFAC;
        }

        /* Buttons & CTA */
        .button-wrapper {
            margin: 26px 0 20px 0;
            text-align: left;
        }

        .btn-primary {
            display: inline-block;
            background-color: #0D5A34;
            color: #FFFFFF !important;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 6px rgba(13, 90, 52, 0.15);
        }

        .btn-primary:hover {
            background-color: #094226 !important;
        }

        /* Callout */
        .info-callout {
            background-color: #F8FAFC;
            border-left: 3px solid #0D5A34;
            border-radius: 0 10px 10px 0;
            padding: 12px 16px;
            margin: 20px 0 0 0;
            font-size: 12px;
            color: #475569;
            line-height: 1.5;
        }

        /* Footer */
        .footer-wrap {
            padding: 32px 36px 36px 36px;
            background-color: #FAFAFA;
            border-top: 1px solid #E2E8F0;
        }

        .social-link {
            display: inline-block;
            margin-right: 12px;
            color: #0D5A34;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
        }

        /* Mobile */
        @media screen and (max-width: 600px) {
            .wrapper {
                padding: 16px 8px !important;
            }

            .content-area {
                padding: 24px 20px !important;
            }

            .footer-wrap {
                padding: 24px 20px !important;
            }

            h1, .email-title {
                font-size: 18px !important;
            }

            .card-label {
                width: 42% !important;
                font-size: 12px !important;
            }

            .card-value {
                font-size: 12.5px !important;
            }

            .btn-primary {
                width: 100% !important;
                box-sizing: border-box;
            }
        }
    </style>
</head>

<body>
    @if(isset($previewText))
    <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        {{ $previewText }}
    </div>
    @endif

    <table role="presentation" class="wrapper" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center">
                <table role="presentation" class="main-container" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <!-- 1. Header Section -->
                    <tr>
                        <td style="padding: 28px 36px 20px 36px; border-bottom: 1px solid #F1F5F9;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="left" style="vertical-align: middle;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="vertical-align: middle; padding-right: 10px;">
                                                    <img src="{{ config('app.url') }}/assets/img/stas.png" alt="STAS RG" width="34" height="34" style="display: block; width: 34px; height: 34px; object-fit: contain;">
                                                </td>
                                                <td style="vertical-align: middle; padding-right: 10px; border-right: 1px solid #E2E8F0; height: 24px;"></td>
                                                <td style="vertical-align: middle; padding-left: 10px;">
                                                    <img src="{{ config('app.url') }}/assets/img/telu.png" alt="Telkom University" height="28" style="display: block; height: 28px; width: auto;">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <div style="font-size: 13px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                                            STAS RG <span style="font-weight: 600; color: #0D5A34;">Projects</span>
                                        </div>
                                        <div style="font-size: 10px; color: #94A3B8; font-weight: 500;">
                                            CoE STAS-RG Platform
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- 2. Main Content Body -->
                    <tr>
                        <td class="content-area">
                            @yield('content')
                        </td>
                    </tr>

                    <!-- 3. Standard Footer (Consistent with Website Landing Page) -->
                    <tr>
                        <td class="footer-wrap">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <div style="font-size: 12px; font-weight: 800; color: #0F172A;">
                                            Center of Excellence STAS-RG
                                        </div>
                                        <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
                                            Fakultas Ilmu Terapan, Telkom University
                                        </div>
                                        <div style="font-size: 11px; color: #94A3B8; margin-top: 4px; line-height: 1.4;">
                                            Gedung Selaru Lt. 1, Jl. Telekomunikasi No. 1, Terusan Buahbatu, Bandung 40257
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 12px; border-top: 1px solid #E2E8F0;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td align="left" style="font-size: 11px; color: #64748B;">
                                                    <a href="{{ config('app.url') }}" class="social-link" style="color: #0D5A34;">Website</a> •
                                                    <a href="https://instagram.com/stas.rg" class="social-link" style="color: #0D5A34;">Instagram</a> •
                                                    <a href="https://telkomuniversity.ac.id" class="social-link" style="color: #0D5A34;">Tel-U</a> •
                                                    <a href="mailto:stas.research@telkomuniversity.ac.id" class="social-link" style="color: #0D5A34;">Email Lab</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="padding-top: 12px; font-size: 10.5px; color: #94A3B8; line-height: 1.5;">
                                                    Email ini dikirimkan secara otomatis oleh sistem internal STASIKATOR / STAS RG Projects. Harap jangan membalas langsung ke email ini.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="padding-top: 8px; font-size: 10px; color: #94A3B8;">
                                                    © {{ date('Y') }} CoE STAS-RG Telkom University. Seluruh hak cipta dilindungi.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
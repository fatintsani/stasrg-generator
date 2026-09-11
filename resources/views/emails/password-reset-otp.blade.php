<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP Pemulihan Kata Sandi — STAS RG Generator</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #FAFAFA;
            color: #0F172A;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 520px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 20px;
            padding: 36px 32px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
        }
        .brand-title {
            font-size: 16px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: -0.5px;
        }
        .brand-sub {
            font-weight: 400;
            color: #64748B;
        }
        .badge {
            display: inline-block;
            background-color: #ECFDF5;
            border: 1px solid #A7F3D0;
            color: #0D5A34;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 9999px;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
        }
        h1 {
            font-size: 22px;
            font-weight: 800;
            color: #0F172A;
            margin: 0 0 12px 0;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 20px 0;
        }
        .otp-box {
            background: linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%);
            border: 1.5px solid #86EFAC;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-label {
            font-size: 11px;
            font-weight: 700;
            color: #0D5A34;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .otp-code {
            font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
            font-size: 32px;
            font-weight: 800;
            color: #0D5A34;
            letter-spacing: 6px;
        }
        .note {
            font-size: 12px;
            color: #64748B;
            border-top: 1px solid #E2E8F0;
            padding-top: 18px;
            margin-top: 24px;
        }
        .footer {
            text-align: center;
            font-size: 11px;
            color: #94A3B8;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="brand">
            <span class="brand-title">STAS RG <span class="brand-sub">Generator</span></span>
        </div>

        <div class="badge">PEMULIHAN KATA SANDI // OTP</div>

        <h1>Kode Verifikasi Anda</h1>
        <p>
            Halo peneliti, kami menerima permintaan pengaturan ulang kata sandi untuk akun STAS RG Generator Anda. Gunakan kode One-Time Password (OTP) berikut untuk memverifikasi identitas Anda:
        </p>

        <div class="otp-box">
            <div class="otp-label">KODE OTP (BERLAKU 15 MENIT)</div>
            <div class="otp-code">{{ $otpCode }}</div>
        </div>

        <p style="font-size: 13px; color: #64748B;">
            Jangan berikan kode ini kepada siapa pun. Jika Anda tidak merasa melakukan permintaan pemulihan ini, abaikan email ini dan akun Anda akan tetap aman.
        </p>

        <div class="note">
            Permintaan dikirim ke: <strong>{{ $email }}</strong><br>
            Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) – Telkom University
        </div>
    </div>

    <div class="footer">
        © {{ date('Y') }} CoE STAS-RG Telkom University. Seluruh hak cipta dilindungi.
    </div>
</body>
</html>

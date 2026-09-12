<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LoginNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public ?string $ipAddress = null,
        public ?string $userAgent = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Aktivitas Masuk Akun Terdeteksi — STAS-RG Generator',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.login-notification',
            with: [
                'user' => $this->user,
                'ipAddress' => $this->ipAddress,
                'userAgent' => $this->userAgent,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

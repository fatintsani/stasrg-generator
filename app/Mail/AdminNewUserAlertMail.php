<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminNewUserAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Notifikasi Pendaftar Baru Menunggu Persetujuan — STAS-RG Projects',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-new-user',
            with: [
                'user' => $this->user,
                'actionUrl' => url('/admin/users'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

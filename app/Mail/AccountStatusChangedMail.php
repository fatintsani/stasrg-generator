<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountStatusChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $status,
    ) {}

    public function envelope(): Envelope
    {
        $statusText = $this->status === 'active' ? 'Diaktifkan' : 'Dinonaktifkan';

        return new Envelope(
            subject: "Status Akun Anda Telah {$statusText} — STAS-RG Projects",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account-status',
            with: [
                'user' => $this->user,
                'status' => $this->status,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

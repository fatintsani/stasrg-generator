<?php

namespace App\Mail;

use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SupportTicketReplyMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public SupportTicket $ticket,
        public SupportTicketReply $reply,
        public ?User $admin = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Re: [STAS-SUPPORT] Balasan Tiket #{$this->ticket->ticket_number} — {$this->ticket->subject}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.support-ticket-reply',
            with: [
                'ticket' => $this->ticket,
                'reply' => $this->reply,
                'admin' => $this->admin,
                'portalUrl' => url('/'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

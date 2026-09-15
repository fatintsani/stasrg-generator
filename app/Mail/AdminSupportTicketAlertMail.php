<?php

namespace App\Mail;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminSupportTicketAlertMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public SupportTicket $ticket,
    ) {}

    public function envelope(): Envelope
    {
        $priorityPrefix = match ($this->ticket->priority) {
            'urgent' => '[URGENT SUPPORT]',
            'high' => '[HIGH PRIORITY SUPPORT]',
            default => '[NEW SUPPORT TICKET]',
        };

        return new Envelope(
            subject: "{$priorityPrefix} #{$this->ticket->ticket_number}: {$this->ticket->subject}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-support-ticket-alert',
            with: [
                'ticket' => $this->ticket,
                'actionUrl' => route('support-tickets.show', $this->ticket),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

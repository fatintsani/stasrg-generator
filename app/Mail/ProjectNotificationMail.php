<?php

namespace App\Mail;

use App\Models\Project;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Project $project,
        public string $eventType, // 'created', 'updated', 'published', 'unpublished', 'duplicated', 'deleted', 'pdf_downloaded'
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->eventType) {
            'created' => "Project Baru Dibuat: {$this->project->title} — STAS-RG Generator",
            'updated' => "Pembaruan Data Project: {$this->project->title} — STAS-RG Generator",
            'published' => "Project Telah Dipublikasikan: {$this->project->title} — STAS-RG Generator",
            'unpublished' => "Status Publikasi Project Ditarik: {$this->project->title} — STAS-RG Generator",
            'duplicated' => "Project Berhasil Diduplikasi: {$this->project->title} — STAS-RG Generator",
            'deleted' => "Project Telah Dihapus: {$this->project->title} — STAS-RG Generator",
            'pdf_downloaded' => "Dokumen PDF Project Telah Digenerate: {$this->project->title} — STAS-RG Generator",
            default => "Pemberitahuan Project: {$this->project->title} — STAS-RG Generator",
        };

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.project-activity',
            with: [
                'user' => $this->user,
                'project' => $this->project,
                'eventType' => $this->eventType,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

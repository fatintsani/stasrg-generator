<?php

namespace Tests\Feature;

use App\Mail\AdminSupportTicketAlertMail;
use App\Mail\SupportTicketReceivedMail;
use App\Mail\SupportTicketReplyMail;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SupportTicketTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test guest can view the standalone support page.
     */
    public function test_guest_can_view_support_page(): void
    {
        $response = $this->get(route('support'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Support'));
    }

    /**
     * Test guest can submit a support ticket without attachment.
     */
    public function test_guest_can_submit_support_ticket(): void
    {
        $response = $this->post(route('support.submit'), [
            'name' => 'Budi Santoso',
            'email' => 'budi@telkomuniversity.ac.id',
            'phone' => '+6281234567890',
            'institution' => 'Telkom University',
            'category' => SupportTicket::CATEGORY_GENERAL,
            'priority' => SupportTicket::PRIORITY_MEDIUM,
            'subject' => 'Pertanyaan Kemitraan Laboratorium',
            'message' => 'Halo tim STAS RG, kami ingin berkonsultasi mengenai kolaborasi penelitian AI dan IoT.',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('ticket_number');

        $this->assertDatabaseHas('support_tickets', [
            'name' => 'Budi Santoso',
            'email' => 'budi@telkomuniversity.ac.id',
            'subject' => 'Pertanyaan Kemitraan Laboratorium',
            'status' => SupportTicket::STATUS_PENDING,
        ]);
    }

    /**
     * Test guest can submit a support ticket with a valid attachment.
     */
    public function test_guest_can_submit_ticket_with_attachment(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('error_screenshot.png', 500, 'image/png');

        $response = $this->post(route('support.submit'), [
            'name' => 'Siti Nurhaliza',
            'email' => 'siti@example.com',
            'category' => SupportTicket::CATEGORY_TECHNICAL,
            'priority' => SupportTicket::PRIORITY_HIGH,
            'subject' => 'Kendala Rendering Flyer A4',
            'message' => 'Ketika mengklik export PDF muncul pesan error layout shift.',
            'attachment' => $file,
        ]);

        $response->assertSessionHasNoErrors();
        $ticket = SupportTicket::first();

        $this->assertNotNull($ticket);
        $this->assertNotNull($ticket->attachment_path);
        $this->assertEquals('error_screenshot.png', $ticket->attachment_original_name);
        Storage::disk('public')->assertExists($ticket->attachment_path);
    }

    /**
     * Test validation fails on missing required fields.
     */
    public function test_submission_fails_with_invalid_data(): void
    {
        $response = $this->post(route('support.submit'), [
            'name' => '',
            'email' => 'invalid-email',
            'subject' => '',
            'message' => '',
        ]);

        $response->assertSessionHasErrors(['name', 'email', 'subject', 'message']);
    }

    /**
     * Test guest cannot access admin support tickets routes.
     */
    public function test_guest_cannot_access_admin_support_tickets(): void
    {
        $response = $this->get(route('support-tickets.index'));
        $response->assertRedirect('/login');
    }

    /**
     * Test admin can view support tickets index.
     */
    public function test_admin_can_view_support_tickets_index(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        SupportTicket::create([
            'ticket_number' => 'STAS-20260914-0001',
            'name' => 'Riset Partner',
            'email' => 'partner@brin.go.id',
            'category' => SupportTicket::CATEGORY_PARTNERSHIP,
            'priority' => SupportTicket::PRIORITY_HIGH,
            'subject' => 'MoU Riset Bersama',
            'message' => 'Permohonan kerjasama riset bersama CoE STAS.',
            'status' => SupportTicket::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)->get(route('support-tickets.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/SupportTickets/Index')
            ->has('tickets.data', 1)
            ->has('stats')
        );
    }

    /**
     * Test admin can update ticket status, priority, and notes.
     */
    public function test_admin_can_update_ticket_status(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $ticket = SupportTicket::create([
            'ticket_number' => 'STAS-20260914-0002',
            'name' => 'Dr. Hendra',
            'email' => 'hendra@university.ac.id',
            'category' => SupportTicket::CATEGORY_FEATURE,
            'priority' => SupportTicket::PRIORITY_LOW,
            'subject' => 'Request Fitur Dark Mode Otomatis',
            'message' => 'Mohon tambahkan opsi dark mode otomatis berdasarkan OS.',
            'status' => SupportTicket::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)->put(route('support-tickets.update', $ticket), [
            'status' => SupportTicket::STATUS_RESOLVED,
            'priority' => SupportTicket::PRIORITY_MEDIUM,
            'admin_notes' => 'Fitur dark mode telah diterapkan pada versi terbaru.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('support_tickets', [
            'id' => $ticket->id,
            'status' => SupportTicket::STATUS_RESOLVED,
            'priority' => SupportTicket::PRIORITY_MEDIUM,
            'admin_notes' => 'Fitur dark mode telah diterapkan pada versi terbaru.',
            'resolved_by' => $admin->id,
        ]);
    }

    /**
     * Test admin can delete ticket and prunes attachment.
     */
    public function test_admin_can_delete_ticket(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $fakePath = 'support_attachments/test_file.png';
        Storage::disk('public')->put($fakePath, 'dummy content');

        $ticket = SupportTicket::create([
            'ticket_number' => 'STAS-20260914-0003',
            'name' => 'Spam Sender',
            'email' => 'spam@domain.com',
            'category' => SupportTicket::CATEGORY_GENERAL,
            'priority' => SupportTicket::PRIORITY_LOW,
            'subject' => 'Spam Message',
            'message' => 'Spam content',
            'attachment_path' => $fakePath,
            'status' => SupportTicket::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)->delete(route('support-tickets.destroy', $ticket));

        $response->assertRedirect();
        $this->assertDatabaseMissing('support_tickets', ['id' => $ticket->id]);
        Storage::disk('public')->assertMissing($fakePath);
    }

    /**
     * Test admin can export tickets to CSV.
     */
    public function test_admin_can_export_csv(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        SupportTicket::create([
            'ticket_number' => 'STAS-20260914-0004',
            'name' => 'Export User',
            'email' => 'export@example.com',
            'category' => SupportTicket::CATEGORY_GENERAL,
            'priority' => SupportTicket::PRIORITY_LOW,
            'subject' => 'Test CSV Export',
            'message' => 'Testing CSV stream download',
            'status' => SupportTicket::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)->get(route('support-tickets.export-csv'));

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
    }

    /**
     * Test admin can view dedicated support ticket detail page.
     */
    public function test_admin_can_view_support_ticket_detail_page(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $ticket = SupportTicket::create([
            'ticket_number' => 'STAS-20260914-0005',
            'name' => 'Show Test User',
            'email' => 'showtest@example.com',
            'category' => SupportTicket::CATEGORY_TECHNICAL,
            'priority' => SupportTicket::PRIORITY_HIGH,
            'subject' => 'Show Page Test Subject',
            'message' => 'Show Page Test Message Content',
            'status' => SupportTicket::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)->get(route('support-tickets.show', $ticket));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/SupportTickets/Show')
            ->has('ticket')
            ->where('ticket.ticket_number', 'STAS-20260914-0005')
            ->where('ticket.name', 'Show Test User')
        );
    }

    /**
     * Test ticket submission queues receipt email to sender and alert email to admins.
     */
    public function test_ticket_submission_queues_receipt_and_admin_alert_emails(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin.support@telkomuniversity.ac.id',
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $response = $this->post(route('support.submit'), [
            'name' => 'Fatin Researcher',
            'email' => 'fatin.inquiry@example.com',
            'phone' => '+6281234567890',
            'institution' => 'Telkom University',
            'category' => SupportTicket::CATEGORY_GENERAL,
            'priority' => SupportTicket::PRIORITY_HIGH,
            'subject' => 'Konsultasi Riset AI & IoT',
            'message' => 'Halo tim STAS-RG, kami ingin berkonsultasi mengenai kolaborasi penelitian.',
        ]);

        $response->assertSessionHasNoErrors();

        Mail::assertQueued(SupportTicketReceivedMail::class, function ($mail) {
            return $mail->hasTo('fatin.inquiry@example.com');
        });

        Mail::assertQueued(AdminSupportTicketAlertMail::class, function ($mail) use ($admin) {
            return $mail->hasTo($admin->email);
        });
    }

    /**
     * Test admin can send reply email to ticket author and update status.
     */
    public function test_admin_can_send_reply_email_and_update_status(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'name' => 'Support Engineer',
            'email' => 'support.eng@telkomuniversity.ac.id',
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $ticket = SupportTicket::create([
            'ticket_number' => 'STAS-20260915-0099',
            'name' => 'Pengirim Tiket',
            'email' => 'pengirim@example.com',
            'category' => SupportTicket::CATEGORY_TECHNICAL,
            'priority' => SupportTicket::PRIORITY_HIGH,
            'subject' => 'Kendala Integrasi AI',
            'message' => 'Mohon bantuan terkait error integrasi model.',
            'status' => SupportTicket::STATUS_PENDING,
        ]);

        $replyPayload = [
            'message' => 'Halo Pengirim, kendala integrasi AI Anda telah kami selesaikan dengan memperbarui API endpoint.',
            'status' => SupportTicket::STATUS_RESOLVED,
        ];

        $response = $this->actingAs($admin)->post(route('support-tickets.reply', $ticket), $replyPayload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $ticket->refresh();
        $this->assertEquals(SupportTicket::STATUS_RESOLVED, $ticket->status);
        $this->assertEquals($admin->id, $ticket->resolved_by);
        $this->assertNotNull($ticket->resolved_at);

        // Check reply record in database
        $this->assertDatabaseHas('support_ticket_replies', [
            'support_ticket_id' => $ticket->id,
            'user_id' => $admin->id,
            'message' => $replyPayload['message'],
            'status_at_reply' => SupportTicket::STATUS_RESOLVED,
        ]);

        // Check reply email was queued
        Mail::assertQueued(SupportTicketReplyMail::class, function ($mail) {
            return $mail->hasTo('pengirim@example.com');
        });
    }
}

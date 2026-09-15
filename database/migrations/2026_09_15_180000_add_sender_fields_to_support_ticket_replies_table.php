<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('support_ticket_replies', function (Blueprint $table) {
            $table->string('sender_type')->default('admin')->after('user_id'); // 'admin' or 'user'
            $table->string('sender_name')->nullable()->after('sender_type');
            $table->string('attachment_path')->nullable()->after('message');
            $table->string('attachment_original_name')->nullable()->after('attachment_path');
            $table->unsignedBigInteger('attachment_size')->nullable()->after('attachment_original_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('support_ticket_replies', function (Blueprint $table) {
            $table->dropColumn([
                'sender_type',
                'sender_name',
                'attachment_path',
                'attachment_original_name',
                'attachment_size',
            ]);
        });
    }
};

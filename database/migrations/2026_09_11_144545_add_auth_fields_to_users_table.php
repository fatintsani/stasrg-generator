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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'academic_title')) {
                $table->string('academic_title')->nullable()->after('name');
            }
            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('researcher')->after('email');
            }
            if (! Schema::hasColumn('users', 'google_id')) {
                $table->string('google_id')->nullable()->unique()->after('email');
            }
            if (! Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('google_id');
            }
            if (! Schema::hasColumn('users', 'is_biometric_enabled')) {
                $table->boolean('is_biometric_enabled')->default(false)->after('password');
            }
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'academic_title', 'google_id', 'avatar', 'is_biometric_enabled']);
            $table->string('password')->nullable(false)->change();
        });
    }
};

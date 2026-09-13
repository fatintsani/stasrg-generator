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
        Schema::table('projects', function (Blueprint $table) {
            $table->string('doc_format')->default('a4_flyer')->after('layout_preset');
            $table->string('color_theme')->default('stas_official')->after('doc_format');
            $table->string('print_mode')->default('light')->after('color_theme');
            $table->string('boilerplate_type')->nullable()->after('print_mode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'doc_format',
                'color_theme',
                'print_mode',
                'boilerplate_type',
            ]);
        });
    }
};

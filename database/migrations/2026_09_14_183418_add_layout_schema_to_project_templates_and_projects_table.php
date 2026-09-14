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
        if (Schema::hasTable('project_templates') && ! Schema::hasColumn('project_templates', 'layout_schema')) {
            Schema::table('project_templates', function (Blueprint $table) {
                $table->json('layout_schema')->nullable()->after('default_data');
            });
        }

        if (Schema::hasTable('projects') && ! Schema::hasColumn('projects', 'layout_schema')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->json('layout_schema')->nullable()->after('design_style');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('project_templates') && Schema::hasColumn('project_templates', 'layout_schema')) {
            Schema::table('project_templates', function (Blueprint $table) {
                $table->dropColumn('layout_schema');
            });
        }

        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'layout_schema')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('layout_schema');
            });
        }
    }
};

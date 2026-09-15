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
            $table->string('lab_affiliation')->nullable()->after('research_team');
            $table->string('patent_number')->nullable()->after('lab_affiliation');
            $table->string('publication_doi')->nullable()->after('patent_number');
        });

        if (Schema::hasTable('project_templates')) {
            Schema::table('project_templates', function (Blueprint $table) {
                $table->string('lab_affiliation')->nullable()->after('boilerplate_type');
                $table->string('patent_number')->nullable()->after('lab_affiliation');
                $table->string('publication_doi')->nullable()->after('patent_number');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['lab_affiliation', 'patent_number', 'publication_doi']);
        });

        if (Schema::hasTable('project_templates')) {
            Schema::table('project_templates', function (Blueprint $table) {
                $table->dropColumn(['lab_affiliation', 'patent_number', 'publication_doi']);
            });
        }
    }
};

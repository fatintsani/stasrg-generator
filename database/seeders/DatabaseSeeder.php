<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with initial admin user.
     */
    public function run(): void
    {
        // Seed Super Admin User (Approved & Ready to use)
        User::updateOrCreate(
            ['email' => 'admin@stasrg.com'],
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'role' => 'admin',
                'status' => User::STATUS_APPROVED,
                'approved_at' => now(),
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ]
        );

        // Seed Official Project Templates
        $this->call(ProjectTemplateSeeder::class);
    }
}

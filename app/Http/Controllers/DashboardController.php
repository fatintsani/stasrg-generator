<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Admin Dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Admin/Dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'admin',
                    'avatar' => $user->avatar,
                    'is_biometric_enabled' => (bool) $user->is_biometric_enabled,
                    'passkeys_count' => $user->passkeys()->count(),
                ],
            ],
            'stats' => [
                'total_projects' => 4,
                'total_documents' => 12,
                'total_templates' => 28,
                'is_biometric_active' => (bool) $user->is_biometric_enabled,
            ],
            'recent_projects' => [
                [
                    'id' => 1,
                    'code' => 'STAS-RG-2026-001',
                    'title' => 'Intelligent IoT Ground Sensor for Agriculture 4.0',
                    'category' => 'Smart Agriculture',
                    'lead' => 'Dr. Ir. Budi Santoso',
                    'status' => 'Lengkap',
                    'status_type' => 'success',
                    'documents_count' => 5,
                    'updated_at' => '11 Sep 2026',
                ],
                [
                    'id' => 2,
                    'code' => 'STAS-RG-2026-002',
                    'title' => 'Edge AI Anomaly Detection in Autonomous Drone Telemetry',
                    'category' => 'Aviation & AI',
                    'lead' => 'Ahmad Fauzi, M.T.',
                    'status' => 'Review',
                    'status_type' => 'warning',
                    'documents_count' => 3,
                    'updated_at' => '10 Sep 2026',
                ],
                [
                    'id' => 3,
                    'code' => 'STAS-RG-2026-003',
                    'title' => 'Blockchain Verification Protocol for CoE Research Artifacts',
                    'category' => 'Cybersecurity',
                    'lead' => 'Prof. Dr. Rina Wijaya',
                    'status' => 'Draft',
                    'status_type' => 'neutral',
                    'documents_count' => 2,
                    'updated_at' => '08 Sep 2026',
                ],
                [
                    'id' => 4,
                    'code' => 'STAS-RG-2026-004',
                    'title' => 'LoRaWAN Mesh Network for Disaster Monitoring System',
                    'category' => 'Telecommunication',
                    'lead' => 'Dewi Lestari, S.T., M.Sc.',
                    'status' => 'Lengkap',
                    'status_type' => 'success',
                    'documents_count' => 4,
                    'updated_at' => '05 Sep 2026',
                ],
            ],
        ]);
    }
}

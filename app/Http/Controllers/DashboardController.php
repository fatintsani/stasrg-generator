<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
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

        $baseQuery = $user->projects();

        $totalProjects = (clone $baseQuery)->count();
        $publishedProjects = (clone $baseQuery)->where('status', 'published')->count();
        $draftProjects = (clone $baseQuery)->where('status', 'draft')->count();
        $qrLinkedCount = (clone $baseQuery)->whereNotNull('project_url')->where('project_url', '!=', '')->count();
        $partnerProjectsCount = (clone $baseQuery)->whereNotNull('partner_logo')->where('partner_logo', '!=', '')->count();
        $monthlyCreatedCount = (clone $baseQuery)->where('created_at', '>=', now()->startOfMonth())->count();

        // Calculate Category Breakdown & Distribution directly via database aggregation
        $categoryCounts = (clone $baseQuery)
            ->selectRaw('COALESCE(NULLIF(category, ""), "Lainnya / Umum") as cat_name, COUNT(*) as count')
            ->groupBy('cat_name')
            ->orderByDesc('count')
            ->get();

        $categoryDistribution = $categoryCounts->map(function ($row) use ($totalProjects) {
            $count = (int) $row->count;
            $percentage = $totalProjects > 0 ? round(($count / $totalProjects) * 100) : 0;

            return [
                'name' => $row->cat_name,
                'count' => $count,
                'percentage' => $percentage,
            ];
        })->values()->all();

        $categoriesCount = count($categoryDistribution);

        $recentProjects = (clone $baseQuery)
            ->latest()
            ->take(6)
            ->get([
                'id',
                'name',
                'slug',
                'title',
                'category',
                'subtitle',
                'description',
                'status',
                'main_image',
                'partner_logo',
                'benefits',
                'specifications',
                'problem_solution',
                'project_url',
                'qr_code_path',
                'footer_website',
                'footer_instagram',
                'footer_youtube',
                'updated_at',
                'created_at',
            ])
            ->map(function (Project $project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'slug' => $project->slug,
                    'title' => $project->title,
                    'category' => $project->category ?? 'General',
                    'subtitle' => $project->subtitle,
                    'description' => $project->description,
                    'status' => $project->status,
                    'main_image' => $project->main_image ? asset('storage/'.$project->main_image) : null,
                    'partner_logo' => $project->partner_logo ? asset('storage/'.$project->partner_logo) : null,
                    'benefits' => $project->benefits,
                    'specifications' => $project->specifications,
                    'problem_solution' => $project->problem_solution,
                    'project_url' => $project->project_url,
                    'qr_code_path' => $project->qr_code_path ? asset('storage/'.$project->qr_code_path) : null,
                    'footer_website' => $project->footer_website,
                    'footer_instagram' => $project->footer_instagram,
                    'footer_youtube' => $project->footer_youtube,
                    'updated_at' => $project->updated_at->translatedFormat('d M Y'),
                    'created_at' => $project->created_at->translatedFormat('d M Y'),
                ];
            })
            ->all();

        $passkeysCount = $user->passkeys()->count();

        return Inertia::render('Admin/Dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'admin',
                    'avatar' => $user->avatar,
                    'is_biometric_enabled' => (bool) $user->is_biometric_enabled,
                    'passkeys_count' => $passkeysCount,
                ],
            ],
            'stats' => [
                'total_projects' => $totalProjects,
                'published_projects' => $publishedProjects,
                'draft_projects' => $draftProjects,
                'categories_count' => $categoriesCount,
                'qr_linked_count' => $qrLinkedCount,
                'partner_projects_count' => $partnerProjectsCount,
                'monthly_created_count' => $monthlyCreatedCount,
                'is_biometric_active' => (bool) $user->is_biometric_enabled,
                'passkeys_count' => $passkeysCount,
            ],
            'category_distribution' => $categoryDistribution,
            'recent_projects' => $recentProjects,
        ]);
    }

    /**
     * Handle live global search queries across projects, users, logs, and navigation.
     */
    public function globalSearch(Request $request): JsonResponse
    {
        $query = trim($request->input('q', ''));

        if (strlen($query) === 0) {
            // Default suggested navigation items
            $defaultNav = [
                ['title' => 'Dashboard Utama', 'subtitle' => 'Ringkasan metrik & statistik sistem', 'url' => route('dashboard'), 'icon' => 'LayoutDashboard', 'category' => 'Navigasi'],
                ['title' => 'Semua Proyek Riset', 'subtitle' => 'Kelola katalog deliverable dan flyer A4', 'url' => route('projects.index'), 'icon' => 'FolderKanban', 'category' => 'Navigasi'],
                ['title' => 'Buat Proyek Baru', 'subtitle' => 'Inisialisasi dokumen riset baru', 'url' => route('projects.create'), 'icon' => 'FilePlus2', 'category' => 'Navigasi'],
                ['title' => 'Direktori Peneliti & Authors', 'subtitle' => 'Kelola master data peneliti & profil akademik', 'url' => route('researchers.index'), 'icon' => 'GraduationCap', 'category' => 'Navigasi'],
                ['title' => 'User Approval', 'subtitle' => 'Verifikasi dan persetujuan akun pengguna', 'url' => route('users.index'), 'icon' => 'Users', 'category' => 'Navigasi'],
                ['title' => 'Activity & Audit Logs', 'subtitle' => 'Riwayat perubahan dan audit trail sistem', 'url' => route('activity-logs.index'), 'icon' => 'Activity', 'category' => 'Navigasi'],
                ['title' => 'Pengaturan & Profil', 'subtitle' => 'Keamanan akun, passkey, & pemeliharaan', 'url' => route('settings'), 'icon' => 'Settings', 'category' => 'Navigasi'],
            ];

            return response()->json([
                'query' => '',
                'results' => [
                    'navigation' => $defaultNav,
                    'projects' => [],
                    'users' => [],
                    'logs' => [],
                ],
            ]);
        }

        $user = $request->user();

        // 1. Projects Search
        $projects = Project::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('title', 'like', "%{$query}%")
                ->orWhere('subtitle', 'like', "%{$query}%")
                ->orWhere('category', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->orWhere('slug', 'like', "%{$query}%");
        })
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'title' => $p->title ?: $p->name,
                    'category' => $p->category ?: 'General',
                    'status' => $p->status,
                    'slug' => $p->slug,
                    'main_image' => $p->main_image ? asset('storage/'.$p->main_image) : null,
                    'edit_url' => route('projects.edit', $p),
                    'show_url' => route('projects.show', $p),
                    'public_url' => route('projects.showcase.show', $p),
                    'created_at' => $p->created_at->translatedFormat('d M Y'),
                ];
            });

        // 2. Navigation Items matching query
        $allNav = [
            ['title' => 'Dashboard', 'keywords' => 'dashboard beranda statistik metrik home overview', 'subtitle' => 'Statistik dan ringkasan platform', 'url' => route('dashboard'), 'icon' => 'LayoutDashboard'],
            ['title' => 'Semua Proyek', 'keywords' => 'proyek project daftar list katalog factsheet inovasi riset', 'subtitle' => 'Daftar semua dokumen riset', 'url' => route('projects.index'), 'icon' => 'FolderKanban'],
            ['title' => 'Buat Proyek Baru', 'keywords' => 'buat tambah create new add form generator flyer dokumen', 'subtitle' => 'Formulir pembuatan proyek baru', 'url' => route('projects.create'), 'icon' => 'FilePlus2'],
            ['title' => 'Direktori Peneliti & Authors', 'keywords' => 'peneliti researcher dosen mahasiswa author scholar scopus sinta orcid tim pi', 'subtitle' => 'Master data peneliti, dosen, & profil akademik', 'url' => route('researchers.index'), 'icon' => 'GraduationCap'],
            ['title' => 'Asset & Media Library', 'keywords' => 'asset library logo mitra badge sertifikat hki paten media gambar', 'subtitle' => 'Master logo mitra, akreditasi & badge riset', 'url' => route('media-assets.index'), 'icon' => 'FolderHeart'],
            ['title' => 'User Approval & Akun', 'keywords' => 'user pengguna user approval persetujuan reject approve peneliti member akun anggota', 'subtitle' => 'Manajemen dan persetujuan pengguna', 'url' => route('users.index'), 'icon' => 'Users'],
            ['title' => 'Activity & Audit Logs', 'keywords' => 'activity audit log riwayat history autentikasi export print perubahan jejak audit', 'subtitle' => 'Riwayat perubahan & log keamanan', 'url' => route('activity-logs.index'), 'icon' => 'Activity'],
            ['title' => 'Pusat Tiket Dukungan & Kontak', 'keywords' => 'support kontak bantuan tiket helpdesk contact aduan keluhan error pertanyaan', 'subtitle' => 'Kelola tiket bantuan dan permohonan', 'url' => route('support-tickets.index'), 'icon' => 'LifeBuoy'],
            ['title' => 'Pengaturan Profil & Keamanan', 'keywords' => 'settings pengaturan profil password kata sandi passkey biometrik avatar foto cache optimize maintenance', 'subtitle' => 'Konfigurasi akun dan sistem', 'url' => route('settings'), 'icon' => 'Settings'],
            ['title' => 'Showcase Inovasi Publik', 'keywords' => 'showcase publik landing portal beranda pameran expo', 'subtitle' => 'Halaman etalase riset publik', 'url' => route('home'), 'icon' => 'ExternalLink'],
        ];

        $matchedNav = array_values(array_filter($allNav, function ($nav) use ($query) {
            $lowerQ = strtolower($query);

            return str_contains(strtolower($nav['title']), $lowerQ) ||
                   str_contains(strtolower($nav['keywords']), $lowerQ) ||
                   str_contains(strtolower($nav['subtitle']), $lowerQ);
        }));

        // 3. Users matching query
        $matchedUsers = User::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orWhere('username', 'like', "%{$query}%");
        })
            ->take(5)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'status' => $u->status,
                    'avatar_url' => $u->avatar_url,
                    'url' => route('users.index', ['search' => $u->email]),
                ];
            });

        // 4. Activity Logs matching query
        $matchedLogs = ActivityLog::where(function ($q) use ($query) {
            $q->where('description', 'like', "%{$query}%")
                ->orWhere('action', 'like', "%{$query}%")
                ->orWhere('ip_address', 'like', "%{$query}%");
        })
            ->latest()
            ->take(4)
            ->get()
            ->map(function ($l) use ($query) {
                return [
                    'id' => $l->id,
                    'description' => $l->description,
                    'action' => $l->action,
                    'log_type' => $l->log_type,
                    'created_at' => $l->created_at->diffForHumans(),
                    'url' => route('activity-logs.index', ['search' => $query]),
                ];
            });

        return response()->json([
            'query' => $query,
            'results' => [
                'projects' => $projects,
                'navigation' => $matchedNav,
                'users' => $matchedUsers,
                'logs' => $matchedLogs,
            ],
            'total_count' => count($projects) + count($matchedNav) + count($matchedUsers) + count($matchedLogs),
        ]);
    }
}

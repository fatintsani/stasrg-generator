<?php

namespace App\Http\Controllers;

use App\Models\Project;
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

        $allUserProjects = $user->projects()->latest()->get();

        $totalProjects = $allUserProjects->count();
        $publishedProjects = $allUserProjects->where('status', 'published')->count();
        $draftProjects = $allUserProjects->where('status', 'draft')->count();
        $qrLinkedCount = $allUserProjects->whereNotNull('project_url')->filter(fn ($p) => ! empty($p->project_url))->count();
        $partnerProjectsCount = $allUserProjects->whereNotNull('partner_logo')->filter(fn ($p) => ! empty($p->partner_logo))->count();
        $monthlyCreatedCount = $allUserProjects->where('created_at', '>=', now()->startOfMonth())->count();

        // Calculate Category Breakdown & Distribution
        $categoriesGrouped = $allUserProjects->groupBy('category');
        $categoryDistribution = $categoriesGrouped->map(function ($items, $category) use ($totalProjects) {
            $catName = $category ?: 'Lainnya / Umum';
            $count = $items->count();
            $percentage = $totalProjects > 0 ? round(($count / $totalProjects) * 100) : 0;

            return [
                'name' => $catName,
                'count' => $count,
                'percentage' => $percentage,
            ];
        })->values()->sortByDesc('count')->values()->all();

        $categoriesCount = count($categoryDistribution);

        $recentProjects = $allUserProjects->take(6)->map(function (Project $project) {
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
                'updated_at' => $project->updated_at->format('d M Y'),
                'created_at' => $project->created_at->format('d M Y'),
            ];
        })->all();

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
                'total_projects' => $totalProjects,
                'published_projects' => $publishedProjects,
                'draft_projects' => $draftProjects,
                'categories_count' => $categoriesCount,
                'qr_linked_count' => $qrLinkedCount,
                'partner_projects_count' => $partnerProjectsCount,
                'monthly_created_count' => $monthlyCreatedCount,
                'is_biometric_active' => (bool) $user->is_biometric_enabled,
                'passkeys_count' => $user->passkeys()->count(),
            ],
            'category_distribution' => $categoryDistribution,
            'recent_projects' => $recentProjects,
        ]);
    }
}

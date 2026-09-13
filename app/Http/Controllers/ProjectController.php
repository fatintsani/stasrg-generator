<?php

namespace App\Http\Controllers;

use App\Mail\ProjectNotificationMail;
use App\Models\Project;
use App\Services\ActivityLogger;
use App\Services\AiAssistantService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class ProjectController extends Controller
{
    /**
     * Display listing of all projects.
     */
    public function index(Request $request): Response
    {
        $query = $request->user()->projects()->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $projects = $query->paginate(12)->withQueryString();

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
            ],
        ]);
    }

    /**
     * Show form for creating a new project.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Projects/Form', [
            'project' => null,
            'categories' => $this->getAvailableCategories(),
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'main_image' => ['nullable', 'image', 'max:10240'],
            'benefits' => ['nullable', 'array'],
            'specifications' => ['nullable', 'array'],
            'problem_solution' => ['nullable', 'array'],
            'project_url' => ['nullable', 'string', 'max:255'],
            'footer_website' => ['nullable', 'string', 'max:255'],
            'footer_instagram' => ['nullable', 'string', 'max:255'],
            'footer_youtube' => ['nullable', 'string', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'partner_logo' => ['nullable', 'file', 'mimes:jpeg,png,jpg,svg,webp', 'max:5120'],
            'footer_logo' => ['nullable', 'file', 'mimes:jpeg,png,jpg,svg,webp', 'max:5120'],
            'layout_preset' => ['nullable', 'string', 'in:balanced,visual_heavy,text_heavy'],
            'doc_format' => ['nullable', 'string', 'in:a4_flyer,roll_banner,factsheet_2col,pitch_poster,social_feed,social_story'],
            'color_theme' => ['nullable', 'string', 'in:stas_official,ocean_tech,crimson_innovation,slate_monochrome'],
            'print_mode' => ['nullable', 'string', 'in:light,dark'],
            'boilerplate_type' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        if ($request->hasFile('main_image')) {
            $validated['main_image'] = $request->file('main_image')->store('projects/images', 'public');
        } else {
            unset($validated['main_image']);
        }

        if ($request->hasFile('partner_logo')) {
            $validated['partner_logo'] = $request->file('partner_logo')->store('projects/logos', 'public');
        } else {
            unset($validated['partner_logo']);
        }

        if ($request->hasFile('footer_logo')) {
            $validated['footer_logo'] = $request->file('footer_logo')->store('projects/logos', 'public');
        } else {
            unset($validated['footer_logo']);
        }

        // Generate QR code if URL is provided
        if (! empty($validated['project_url'])) {
            $url = $validated['project_url'];
            if (! preg_match('#^https?://#i', $url)) {
                $url = 'https://'.$url;
            }
            $validated['qr_code_path'] = $this->generateQrCode($url);
        }

        $validated['status'] = $validated['status'] ?? 'draft';
        $validated = $this->sanitizeProjectData($validated);

        $project = $request->user()->projects()->create($validated);

        try {
            Mail::to($request->user()->email)->send(
                new ProjectNotificationMail($request->user(), $project, 'created')
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send project created email: '.$e->getMessage());
        }

        ActivityLogger::logProject(
            action: 'project.created',
            description: "Membuat proyek riset baru \"{$project->name}\"",
            project: $project,
            properties: [
                'name' => $project->name,
                'title' => $project->title,
                'category' => $project->category,
                'status' => $project->status,
                'layout_preset' => $project->layout_preset,
                'doc_format' => $project->doc_format,
                'color_theme' => $project->color_theme,
                'print_mode' => $project->print_mode,
            ],
            user: $request->user(),
            request: $request
        );

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'Project berhasil dibuat!');
    }

    /**
     * Display project preview.
     */
    public function show(Project $project): Response
    {
        $this->authorizeUserOwnsProject($project);

        return Inertia::render('Admin/Projects/Show', [
            'project' => $project,
        ]);
    }

    /**
     * Show form for editing an existing project.
     */
    public function edit(Project $project): Response
    {
        $this->authorizeUserOwnsProject($project);

        return Inertia::render('Admin/Projects/Form', [
            'project' => $project,
            'categories' => $this->getAvailableCategories(),
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeUserOwnsProject($project);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'main_image' => ['nullable'],
            'benefits' => ['nullable', 'array'],
            'specifications' => ['nullable', 'array'],
            'problem_solution' => ['nullable', 'array'],
            'project_url' => ['nullable', 'string', 'max:255'],
            'footer_website' => ['nullable', 'string', 'max:255'],
            'footer_instagram' => ['nullable', 'string', 'max:255'],
            'footer_youtube' => ['nullable', 'string', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'partner_logo' => ['nullable'],
            'footer_logo' => ['nullable'],
            'layout_preset' => ['nullable', 'string', 'in:balanced,visual_heavy,text_heavy'],
            'doc_format' => ['nullable', 'string', 'in:a4_flyer,roll_banner,factsheet_2col,pitch_poster,social_feed,social_story'],
            'color_theme' => ['nullable', 'string', 'in:stas_official,ocean_tech,crimson_innovation,slate_monochrome'],
            'print_mode' => ['nullable', 'string', 'in:light,dark'],
            'boilerplate_type' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        if ($request->hasFile('main_image')) {
            $request->validate([
                'main_image' => ['image', 'max:10240'],
            ]);
            // Delete old image
            if ($project->main_image) {
                Storage::disk('public')->delete($project->main_image);
            }
            $validated['main_image'] = $request->file('main_image')->store('projects/images', 'public');
        } else {
            // Keep existing image if no new file is provided
            unset($validated['main_image']);
        }

        if ($request->hasFile('partner_logo')) {
            $request->validate([
                'partner_logo' => ['file', 'mimes:jpeg,png,jpg,svg,webp', 'max:5120'],
            ]);
            if ($project->partner_logo) {
                Storage::disk('public')->delete($project->partner_logo);
            }
            $validated['partner_logo'] = $request->file('partner_logo')->store('projects/logos', 'public');
        } elseif ($request->boolean('remove_partner_logo')) {
            if ($project->partner_logo) {
                Storage::disk('public')->delete($project->partner_logo);
            }
            $validated['partner_logo'] = null;
        } else {
            unset($validated['partner_logo']);
        }

        if ($request->hasFile('footer_logo')) {
            $request->validate([
                'footer_logo' => ['image', 'max:2048'],
            ]);
            if ($project->footer_logo) {
                Storage::disk('public')->delete($project->footer_logo);
            }
            $validated['footer_logo'] = $request->file('footer_logo')->store('projects/logos', 'public');
        } else {
            // Keep existing footer logo if no new file is provided
            unset($validated['footer_logo']);
        }

        // Regenerate QR code if URL changed
        $newUrl = $validated['project_url'] ?? null;
        if (! empty($newUrl) && $newUrl !== $project->project_url) {
            if ($project->qr_code_path) {
                Storage::disk('public')->delete($project->qr_code_path);
            }
            $urlToEncode = ! preg_match('#^https?://#i', $newUrl) ? 'https://'.$newUrl : $newUrl;
            $validated['qr_code_path'] = $this->generateQrCode($urlToEncode);
        } elseif (empty($newUrl) && $project->qr_code_path) {
            Storage::disk('public')->delete($project->qr_code_path);
            $validated['qr_code_path'] = null;
        }

        $validated = $this->sanitizeProjectData($validated);

        $oldStatus = $project->status;
        $newStatus = $validated['status'] ?? $project->status;
        $project->update($validated);

        try {
            $eventType = 'updated';
            if ($oldStatus !== 'published' && $newStatus === 'published') {
                $eventType = 'published';
            } elseif ($oldStatus === 'published' && $newStatus === 'draft') {
                $eventType = 'unpublished';
            }

            Mail::to($request->user()->email)->send(
                new ProjectNotificationMail($request->user(), $project, $eventType)
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send project update email: '.$e->getMessage());
        }

        ActivityLogger::logProject(
            action: $oldStatus !== $newStatus ? 'project.status_changed' : 'project.updated',
            description: "Memperbarui informasi proyek riset \"{$project->name}\"",
            project: $project,
            properties: [
                'name' => $project->name,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'updated_fields' => array_keys($validated),
            ],
            user: $request->user(),
            request: $request
        );

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'Project berhasil diperbarui!');
    }

    /**
     * Sanitize rich text inputs in project data.
     */
    private function sanitizeProjectData(array $validated): array
    {
        if (isset($validated['description'])) {
            $validated['description'] = HtmlSanitizer::clean($validated['description']);
        }

        if (isset($validated['benefits']) && is_array($validated['benefits'])) {
            if (isset($validated['benefits']['content'])) {
                $validated['benefits']['content'] = HtmlSanitizer::clean($validated['benefits']['content']);
            }
        }

        if (isset($validated['specifications']) && is_array($validated['specifications'])) {
            if (isset($validated['specifications']['content'])) {
                $validated['specifications']['content'] = HtmlSanitizer::clean($validated['specifications']['content']);
            }
        }

        if (isset($validated['problem_solution']) && is_array($validated['problem_solution'])) {
            if (isset($validated['problem_solution']['problem'])) {
                $validated['problem_solution']['problem'] = HtmlSanitizer::clean($validated['problem_solution']['problem']);
            }
            if (isset($validated['problem_solution']['solution'])) {
                $validated['problem_solution']['solution'] = HtmlSanitizer::clean($validated['problem_solution']['solution']);
            }
        }

        return $validated;
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $this->authorizeUserOwnsProject($project);
        $user = Auth::user();

        // Clean up uploaded files
        if ($project->main_image) {
            Storage::disk('public')->delete($project->main_image);
        }
        if ($project->partner_logo) {
            Storage::disk('public')->delete($project->partner_logo);
        }
        if ($project->footer_logo) {
            Storage::disk('public')->delete($project->footer_logo);
        }
        if ($project->qr_code_path) {
            Storage::disk('public')->delete($project->qr_code_path);
        }

        try {
            Mail::to($user->email)->send(
                new ProjectNotificationMail($user, $project, 'deleted')
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send project deleted email: '.$e->getMessage());
        }

        $projectName = $project->name;
        $projectId = $project->id;

        $project->delete();

        ActivityLogger::logProject(
            action: 'project.deleted',
            description: "Menghapus proyek riset \"{$projectName}\"",
            project: null,
            properties: [
                'deleted_id' => $projectId,
                'name' => $projectName,
            ],
            user: $user,
            request: request()
        );

        return redirect()
            ->route('projects.index')
            ->with('success', 'Project berhasil dihapus!');
    }

    /**
     * Duplicate an existing project.
     */
    public function duplicate(Project $project): RedirectResponse
    {
        $this->authorizeUserOwnsProject($project);
        $user = Auth::user();

        $newProject = $project->replicate(['qr_code_path']);
        $newProject->name = $project->name.' (Copy)';
        $newProject->slug = Project::generateUniqueSlug($newProject->name);
        $newProject->status = 'draft';
        $newProject->created_at = now();
        $newProject->updated_at = now();

        // Duplicate main image file
        if ($project->main_image && Storage::disk('public')->exists($project->main_image)) {
            $extension = pathinfo($project->main_image, PATHINFO_EXTENSION);
            $newPath = 'projects/images/'.uniqid().'.'.$extension;
            Storage::disk('public')->copy($project->main_image, $newPath);
            $newProject->main_image = $newPath;
        }

        // Duplicate partner logo file
        if ($project->partner_logo && Storage::disk('public')->exists($project->partner_logo)) {
            $extension = pathinfo($project->partner_logo, PATHINFO_EXTENSION);
            $newPath = 'projects/logos/'.uniqid().'.'.$extension;
            Storage::disk('public')->copy($project->partner_logo, $newPath);
            $newProject->partner_logo = $newPath;
        }

        // Regenerate QR code for the duplicate
        if ($project->project_url) {
            $newProject->qr_code_path = $this->generateQrCode($project->project_url);
        }

        $newProject->save();

        try {
            Mail::to($user->email)->send(
                new ProjectNotificationMail($user, $newProject, 'duplicated')
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send project duplicate email: '.$e->getMessage());
        }

        ActivityLogger::logProject(
            action: 'project.duplicated',
            description: "Menduplikasi proyek riset \"{$project->name}\" menjadi \"{$newProject->name}\"",
            project: $newProject,
            properties: [
                'original_id' => $project->id,
                'original_name' => $project->name,
                'new_id' => $newProject->id,
                'new_name' => $newProject->name,
            ],
            user: $user,
            request: request()
        );

        return redirect()
            ->route('projects.edit', $newProject)
            ->with('success', 'Project berhasil diduplikasi!');
    }

    /**
     * AI Assistant: Generate complete structured project content based on prompt.
     */
    public function aiGenerateProject(Request $request): JsonResponse
    {
        $prompt = $request->input('topic') ?: $request->input('prompt');
        $category = $request->input('category');
        $notes = $request->input('notes') ?: $request->input('custom_instructions');

        if (empty($prompt) || strlen(trim($prompt)) < 3) {
            return response()->json([
                'success' => false,
                'error' => 'Silakan masukkan topik riset atau ide proyek (minimal 3 karakter).',
            ], 422);
        }

        try {
            $layoutPreset = $request->input('layout_preset') ?: 'balanced';
            $generated = AiAssistantService::generateProjectContent(trim($prompt), [
                'category' => $category,
                'notes' => $notes,
                'layout_preset' => $layoutPreset,
            ]);

            ActivityLogger::logProject(
                action: 'project.ai_generated',
                description: "Menghasilkan draf konten riset menggunakan AI Assistant (\"{$generated['name']}\")",
                project: null,
                properties: [
                    'prompt' => $prompt,
                    'generated_name' => $generated['name'] ?? null,
                    'generated_category' => $generated['category'] ?? null,
                ],
                user: $request->user(),
                request: $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Konten proyek berhasil dihasilkan oleh AI Assistant!',
                'data' => $generated,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * AI Assistant: Polish or generate specific project section.
     */
    public function aiPolishSection(Request $request): JsonResponse
    {
        $section = $request->input('section');
        $context = $request->input('context', []);
        if ($request->has('current_data') && is_array($request->input('current_data'))) {
            $context = array_merge($context, $request->input('current_data'));
        }

        $text = (string) ($request->input('text') ?: $request->input('prompt') ?: '');
        $hasDescription = ! empty($context['description']) || ! empty($context['project_name']) || ! empty($context['name']) || ! empty($context['title']);

        if (empty($section) || (empty($text) && ! $hasDescription)) {
            return response()->json([
                'success' => false,
                'error' => 'Silakan isi Nama Proyek atau Deskripsi Singkat terlebih dahulu agar AI memiliki informasi untuk menyusun konten.',
            ], 422);
        }

        try {
            $result = AiAssistantService::generateSection(
                $section,
                $text,
                $context
            );

            $polishedText = is_string($result) ? $result : ($result['content'] ?? ($result['solution'] ?? json_encode($result)));

            return response()->json([
                'success' => true,
                'section' => $section,
                'polished_text' => $polishedText,
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display public detail view of a published project.
     */
    public function publicShow(Project $project): Response
    {
        abort_unless($project->status === 'published', 404);

        $relatedProjects = Project::where('status', 'published')
            ->where('id', '!=', $project->id)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'title' => $p->title,
                    'category' => $p->category ?? 'General',
                    'subtitle' => $p->subtitle,
                    'description' => $p->description,
                    'main_image' => $p->main_image ? asset('storage/'.$p->main_image) : null,
                    'updated_at' => $p->updated_at->format('d M Y'),
                ];
            });

        return Inertia::render('Public/ProjectDetail', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'category' => $project->category ?? 'General',
                'title' => $project->title,
                'subtitle' => $project->subtitle,
                'description' => $project->description,
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
                'social_links' => $project->social_links,
                'layout_preset' => $project->layout_preset ?? 'balanced',
                'status' => $project->status,
                'created_at' => $project->created_at->format('d M Y'),
                'updated_at' => $project->updated_at->format('d M Y'),
            ],
            'relatedProjects' => $relatedProjects,
        ]);
    }

    /**
     * Generate QR code image and return the storage path.
     */
    private function generateQrCode(string $url): string
    {
        $filename = 'projects/qrcodes/'.uniqid('qr_').'.svg';
        $fullPath = storage_path('app/public/'.$filename);

        // Ensure directory exists
        $directory = dirname($fullPath);
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        QrCode::format('svg')
            ->size(200)
            ->errorCorrection('H')
            ->margin(1)
            ->color(13, 90, 52)
            ->generate($url, $fullPath);

        return $filename;
    }

    /**
     * Ensure the authenticated user owns the project.
     */
    private function authorizeUserOwnsProject(Project $project): void
    {
        abort_unless($project->user_id === Auth::id(), 403);
    }

    /**
     * Get list of unique categories (defaults + existing project categories).
     *
     * @return list<string>
     */
    private function getAvailableCategories(): array
    {
        $defaultCategories = [
            'Smart Agriculture',
            'Internet of Things (IoT)',
            'Aviation & AI',
            'Cybersecurity',
            'Telecommunication',
            'Renewable Energy',
            'Healthcare Tech',
            'Robotics & Automation',
            'Aquaculture / IoT',
        ];

        $dbCategories = Project::whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->pluck('category')
            ->toArray();

        return array_values(array_unique(array_filter(array_merge($defaultCategories, $dbCategories))));
    }
}

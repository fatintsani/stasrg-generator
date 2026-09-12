<?php

namespace App\Http\Controllers;

use App\Mail\ProjectNotificationMail;
use App\Models\Project;
use App\Services\HtmlSanitizer;
use Barryvdh\DomPDF\Facade\Pdf;
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
            'main_image' => ['nullable', 'image', 'max:5120'],
            'benefits' => ['nullable', 'array'],
            'specifications' => ['nullable', 'array'],
            'problem_solution' => ['nullable', 'array'],
            'project_url' => ['nullable', 'string', 'max:255'],
            'footer_website' => ['nullable', 'string', 'max:255'],
            'footer_instagram' => ['nullable', 'string', 'max:255'],
            'footer_youtube' => ['nullable', 'string', 'max:255'],
            'partner_logo' => ['nullable', 'image', 'max:2048'],
            'footer_logo' => ['nullable', 'image', 'max:2048'],
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
            'partner_logo' => ['nullable'],
            'footer_logo' => ['nullable'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        if ($request->hasFile('main_image')) {
            $request->validate([
                'main_image' => ['image', 'max:5120'],
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
                'partner_logo' => ['image', 'max:2048'],
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

        $project->delete();

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

        return redirect()
            ->route('projects.edit', $newProject)
            ->with('success', 'Project berhasil diduplikasi!');
    }

    /**
     * Download project as PDF (Authenticated user).
     */
    public function downloadPdf(Project $project)
    {
        $this->authorizeUserOwnsProject($project);
        $user = Auth::user();

        try {
            Mail::to($user->email)->send(
                new ProjectNotificationMail($user, $project, 'pdf_downloaded')
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send project PDF email: '.$e->getMessage());
        }

        $images = $this->preparePdfImages($project);

        $pdf = Pdf::loadView('pdf.project', [
            'project' => $project,
            'images' => $images,
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = str_replace(' ', '_', strtolower($project->name)).'_'.date('Ymd').'.pdf';

        return $pdf->download($filename);
    }

    /**
     * Download project as PDF for public visitors (Published projects only).
     */
    public function publicPdf(Project $project)
    {
        abort_unless($project->status === 'published', 404);

        $images = $this->preparePdfImages($project);

        $pdf = Pdf::loadView('pdf.project', [
            'project' => $project,
            'images' => $images,
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = str_replace(' ', '_', strtolower($project->name)).'_'.date('Ymd').'.pdf';

        return $pdf->download($filename);
    }

    /**
     * Convert all project images to base64 data URIs for reliable PDF rendering.
     *
     * @return array<string, string|null>
     */
    private function preparePdfImages(Project $project): array
    {
        $images = [
            'main_image' => null,
            'partner_logo' => null,
            'stas_logo' => null,
            'telu_logo' => null,
            'qr_code' => null,
        ];

        // Main image
        if (! empty($project->main_image)) {
            $path = storage_path('app/public/'.$project->main_image);
            if (file_exists($path)) {
                $images['main_image'] = $this->fileToBase64DataUri($path);
            }
        }

        // Partner logo (custom or default telu)
        if (! empty($project->partner_logo)) {
            $path = storage_path('app/public/'.$project->partner_logo);
            if (file_exists($path)) {
                $images['partner_logo'] = $this->fileToBase64DataUri($path);
            }
        }
        if (! $images['partner_logo']) {
            $teluPath = public_path('assets/img/telu.png');
            if (file_exists($teluPath)) {
                $images['partner_logo'] = $this->fileToBase64DataUri($teluPath);
            }
        }

        // STAS RG logo
        $stasPath = public_path('assets/img/stas.png');
        if (file_exists($stasPath)) {
            $images['stas_logo'] = $this->fileToBase64DataUri($stasPath);
        }

        // TELU logo (always available for fallback)
        $teluPath = public_path('assets/img/telu.png');
        if (file_exists($teluPath)) {
            $images['telu_logo'] = $this->fileToBase64DataUri($teluPath);
        }

        // QR code — SVG to base64 data URI
        if (! empty($project->qr_code_path)) {
            $qrPath = storage_path('app/public/'.$project->qr_code_path);
            if (file_exists($qrPath)) {
                $images['qr_code'] = $this->fileToBase64DataUri($qrPath);
            }
        }

        return $images;
    }

    /**
     * Convert a local file to a base64 data URI string.
     */
    private function fileToBase64DataUri(string $filePath): ?string
    {
        if (! file_exists($filePath)) {
            return null;
        }

        $mime = mime_content_type($filePath);

        // SVG files need special mime handling
        if (str_ends_with(strtolower($filePath), '.svg')) {
            $mime = 'image/svg+xml';
        }

        $data = base64_encode(file_get_contents($filePath));

        return "data:{$mime};base64,{$data}";
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

        $logoPath = public_path('assets/img/stas.png');

        $qr = QrCode::format('svg')
            ->size(200)
            ->errorCorrection('H')
            ->margin(1)
            ->color(13, 90, 52);

        if (file_exists($logoPath)) {
            $qr->merge($logoPath, 0.28, true);
        }

        $qr->generate($url, $fullPath);

        return $filename;
    }

    /**
     * Ensure the authenticated user owns the project.
     */
    private function authorizeUserOwnsProject(Project $project): void
    {
        abort_unless($project->user_id === Auth::id(), 403);
    }
}

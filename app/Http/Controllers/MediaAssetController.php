<?php

namespace App\Http\Controllers;

use App\Models\MediaAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaAssetController extends Controller
{
    /**
     * Display a listing of the media assets.
     */
    public function index(Request $request): Response
    {
        $type = $request->input('type', 'all');
        $category = $request->input('category', 'all');
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $query = MediaAsset::query()
            ->byType($type)
            ->byCategory($category)
            ->search($search);

        if (in_array($sort, ['name', 'usage_count', 'created_at', 'type', 'category'])) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest();
        }

        $assets = $query->paginate(24)->withQueryString();

        $stats = [
            'total' => MediaAsset::count(),
            'partner_logos' => MediaAsset::where('type', 'partner_logo')->count(),
            'badge_icons' => MediaAsset::where('type', 'badge_icon')->count(),
            'total_usage' => MediaAsset::sum('usage_count'),
        ];

        return Inertia::render('Admin/MediaAssets/Index', [
            'assets' => $assets,
            'stats' => $stats,
            'filters' => [
                'type' => $type,
                'category' => $category,
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * JSON API Endpoint for the Asset Picker Modal in Project Forms.
     */
    public function apiList(Request $request): JsonResponse
    {
        $type = $request->input('type');
        $category = $request->input('category');
        $search = $request->input('search');

        $assets = MediaAsset::query()
            ->byType($type)
            ->byCategory($category)
            ->search($search)
            ->verified()
            ->orderBy('is_system_preset', 'desc')
            ->orderBy('usage_count', 'desc')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assets,
        ]);
    }

    /**
     * Store a newly created custom media asset.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', 'in:partner_logo,badge_icon'],
            'category' => ['required', 'in:industry,university,grant,government,accreditation,patent,hki,iso,other'],
            'file' => ['nullable', 'file', 'mimes:png,jpg,jpeg,svg,webp', 'max:3072'],
            'svg_content' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        $filePath = null;

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('assets/library', 'public');
        }

        MediaAsset::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'category' => $validated['category'],
            'file_path' => $filePath,
            'svg_content' => $validated['svg_content'] ?? null,
            'tags' => $validated['tags'] ?? [],
            'is_verified' => true,
            'is_system_preset' => false,
            'usage_count' => 0,
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Aset media berhasil diunggah ke pustaka.');
    }

    /**
     * Update the specified media asset metadata.
     */
    public function update(Request $request, MediaAsset $mediaAsset): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', 'in:partner_logo,badge_icon'],
            'category' => ['required', 'in:industry,university,grant,government,accreditation,patent,hki,iso,other'],
            'file' => ['nullable', 'file', 'mimes:png,jpg,jpeg,svg,webp', 'max:3072'],
            'svg_content' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'is_verified' => ['nullable', 'boolean'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'type' => $validated['type'],
            'category' => $validated['category'],
            'tags' => $validated['tags'] ?? [],
        ];

        if ($request->has('is_verified')) {
            $updateData['is_verified'] = $request->boolean('is_verified');
        }

        if ($request->hasFile('file')) {
            if ($mediaAsset->file_path && Storage::disk('public')->exists($mediaAsset->file_path)) {
                Storage::disk('public')->delete($mediaAsset->file_path);
            }
            $updateData['file_path'] = $request->file('file')->store('assets/library', 'public');
            $updateData['svg_content'] = null;
        } elseif ($request->filled('svg_content')) {
            $updateData['svg_content'] = $request->input('svg_content');
        }

        $mediaAsset->update($updateData);

        return back()->with('success', 'Aset media berhasil diperbarui.');
    }

    /**
     * Remove the specified custom media asset.
     */
    public function destroy(MediaAsset $mediaAsset): RedirectResponse
    {
        if ($mediaAsset->is_system_preset) {
            return back()->with('error', 'Aset preset sistem bawaan tidak dapat dihapus.');
        }

        if ($mediaAsset->file_path && Storage::disk('public')->exists($mediaAsset->file_path)) {
            Storage::disk('public')->delete($mediaAsset->file_path);
        }

        $mediaAsset->delete();

        return back()->with('success', 'Aset berhasil dihapus dari pustaka.');
    }
}

<?php

namespace Tests\Feature;

use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaAssetTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test guest cannot access media library.
     */
    public function test_guest_cannot_access_media_library(): void
    {
        $response = $this->get(route('media-assets.index'));

        $response->assertRedirect(route('login'));
    }

    /**
     * Test authenticated user can access media library index.
     */
    public function test_authenticated_user_can_access_media_library(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        MediaAsset::create([
            'name' => 'Telkom Indonesia',
            'slug' => 'telkom-indonesia',
            'type' => 'partner_logo',
            'category' => 'industry',
            'is_verified' => true,
            'is_system_preset' => true,
        ]);

        $response = $this->actingAs($user)->get(route('media-assets.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/MediaAssets/Index')
            ->has('assets.data')
            ->has('stats')
        );
    }

    /**
     * Test API list returns verified media assets.
     */
    public function test_api_list_returns_media_assets(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        MediaAsset::create([
            'name' => 'Institut Teknologi Bandung',
            'slug' => 'itb',
            'type' => 'partner_logo',
            'category' => 'university',
            'is_verified' => true,
        ]);

        $response = $this->actingAs($user)->getJson(route('api.media-assets.index', ['category' => 'university']));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'name', 'type', 'category', 'is_verified', 'resolved_url'],
            ],
        ]);
        $response->assertJsonFragment(['name' => 'Institut Teknologi Bandung']);
    }

    /**
     * Test user can create custom media asset with uploaded file.
     */
    public function test_user_can_upload_custom_media_asset(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $file = UploadedFile::fake()->image('custom-logo.png', 400, 400);

        $response = $this->actingAs($user)->post(route('media-assets.store'), [
            'name' => 'Mitra Custom PT XYZ',
            'type' => 'partner_logo',
            'category' => 'industry',
            'file' => $file,
            'description' => 'Logo resmi PT XYZ',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('media_assets', [
            'name' => 'Mitra Custom PT XYZ',
            'category' => 'industry',
            'is_system_preset' => false,
        ]);
    }

    /**
     * Test system preset assets cannot be deleted.
     */
    public function test_system_preset_asset_cannot_be_deleted(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $asset = MediaAsset::create([
            'name' => 'System Preset Logo',
            'slug' => 'system-preset-logo',
            'type' => 'partner_logo',
            'category' => 'industry',
            'is_system_preset' => true,
        ]);

        $response = $this->actingAs($user)->delete(route('media-assets.destroy', $asset));

        $this->assertDatabaseHas('media_assets', [
            'id' => $asset->id,
        ]);
    }

    /**
     * Test custom non-system asset can be deleted.
     */
    public function test_custom_asset_can_be_deleted(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $asset = MediaAsset::create([
            'name' => 'Deletable Custom Logo',
            'slug' => 'deletable-custom-logo',
            'type' => 'partner_logo',
            'category' => 'industry',
            'file_path' => 'media-assets/test.png',
            'is_system_preset' => false,
        ]);

        $response = $this->actingAs($user)->delete(route('media-assets.destroy', $asset));

        $this->assertDatabaseMissing('media_assets', [
            'id' => $asset->id,
        ]);
    }

    /**
     * Test user can update media asset metadata.
     */
    public function test_user_can_update_media_asset(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $asset = MediaAsset::create([
            'name' => 'Original Logo Name',
            'type' => 'partner_logo',
            'category' => 'industry',
            'is_verified' => false,
            'is_system_preset' => false,
        ]);

        $response = $this->actingAs($user)->put(route('media-assets.update', $asset), [
            'name' => 'Updated Logo Name',
            'type' => 'badge_icon',
            'category' => 'accreditation',
            'tags' => ['akreditasi', 'unggul'],
            'is_verified' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('media_assets', [
            'id' => $asset->id,
            'name' => 'Updated Logo Name',
            'type' => 'badge_icon',
            'category' => 'accreditation',
            'is_verified' => true,
        ]);
    }

    /**
     * Test user can replace media asset file.
     */
    public function test_user_can_replace_media_asset_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $asset = MediaAsset::create([
            'name' => 'Asset with File',
            'type' => 'partner_logo',
            'category' => 'industry',
            'file_path' => 'assets/library/old-file.png',
            'is_verified' => true,
            'is_system_preset' => false,
        ]);

        $newFile = UploadedFile::fake()->image('new-logo.png', 400, 400);

        $response = $this->actingAs($user)->post(route('media-assets.update', $asset), [
            '_method' => 'PUT',
            'name' => 'Asset with New File',
            'type' => 'partner_logo',
            'category' => 'industry',
            'file' => $newFile,
        ]);

        $response->assertRedirect();
        $asset->refresh();
        $this->assertEquals('Asset with New File', $asset->name);
        $this->assertNotNull($asset->file_path);
        $this->assertTrue(Storage::disk('public')->exists($asset->file_path));
    }

    /**
     * Test SVG content is sanitized to prevent stored XSS vulnerabilities.
     */
    public function test_svg_content_is_sanitized_against_xss(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" onload="alert(1)"><script>alert("xss")</script><circle cx="50" cy="50" r="40" fill="red"/><a href="javascript:alert(2)"><text>Click</text></a></svg>';

        $response = $this->actingAs($user)->post(route('media-assets.store'), [
            'name' => 'Secure SVG Asset',
            'type' => 'badge_icon',
            'category' => 'accreditation',
            'svg_content' => $maliciousSvg,
        ]);

        $response->assertRedirect();

        $asset = MediaAsset::where('name', 'Secure SVG Asset')->first();
        $this->assertNotNull($asset);
        $this->assertStringNotContainsString('<script>', $asset->svg_content);
        $this->assertStringNotContainsString('onload=', $asset->svg_content);
        $this->assertStringNotContainsString('javascript:', $asset->svg_content);
        $this->assertStringContainsString('<circle cx="50" cy="50" r="40" fill="red"/>', $asset->svg_content);
    }
}

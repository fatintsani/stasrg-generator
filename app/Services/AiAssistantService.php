<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiAssistantService
{
    public const AVAILABLE_MODELS = [
        'gemini' => [
            'gemini-3.6-flash' => 'Gemini 3.6 Flash (Direkomendasikan, Cepat & Cerdas)',
            'gemini-3.6-pro' => 'Gemini 3.6 Pro (Penalaran Kompleks & Detail)',
            'gemini-2.5-flash' => 'Gemini 2.5 Flash',
            'gemini-1.5-flash' => 'Gemini 1.5 Flash (Legacy)',
            'gemini-1.5-pro' => 'Gemini 1.5 Pro (Legacy)',
        ],
        'openai' => [
            'gpt-4o-mini' => 'GPT-4o Mini',
            'gpt-4o' => 'GPT-4o',
            'gpt-3.5-turbo' => 'GPT-3.5 Turbo',
        ],
    ];

    /**
     * A4 1-Page Layout Character Limits per Preset.
     * Content MUST stay strictly below these limits so it never overflows the 1-page A4 canvas.
     */
    public const LAYOUT_LIMITS = [
        'balanced' => [
            'title' => 65,
            'subtitle' => 45,
            'description' => 400,
            'benefits' => 260,
            'specifications' => 260,
            'problem' => 210,
            'solution' => 210,
        ],
        'visual_heavy' => [
            'title' => 65,
            'subtitle' => 45,
            'description' => 270,
            'benefits' => 190,
            'specifications' => 190,
            'problem' => 150,
            'solution' => 150,
        ],
        'text_heavy' => [
            'title' => 65,
            'subtitle' => 45,
            'description' => 520,
            'benefits' => 350,
            'specifications' => 350,
            'problem' => 270,
            'solution' => 270,
        ],
    ];

    /**
     * Calculate plain text length excluding HTML tags and entities.
     */
    public static function getPlainTextLength(?string $htmlOrText): int
    {
        if (empty($htmlOrText)) {
            return 0;
        }

        $text = preg_replace('/<br\s*\/?>/i', ' ', $htmlOrText);
        $text = preg_replace('/<\/(p|li|div|h[1-6])>/i', ' ', $text);
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text);

        return mb_strlen(trim($text));
    }

    /**
     * Fit a paragraph HTML or plain text within max plain text character limit.
     */
    public static function fitParagraph(?string $htmlOrText, int $maxChars, bool $wrapInP = true): string
    {
        if (empty($htmlOrText)) {
            return $wrapInP ? '<p></p>' : '';
        }

        // Clean initial text
        $clean = trim(strip_tags($htmlOrText, '<br>'));
        $clean = html_entity_decode($clean, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $clean = preg_replace('/\s+/u', ' ', $clean);

        if (mb_strlen($clean) <= $maxChars) {
            return $wrapInP ? "<p>{$clean}</p>" : $clean;
        }

        // Split into sentences and keep as many complete sentences as possible
        $sentences = preg_split('/(?<=[.!?])\s+/u', $clean, -1, PREG_SPLIT_NO_EMPTY);
        $result = '';

        foreach ($sentences as $sentence) {
            $candidate = $result === '' ? $sentence : "{$result} {$sentence}";
            if (mb_strlen($candidate) <= $maxChars) {
                $result = $candidate;
            } else {
                break;
            }
        }

        // If no full sentence fit, truncate at word boundary
        if ($result === '') {
            $words = explode(' ', $clean);
            foreach ($words as $word) {
                $candidate = $result === '' ? $word : "{$result} {$word}";
                if (mb_strlen($candidate) <= ($maxChars - 3)) {
                    $result = $candidate;
                } else {
                    break;
                }
            }
            $result = rtrim($result, ',;:- ').'...';
        }

        return $wrapInP ? "<p>{$result}</p>" : $result;
    }

    /**
     * Fit an HTML list (<ul><li>...</li></ul>) within max plain text character limit and item count.
     */
    public static function fitList(?string $htmlList, int $maxChars, int $maxItems = 4): string
    {
        if (empty($htmlList)) {
            return '<ul></ul>';
        }

        preg_match_all('/<li[^>]*>(.*?)<\/li>/is', $htmlList, $matches);
        $rawItems = $matches[1] ?? [];

        if (empty($rawItems)) {
            // Fallback: split by lines or bullets if not inside <li>
            $lines = preg_split('/[\r\n]+|•|-/u', strip_tags($htmlList));
            $rawItems = array_values(array_filter(array_map('trim', $lines)));
        }

        $items = [];
        $currentLength = 0;

        foreach ($rawItems as $rawItem) {
            if (count($items) >= $maxItems) {
                break;
            }

            $trimmedItem = trim($rawItem);
            if (empty($trimmedItem)) {
                continue;
            }

            // Extract plain text length of this item
            $itemPlain = strip_tags(html_entity_decode($trimmedItem, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $itemPlainLen = mb_strlen(trim(preg_replace('/\s+/u', ' ', $itemPlain)));

            // If adding this exceeds total limit and we already have at least 2 items, stop
            if (($currentLength + $itemPlainLen) > $maxChars && count($items) >= 2) {
                break;
            }

            // If single item is excessively long (>95 chars), shorten its explanation
            if ($itemPlainLen > 95) {
                if (preg_match('/^(<strong>.*?<\/strong>:?)(.*)$/is', $trimmedItem, $m)) {
                    $prefix = $m[1];
                    $body = trim(strip_tags($m[2]));
                    $bodyWords = explode(' ', $body);
                    $shortBody = '';
                    foreach ($bodyWords as $w) {
                        if (mb_strlen("{$shortBody} {$w}") < 50) {
                            $shortBody = trim("{$shortBody} {$w}");
                        } else {
                            break;
                        }
                    }
                    $trimmedItem = "{$prefix} ".rtrim($shortBody, ',;:- ').'.';
                }
            }

            $currentLength += self::getPlainTextLength($trimmedItem);
            $items[] = $trimmedItem;
        }

        if (empty($items)) {
            $items = ['<strong>Inovasi:</strong> Penerapan sistem riset terintegrasi.'];
        }

        $listHtml = '<ul>';
        foreach ($items as $item) {
            $listHtml .= "<li>{$item}</li>";
        }
        $listHtml .= '</ul>';

        return $listHtml;
    }

    /**
     * Fit plain text within character limit at word boundary.
     */
    public static function fitText(?string $text, int $maxChars): string
    {
        if (empty($text)) {
            return '';
        }

        $text = trim(strip_tags($text));
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text);

        if (mb_strlen($text) <= $maxChars) {
            return $text;
        }

        $words = explode(' ', $text);
        $result = '';
        foreach ($words as $word) {
            $candidate = $result === '' ? $word : "{$result} {$word}";
            if (mb_strlen($candidate) <= ($maxChars - 3)) {
                $result = $candidate;
            } else {
                break;
            }
        }

        return rtrim($result, ',;:- ').'...';
    }

    /**
     * Test AI API key connection and calculate response latency.
     *
     * @return array<string, mixed>
     */
    public static function testConnection(
        ?string $apiKey = null,
        ?string $provider = null,
        ?string $model = null
    ): array {
        $provider = $provider ?: SystemSetting::get('ai_provider', 'gemini');
        $model = $model ?: SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = $apiKey ?: SystemSetting::get('ai_api_key');

        if (empty($key)) {
            return [
                'success' => false,
                'error' => 'API Key belum diisi. Harap masukkan API Key terlebih dahulu.',
                'hint' => 'Dapatkan API Key Google Gemini gratis di Google AI Studio (aistudio.google.com).',
            ];
        }

        $startTime = microtime(true);

        try {
            if ($provider === 'gemini') {
                $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

                $response = Http::timeout(30)
                    ->connectTimeout(15)
                    ->retry(2, 500, throw: false)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'x-goog-api-key' => $key,
                    ])
                    ->post($endpoint, [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => 'Respond strictly with the single word: "CONNECTED"'],
                                ],
                            ],
                        ],
                        'generationConfig' => [
                            'maxOutputTokens' => 10,
                            'temperature' => 0.1,
                        ],
                    ]);

                $durationMs = round((microtime(true) - $startTime) * 1000);

                if ($response->successful()) {
                    $json = $response->json();
                    $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';

                    return [
                        'success' => true,
                        'message' => 'Koneksi ke Google Gemini AI Berhasil!',
                        'provider' => 'Google Gemini AI',
                        'model' => $model,
                        'latency_ms' => $durationMs,
                        'reply' => trim($text),
                    ];
                }

                // Handle Gemini specific errors
                $errorData = $response->json('error') ?: [];
                $errorMessage = $errorData['message'] ?? $response->body();
                $status = $errorData['status'] ?? 'ERROR';

                $hint = 'Periksa kembali API Key dan kuota akun Google AI Studio Anda.';
                if (str_contains(strtolower($errorMessage), 'api_key_invalid') || $response->status() === 400 || $response->status() === 403) {
                    $hint = 'API Key yang dimasukkan tidak valid atau tidak memiliki izin akses.';
                } elseif (str_contains(strtolower($errorMessage), 'quota') || $response->status() === 429) {
                    $hint = 'Batas kuota API (Rate Limit) tercapai pada akun Anda.';
                } elseif (str_contains(strtolower($errorMessage), 'not found') || $response->status() === 404) {
                    $hint = "Model \"{$model}\" tidak ditemukan atau tidak didukung pada API version ini.";
                }

                return [
                    'success' => false,
                    'error' => "Gagal terhubung ({$status}): {$errorMessage}",
                    'hint' => $hint,
                    'status_code' => $response->status(),
                    'latency_ms' => $durationMs,
                ];
            }

            // OpenAI / Custom Endpoint Provider
            $endpoint = SystemSetting::get('ai_custom_endpoint') ?: 'https://api.openai.com/v1/chat/completions';
            $response = Http::timeout(15)
                ->withToken($key)
                ->post($endpoint, [
                    'model' => $model ?: 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'user', 'content' => 'Respond with: "CONNECTED"'],
                    ],
                    'max_tokens' => 10,
                ]);

            $durationMs = round((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Koneksi ke OpenAI / Compatible API Berhasil!',
                    'provider' => 'OpenAI Compatible',
                    'model' => $model,
                    'latency_ms' => $durationMs,
                ];
            }

            return [
                'success' => false,
                'error' => 'API Error: '.$response->body(),
                'hint' => 'Periksa kembali API Key dan endpoint OpenAI Anda.',
                'status_code' => $response->status(),
                'latency_ms' => $durationMs,
            ];
        } catch (\Throwable $e) {
            $durationMs = round((microtime(true) - $startTime) * 1000);

            return [
                'success' => false,
                'error' => 'Koneksi jaringan gagal: '.$e->getMessage(),
                'hint' => 'Pastikan server Anda memiliki akses koneksi internet keluar ke Google API.',
                'latency_ms' => $durationMs,
            ];
        }
    }

    /**
     * Generate full structured project content based on user idea or title.
     *
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public static function generateProjectContent(string $topicPrompt, array $context = []): array
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            throw new \RuntimeException('API Key AI belum dikonfigurasi. Silakan atur di menu Settings terlebih dahulu.');
        }

        $preset = $context['layout_preset'] ?? 'balanced';
        $limits = self::LAYOUT_LIMITS[$preset] ?? self::LAYOUT_LIMITS['balanced'];

        $systemInstruction = <<<INSTRUCTION
Anda adalah Research Content Generator Assistant resmi untuk Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) Telkom University.
Tugas Anda adalah menyusun lembar informasi fakta proyek riset inovatif (A4 Factsheet Flyer) lengkap, profesional, berbasis sains terapan terkini, dan siap cetak pada 1 HALAMAN A4.

PENTING - BATASAN PANJANG TEKS (LAYOUT A4 STRICT RULES):
Konten flyer dikunci pada 1 halaman A4 sehingga setiap teks HARUS RINGKAS, PADAT, DAN TIDAK BOLEH BERLEBIHAN:
- name: 2-4 kata menarik (Maksimal 30 karakter).
- title: Judul formal inovasi (Maksimal {$limits['title']} karakter, 2 baris).
- subtitle: Tagline keunggulan 1 kalimat padat (Maksimal {$limits['subtitle']} karakter).
- description: 2-3 kalimat padat merangkum urgensi dan arsitektur sistem (Maksimal {$limits['description']} karakter).
- problem_solution.problem: 1 paragraf singkat 2 kalimat mengenai kendala lapangan (Maksimal {$limits['problem']} karakter) format <p>...</p>.
- problem_solution.solution: 1 paragraf singkat 2 kalimat mengenai solusi terapan (Maksimal {$limits['solution']} karakter) format <p>...</p>.
- benefits: 3-4 poin ringkas dampak penerapan (Maksimal TOTAL {$limits['benefits']} karakter plain text) format <ul><li><strong>Judul:</strong> Penjelasan 5-7 kata.</li></ul>.
- specifications: 4 poin ringkas komponen/sensor/konektivitas (Maksimal TOTAL {$limits['specifications']} karakter plain text) format <ul><li><strong>Komponen:</strong> Spek ringkas.</li></ul>.

Format output HARUS berupa objek JSON valid MURNI tanpa markdown codeblock pembungkus (tanpa ```json ... ```):
{
  "name": "Smart Agro Drone",
  "title": "SISTEM MONITORING PERTANIAN PRESISI BERBASIS IOT DAN AI",
  "subtitle": "Otomasi Pemantauan Tanaman Presisi Real-Time",
  "category": "Smart Agriculture",
  "description": "Platform pemantauan tanaman berbasis IoT dan citra multispektral drone untuk meningkatkan produktivitas pertanian secara efisien dan ramah lingkungan.",
  "problem_solution": {
    "title": "PROBLEM–SOLUTION",
    "problem": "<p>Pemantauan lahan pertanian secara manual membutuhkan waktu lama dan rawan keterlambatan deteksi hama.</p>",
    "solution": "<p>Sistem ini mengintegrasikan drone multispektral dan AI untuk mendeteksi kesehatan tanaman secara presisi.</p>"
  },
  "benefits": {
    "title": "MANFAAT",
    "content": "<ul><li><strong>Efisiensi Waktu:</strong> Mengurangi durasi survei lahan hingga 60%.</li><li><strong>Akurasi Tinggi:</strong> Deteksi dini hama dengan akurasi 94.5%.</li><li><strong>Hemat Biaya:</strong> Optimasi penggunaan pupuk dan pestisida.</li></ul>"
  },
  "specifications": {
    "title": "SPESIFIKASI",
    "content": "<ul><li><strong>MCU/Processor:</strong> Raspberry Pi Compute Module 4</li><li><strong>Sensor:</strong> Multispectral Camera & NDVI Sensor</li><li><strong>Komunikasi:</strong> LoRaWAN & 4G Telemetry Link</li><li><strong>Daya:</strong> LiPo 6S 10000mAh Battery</li></ul>"
  },
  "layout_preset": "{$preset}"
}

Gunakan Bahasa Indonesia formal baku yang elegan, berwawasan ilmiah, meyakinkan, serta ringkas dan padat.
INSTRUCTION;

        $userPrompt = "Topik / Ide Riset Proyek: \"{$topicPrompt}\"";
        if (! empty($context['category'])) {
            $userPrompt .= "\nKategori yang Diinginkan: ".$context['category'];
        }
        if (! empty($context['notes'])) {
            $userPrompt .= "\nCatatan Tambahan: ".$context['notes'];
        }

        $rawResponse = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
        $cleanJson = self::cleanJsonOutput($rawResponse);

        $decoded = json_decode($cleanJson, true);
        if (! is_array($decoded) || empty($decoded['name'])) {
            Log::warning('AI Generation returned invalid JSON structure: '.$rawResponse);
            throw new \RuntimeException('AI mengembalikan respon yang tidak dapat diurai. Silakan coba kembali.');
        }

        // Apply strict post-processing trimming to guarantee 100% compliance with A4 layout limits
        $decoded['name'] = self::fitText($decoded['name'] ?? '', 40);
        $decoded['title'] = self::fitText($decoded['title'] ?? '', $limits['title']);
        $decoded['subtitle'] = self::fitText($decoded['subtitle'] ?? '', $limits['subtitle']);
        $decoded['description'] = self::fitParagraph($decoded['description'] ?? '', $limits['description'], false);

        if (isset($decoded['problem_solution']) && is_array($decoded['problem_solution'])) {
            $decoded['problem_solution']['problem'] = self::fitParagraph($decoded['problem_solution']['problem'] ?? '', $limits['problem']);
            $decoded['problem_solution']['solution'] = self::fitParagraph($decoded['problem_solution']['solution'] ?? '', $limits['solution']);
        }

        if (isset($decoded['benefits']) && is_array($decoded['benefits'])) {
            $decoded['benefits']['content'] = self::fitList($decoded['benefits']['content'] ?? '', $limits['benefits'], 4);
        }

        if (isset($decoded['specifications']) && is_array($decoded['specifications'])) {
            $decoded['specifications']['content'] = self::fitList($decoded['specifications']['content'] ?? '', $limits['specifications'], 4);
        }

        return $decoded;
    }

    /**
     * Generate or polish a single specific section (benefits, problem_solution, specifications).
     *
     * @param  array<string, mixed>  $currentData
     * @return array<string, mixed>|string
     */
    public static function generateSection(string $sectionType, string $prompt, array $currentData = []): array|string
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            throw new \RuntimeException('API Key AI belum dikonfigurasi.');
        }

        $preset = $currentData['layout_preset'] ?? 'balanced';
        $limits = self::LAYOUT_LIMITS[$preset] ?? self::LAYOUT_LIMITS['balanced'];

        $projectName = $currentData['project_name'] ?? $currentData['name'] ?? $currentData['title'] ?? 'Inovasi STAS-RG';
        $category = $currentData['category'] ?? 'Smart Agriculture';
        $description = trim(strip_tags($currentData['description'] ?? ''));
        $existingPrompt = trim(strip_tags($prompt));

        $contextSummary = "Nama Proyek: {$projectName}\nKategori: {$category}";
        if (! empty($description)) {
            $contextSummary .= "\nDeskripsi Proyek: {$description}";
        }
        if (! empty($existingPrompt) && $existingPrompt !== $description) {
            $contextSummary .= "\nCatatan/Draf Teks Saat Ini: {$existingPrompt}";
        }

        if ($sectionType === 'all_sections') {
            $systemInstruction = <<<INSTRUCTION
Anda adalah Research Assistant CoE STAS-RG Telkom University.
Berdasarkan deskripsi dan informasi proyek riset berikut, susun 4 bagian lembar informasi flyer A4 secara komprehensif, padat, dan ringkas.

ATURAN KETAT PANJANG TEKS (LAYOUT A4 PRESET: {$preset}):
Konten flyer dicetak pada 1 halaman A4, sehingga teks TIDAK BOLEH melebihi batas berikut:
1. Problem: Maksimal {$limits['problem']} karakter plain text (1 paragraf ringkas 2 kalimat latar belakang masalah) dalam format <p>...</p>.
2. Solution: Maksimal {$limits['solution']} karakter plain text (1 paragraf ringkas 2 kalimat solusi terapan) dalam format <p>...</p>.
3. Benefits: Maksimal TOTAL {$limits['benefits']} karakter plain text (3 poin manfaat ringkas: <li><strong>Judul:</strong> 5-7 kata.</li>) dalam format <ul>...</ul>.
4. Specifications: Maksimal TOTAL {$limits['specifications']} karakter plain text (4 poin spesifikasi teknis ringkas: <li><strong>Komponen:</strong> Spek ringkas.</li>) dalam format <ul>...</ul>.

Format output HARUS berupa JSON valid MURNI tanpa markdown codeblock pembungkus:
{
  "problem": "<p>Kendala...</p>",
  "solution": "<p>Solusi...</p>",
  "benefits": "<ul><li><strong>Poin:</strong> Keterangan.</li></ul>",
  "specifications": "<ul><li><strong>Komponen:</strong> Spek.</li></ul>"
}
Gunakan Bahasa Indonesia formal baku yang elegan.
INSTRUCTION;

            $raw = self::executePrompt($systemInstruction, $contextSummary, $key, $provider, $model);
            $clean = self::cleanJsonOutput($raw);
            $decoded = json_decode($clean, true);

            if (! is_array($decoded)) {
                $decoded = [
                    'problem' => "<p>{$clean}</p>",
                    'solution' => '',
                    'benefits' => '',
                    'specifications' => '',
                ];
            }

            return [
                'problem' => self::fitParagraph($decoded['problem'] ?? '', $limits['problem']),
                'solution' => self::fitParagraph($decoded['solution'] ?? '', $limits['solution']),
                'benefits' => self::fitList($decoded['benefits'] ?? '', $limits['benefits'], 4),
                'specifications' => self::fitList($decoded['specifications'] ?? '', $limits['specifications'], 4),
            ];
        }

        if ($sectionType === 'problem') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun rumusan latar belakang permasalahan nyata di lapangan berdasarkan deskripsi proyek ini dalam 1 paragraf ringkas (Maksimal {$limits['problem']} karakter) format HTML <p>...</p> MURNI. Bahasa Indonesia formal baku.";
            $userPrompt = "{$contextSummary}\nTugas: Susun rumusan Problem yang tajam, ringkas, maksimal {$limits['problem']} karakter.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanHtmlOutput($raw);

            return self::fitParagraph($clean, $limits['problem']);
        }

        if ($sectionType === 'solution') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun penjelasan solusi inovatif dan teknologi yang ditawarkan dalam 1 paragraf ringkas (Maksimal {$limits['solution']} karakter) format HTML <p>...</p> MURNI. Bahasa Indonesia formal baku.";
            $userPrompt = "{$contextSummary}\nTugas: Susun penjelasan Solution yang menjawab masalah, maksimal {$limits['solution']} karakter.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanHtmlOutput($raw);

            return self::fitParagraph($clean, $limits['solution']);
        }

        if ($sectionType === 'problem_solution') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun bagian Problem (Maksimal {$limits['problem']} karakter) dan Solution (Maksimal {$limits['solution']} karakter) dalam format JSON MURNI: {\"problem\": \"<p>...</p>\", \"solution\": \"<p>...</p>\"}. Bahasa Indonesia formal.";
            $userPrompt = "{$contextSummary}\nTugas: Susun problem dan solution ringkas.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanJsonOutput($raw);
            $decoded = json_decode($clean, true);

            if (! is_array($decoded)) {
                $decoded = ['problem' => "<p>{$raw}</p>", 'solution' => ''];
            }

            return [
                'problem' => self::fitParagraph($decoded['problem'] ?? '', $limits['problem']),
                'solution' => self::fitParagraph($decoded['solution'] ?? '', $limits['solution']),
            ];
        }

        if ($sectionType === 'benefits') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun 3 poin manfaat utama dan dampak riset inovasi ini (Maksimal TOTAL {$limits['benefits']} karakter) dalam format HTML <ul><li><strong>Judul:</strong> Keterangan 5-7 kata.</li></ul> MURNI. Bahasa Indonesia formal.";
            $userPrompt = "{$contextSummary}\nTugas: Buat 3 poin manfaat ringkas dan padat, maksimal total {$limits['benefits']} karakter.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanHtmlOutput($raw);

            return self::fitList($clean, $limits['benefits'], 3);
        }

        if ($sectionType === 'specifications') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun 4 daftar spesifikasi teknis realistis (Maksimal TOTAL {$limits['specifications']} karakter) dalam format HTML <ul><li><strong>Komponen:</strong> Spek ringkas.</li></ul> MURNI. Bahasa Indonesia.";
            $userPrompt = "{$contextSummary}\nTugas: Buat 4 poin spesifikasi teknis ringkas, maksimal total {$limits['specifications']} karakter.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanHtmlOutput($raw);

            return self::fitList($clean, $limits['specifications'], 4);
        }

        // Generic description / text polishing
        $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun deskripsi ilmiah ringkas (2-3 kalimat padat, maksimal {$limits['description']} karakter) untuk proyek riset ini. Bahasa Indonesia formal.";
        $userPrompt = "{$contextSummary}\nTugas: Susun deskripsi proyek yang menarik, padat, dan tidak melebihi {$limits['description']} karakter.";

        $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);

        return self::fitParagraph(trim($raw), $limits['description'], false);
    }

    /**
     * Send prompt to Gemini or OpenAI API and return text response.
     */
    private static function executePrompt(
        string $systemInstruction,
        string $userPrompt,
        string $apiKey,
        string $provider,
        string $model
    ): string {
        try {
            if ($provider === 'gemini') {
                $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

                $response = Http::timeout(60)
                    ->connectTimeout(20)
                    ->retry(2, 500, throw: false)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'x-goog-api-key' => $apiKey,
                    ])
                    ->post($endpoint, [
                        'systemInstruction' => [
                            'parts' => [
                                ['text' => $systemInstruction],
                            ],
                        ],
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $userPrompt],
                                ],
                            ],
                        ],
                        'generationConfig' => [
                            'temperature' => 0.4,
                            'topP' => 0.95,
                        ],
                    ]);

                if (! $response->successful()) {
                    $errorMsg = $response->json('error.message') ?: $response->body();
                    throw new \RuntimeException("Google Gemini API Error: {$errorMsg}");
                }

                $json = $response->json();

                return $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
            }

            // OpenAI / Compatible
            $endpoint = SystemSetting::get('ai_custom_endpoint') ?: 'https://api.openai.com/v1/chat/completions';
            $response = Http::timeout(60)
                ->connectTimeout(20)
                ->retry(2, 500, throw: false)
                ->withToken($apiKey)
                ->post($endpoint, [
                    'model' => $model ?: 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemInstruction],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.4,
                ]);

            if (! $response->successful()) {
                throw new \RuntimeException('OpenAI API Error: '.$response->body());
            }

            $json = $response->json();

            return $json['choices'][0]['message']['content'] ?? '';
        } catch (ConnectionException $e) {
            throw new \RuntimeException('Koneksi ke server AI mengalami timeout (waktu habis). Silakan periksa koneksi internet Anda atau coba beberapa saat lagi.');
        } catch (\Throwable $e) {
            // Sanitize potential API key from error message to prevent leaking in UI
            $msg = preg_replace('/key=[a-zA-Z0-9_\-\.]+/i', 'key=***', $e->getMessage());
            $msg = preg_replace('/AIzaSy[a-zA-Z0-9_\-]+/i', 'AIzaSy***', $msg);
            throw new \RuntimeException($msg);
        }
    }

    /**
     * Clean raw string containing markdown ```json ... ``` into pure JSON string.
     */
    private static function cleanJsonOutput(string $raw): string
    {
        $raw = trim($raw);
        if (preg_match('/^```(?:json)?\s*([\s\S]*?)\s*```$/i', $raw, $matches)) {
            $raw = trim($matches[1]);
        }

        // Find outer curly brackets if extra text present
        $firstBrace = strpos($raw, '{');
        $lastBrace = strrpos($raw, '}');
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $raw = substr($raw, $firstBrace, $lastBrace - $firstBrace + 1);
        }

        return $raw;
    }

    /**
     * Clean HTML code fence from AI response.
     */
    private static function cleanHtmlOutput(string $raw): string
    {
        $raw = trim($raw);
        if (preg_match('/^```(?:html)?\s*([\s\S]*?)\s*```$/i', $raw, $matches)) {
            $raw = trim($matches[1]);
        }

        return $raw;
    }
}

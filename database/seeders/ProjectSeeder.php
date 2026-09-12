<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create([
            'name' => 'Administrator STAS-RG',
            'email' => 'admin@stasrg.internal',
        ]);

        // 1. Reference Project from User's Image (Cage Monitoring)
        Project::create([
            'user_id' => $user->id,
            'name' => 'Cage Monitoring IoT',
            'category' => 'Smart Agriculture',
            'subtitle' => 'CoE STAS-RG x Peternakan UMKM Cilengkrang',
            'title' => 'CAGE MONITORIONG',
            'description' => 'Sistem monitoring kebersihan kandang dengan menggunakan beberapa sensor yang dikalibrasi dengan udara bersih. Sistem ini diintegrasikan dengan teknologi IoT. Sehingga dapat dikontrol secara remote yang telah diterapkan di Peternakan UMKM Cilengkrang.',
            'benefits' => [
                'title' => 'MANFAAT',
                'content' => 'Modul kebersihan ini digunakan untuk mengukur tingkat gas amonia dan suhu dalam kandang ternak untuk menginformasikan kepada user terkait jadwal pembersihan kandang yang optimal.',
            ],
            'specifications' => [
                'title' => 'SPESIFIKASI',
                'content' => 'Dengan sensor MQ135 modul cage monitoring memberikan pembacaan tingkat partikel gas Amonia di udara dan sensor DHT22 untuk memberikan pembacaan suhu di lingkungan sekitar.',
            ],
            'problem_solution' => [
                'title' => 'PROBLEM–SOLUTION',
                'problem' => 'Kualitas telur ayam menurun akibat pemantauan kondisi kandang yang tidak rutin. Dampaknya: stres ayam, risiko penyakit, dan kerugian ekonomi bagi peternakan.',
                'solution' => 'Sistem monitoring kandang menggunakan IoT, secara real-time, dan peternak mendapat notifikasi otomatis saat kondisi tidak ideal.',
            ],
            'project_url' => 'https://tel-u.ac.id/stasrg',
            'footer_website' => 'tel-u.ac.id/stasrg',
            'footer_instagram' => '@stas.rg',
            'footer_youtube' => '@stas_rg',
            'status' => 'published',
        ]);

        // 2. Additional sample project (Drone Telemetry)
        Project::create([
            'user_id' => $user->id,
            'name' => 'Drone Telemetry Edge AI',
            'category' => 'Aviation & AI',
            'subtitle' => 'CoE STAS-RG x PT Dirgantara Indonesia',
            'title' => 'AUTONOMOUS DRONE TELEMETRY',
            'description' => 'Platform monitoring dan deteksi anomali pada telemetri drone otonom menggunakan pemrosesan Edge AI real-time berbasis jaringan sensor terdistribusi.',
            'benefits' => [
                'title' => 'MANFAAT',
                'content' => 'Mendeteksi potensi kegagalan sistem penerbangan sebelum terjadi insiden dan memperpanjang masa pakai baterai hingga 25%.',
            ],
            'specifications' => [
                'title' => 'SPESIFIKASI',
                'content' => 'Mikrokontroler STM32F4, modul LoRa SX1276 frekuensi 915MHz, modul GPS NEO-M8N, dan Edge AI Accelerator Coral TPU.',
            ],
            'problem_solution' => [
                'title' => 'PROBLEM–SOLUTION',
                'problem' => 'Keterlambatan transmisi data telemetri sering menyebabkan respon mitigasi terlambat pada drone otonom jarak jauh.',
                'solution' => 'Algoritma kompresi data adaptif dan inferensi AI di sisi drone untuk pengambilan keputusan darurat seketika.',
            ],
            'project_url' => 'https://tel-u.ac.id/stasrg',
            'footer_website' => 'tel-u.ac.id/stasrg',
            'footer_instagram' => '@stas.rg',
            'footer_youtube' => '@stas_rg',
            'status' => 'published',
        ]);

        // 3. Draft sample project
        Project::create([
            'user_id' => $user->id,
            'name' => 'Smart Hydroponic Nutrient Controller',
            'category' => 'Smart Agriculture',
            'subtitle' => 'CoE STAS-RG x AgroTech Bandung',
            'title' => 'SMART HYDROPONIC CONTROLLER',
            'description' => 'Sistem automasi nutrisi hidroponik presisi dengan kontrol EC dan pH otomatis berbasis machine learning.',
            'benefits' => [
                'title' => 'MANFAAT',
                'content' => 'Menghemat penggunaan nutrisi AB mix hingga 30% dan menjaga laju pertumbuhan sayuran hidroponik tetap konsisten.',
            ],
            'specifications' => [
                'title' => 'SPESIFIKASI',
                'content' => 'Sensor EC analog, sensor pH meter pro, 4x pompa peristaltik 12V, ESP32 dual-core dengan konektivitas WiFi/BLE.',
            ],
            'problem_solution' => [
                'title' => 'PROBLEM–SOLUTION',
                'problem' => 'Fluktuasi pH dan ppm air nutrisi yang terlambat disesuaikan menyebabkan tanaman layu dan penurunan hasil panen.',
                'solution' => 'Pengontrolan otomatis dosis larutan nutrisi secara gradual berdasarkan sensor feedback loop real-time.',
            ],
            'project_url' => 'https://tel-u.ac.id/stasrg',
            'footer_website' => 'tel-u.ac.id/stasrg',
            'footer_instagram' => '@stas.rg',
            'footer_youtube' => '@stas_rg',
            'status' => 'draft',
        ]);
    }
}

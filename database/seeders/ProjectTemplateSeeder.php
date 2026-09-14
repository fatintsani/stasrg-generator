<?php

namespace Database\Seeders;

use App\Models\ProjectTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $adminId = $admin?->id;

        $templates = [
            // 1. Template Brosur A4 Lipat 3 (brochure_trifold)
            [
                'name' => 'Brosur Inovasi Lipat 3 Riset STAS-RG',
                'category' => 'Smart Agriculture & IoT',
                'description' => 'Template brosur pameran dan leaflet inovasi lipat 3 (trifold) 3 panel modular untuk diseminasi produk teknologi riset, expo inovasi, dan profil kemitraan industri.',
                'design_style' => 'modern_split',
                'doc_format' => 'brochure_trifold',
                'layout_preset' => 'balanced',
                'color_theme' => 'stas_official',
                'print_mode' => 'light',
                'boilerplate_type' => 'stas_default',
                'is_system' => true,
                'usage_count' => 12,
                'default_data' => [
                    'title' => 'SERI INOVASI SMART AQUACULTURE & SENSING',
                    'subtitle' => 'Center of Excellence STAS-RG • Telkom University',
                    'description' => 'Portofolio inovasi teknologi terintegrasi dari Center of Excellence STAS-RG untuk modernisasi sektor perikanan darat dan pemantauan kualitas perairan otonom.',
                    'footer_website' => 'www.stas-rg.com',
                    'footer_instagram' => '@stas.rg',
                    'footer_youtube' => '@stas_rg',
                    'social_links' => [
                        ['platform' => 'website', 'value' => 'www.stas-rg.com'],
                        ['platform' => 'instagram', 'value' => '@stas.rg'],
                        ['platform' => 'youtube', 'value' => '@stas_rg'],
                    ],
                    'problem_solution' => [
                        'panels' => [
                            [
                                'id' => 1,
                                'title' => 'Smart Water Quality Node',
                                'subtitle' => 'Multi-Parameter Water Sensing',
                                'category' => 'IoT Sensing',
                                'description' => '<p>Perangkat telemetri pemantau kondisi fisik dan kimia air kolam budidaya secara kontinu dengan sensor terkalibrasi.</p>',
                                'benefits' => '<p>• Deteksi dini penurunan kadar oksigen terlarut<br>• Notifikasi instan ke WhatsApp pembudidaya<br>• Efisiensi biaya monitoring manual hingga 70%</p>',
                                'specifications' => '<p>• Sensor: Dissolved Oxygen (DO), pH, TDS, Suhu<br>• Komunikasi: LoRaWAN &amp; NB-IoT<br>• Catu Daya: Solar Cell 10Wp + Li-Ion Battery</p>',
                                'problem' => '<p>Kematian massal ikan akibat perubahan parameter air mendadak yang terlambat diketahui.</p>',
                                'solution' => '<p>Sensor terapung otonom yang mengirim peringatan dini sebelum kondisi air kritis.</p>',
                                'project_url' => 'https://www.stas-rg.com',
                                'image_url' => null,
                            ],
                            [
                                'id' => 2,
                                'title' => 'Autonomous Fish Feeder',
                                'subtitle' => 'Solar Powered Smart Feeder',
                                'category' => 'Automation System',
                                'description' => '<p>Dispenser pakan cerdas terjadwal berbasis takaran presisi dan pemantauan nafsu makan ikan berbasis AI vision.</p>',
                                'benefits' => '<p>• Penghematan Feed Conversion Ratio (FCR) 15-20%<br>• Penjadwalan pemberian pakan via mobile app<br>• Menghindari penumpukan amonia dari pakan sisa</p>',
                                'specifications' => '<p>• Kapasitas Hopper: 50 kg pelet pakan<br>• Mekanisme: Lontar putar servo hingga 10 meter<br>• Kontroler: ESP32 + RTC High Precision</p>',
                                'problem' => '<p>Pemberian pakan konvensional sering tidak merata dan membuang pelet mahal ke dasar kolam.</p>',
                                'solution' => '<p>Penebaran pakan terukur otomatis dengan radius lontar dinamis sesuai umur ikan.</p>',
                                'project_url' => 'https://www.stas-rg.com',
                                'image_url' => null,
                            ],
                            [
                                'id' => 3,
                                'title' => 'CoE STAS-RG Aquaculture Hub',
                                'subtitle' => 'Ekosistem Riset Terapan Terpadu',
                                'category' => 'Center of Excellence',
                                'description' => '<p>Pusat Unggulan Riset STAS Telkom University menjalin kemitraan riset terapan dengan industri, peternak, dan pemangku kebijakan.</p>',
                                'benefits' => '<p>• Konsultasi implementasi IoT Smart Farming<br>• Pendampingan hilirisasi prototipe ke industri<br>• Akses fasilitas lab telekomunikasi &amp; sensorik</p>',
                                'specifications' => '<p>• Lab: Gedung Riset Telkom University Bandung<br>• Fokus: Sensing, Automation, Telecommunication<br>• Kerjasama: Industri, Hibah Kedaireka, BUMN</p>',
                                'problem' => '<p>Jarak antara inovasi riset akademisi kampus dengan kebutuhan riil industri pertanian.</p>',
                                'solution' => '<p>CoE STAS-RG menjembatani riset siap pakai dengan validasi lapangan langsung.</p>',
                                'project_url' => 'https://www.stas-rg.com',
                                'image_url' => null,
                            ],
                        ],
                    ],
                ],
                'layout_schema' => [
                    'canvas' => [
                        'format' => 'brochure_trifold',
                        'width' => 1123,
                        'height' => 794,
                        'padding' => '24px 20px 20px 20px',
                        'orientation' => 'landscape',
                    ],
                    'blocks' => [
                        ['id' => 'block_header', 'type' => 'header', 'visible' => true, 'colSpan' => 12],
                        ['id' => 'block_media', 'type' => 'media', 'visible' => true, 'colSpan' => 12, 'variant' => 'standard'],
                        ['id' => 'block_description', 'type' => 'description', 'visible' => true, 'colSpan' => 12, 'variant' => 'clean'],
                        ['id' => 'block_benefits', 'type' => 'benefits', 'visible' => true, 'colSpan' => 6, 'variant' => 'cards'],
                        ['id' => 'block_specifications', 'type' => 'specifications', 'visible' => true, 'colSpan' => 6, 'variant' => 'box'],
                        ['id' => 'block_problem_solution', 'type' => 'problem_solution', 'visible' => true, 'colSpan' => 12, 'variant' => 'merged_card'],
                        ['id' => 'block_footer_qr', 'type' => 'footer_qr', 'visible' => true, 'colSpan' => 12, 'variant' => 'full'],
                    ],
                ],
            ],

            // 2. Template A4 Flyer Publikasi Riset & Expo (a4_flyer)
            [
                'name' => 'A4 Flyer Publikasi Riset & Expo Teknologi',
                'category' => 'IoT & Automation',
                'description' => 'Template publikasi 1 halaman A4 flyer resmi untuk display poster riset, pameran produk teknologi laboratorium, dan arsip berkas luaran proyek.',
                'design_style' => 'classic_standard',
                'doc_format' => 'a4_flyer',
                'layout_preset' => 'balanced',
                'color_theme' => 'ocean_tech',
                'print_mode' => 'light',
                'boilerplate_type' => 'stas_default',
                'is_system' => true,
                'usage_count' => 28,
                'default_data' => [
                    'title' => 'IoT EDGE GATEWAY & MULTI-SENSOR ENVIRONMENTAL TELEMETRY',
                    'subtitle' => 'CENTER OF EXCELLENCE STAS-RG TELKOM UNIVERSITY',
                    'description' => '<p>Sistem telemetri cerdas multi-sensor terdistribusi yang dirancang untuk pemantauan parameter mikroklimat lingkungan dan area pertanian presisi dengan konsumsi daya ultra-rendah.</p>',
                    'benefits' => [
                        'title' => 'MANFAAT & KEUNGGULAN',
                        'content' => '<ul><li>Pemantauan parameter suhu, kelembaban, dan polutan udara secara real-time</li><li>Jangkauan transmisi nirkabel LoRaWAN hingga radius 5 km tanpa internet kabel</li><li>Dilengkapi dashboard analitik interaktif berbasis cloud &amp; mobile</li><li>Efisiensi energi tinggi dengan solar cell terintegrasi untuk operasi 24/7</li></ul>',
                    ],
                    'specifications' => [
                        'title' => 'SPESIFIKASI TEKNOLOGI',
                        'content' => '<ul><li><strong>Processor:</strong> ESP32-S3 Dual Core with Edge AI Engine</li><li><strong>Konektivitas:</strong> LoRaWAN 915 MHz, WiFi, Bluetooth 5.0 LE</li><li><strong>Sensors:</strong> BME680 (Suhu, Kelembaban, Tekanan, Gas), SCD41 (CO2)</li><li><strong>Power:</strong> 3.7V LiFePO4 5000mAh + Panel Surya 5W</li><li><strong>Enclosure:</strong> Weatherproof IP65 Industrial Casing</li></ul>',
                    ],
                    'problem_solution' => [
                        'title' => 'PROBLEM–SOLUTION',
                        'problem' => '<p>Pemantauan kondisi lapangan di area perkebunan dan remote area sering terkendala ketiadaan jaringan internet seluler yang stabil serta pasokan listrik kabel.</p>',
                        'solution' => '<p>Menghadirkan node sensor cerdas mandiri berdaya surya dengan transmisi LoRa jarak jauh yang mengagregasi data lingkungan langsung ke cloud server.</p>',
                    ],
                    'footer_website' => 'www.stas-rg.com',
                    'footer_instagram' => '@stas.rg',
                    'footer_youtube' => '@stas_rg',
                    'social_links' => [
                        ['platform' => 'website', 'value' => 'www.stas-rg.com'],
                        ['platform' => 'instagram', 'value' => '@stas.rg'],
                        ['platform' => 'youtube', 'value' => '@stas_rg'],
                    ],
                ],
                'layout_schema' => [
                    'canvas' => [
                        'format' => 'a4_flyer',
                        'width' => 794,
                        'height' => 1123,
                        'padding' => '48px 40px',
                        'orientation' => 'portrait',
                    ],
                    'blocks' => [
                        ['id' => 'block_header', 'type' => 'header', 'visible' => true, 'colSpan' => 12],
                        ['id' => 'block_media', 'type' => 'media', 'visible' => true, 'colSpan' => 12, 'variant' => 'standard'],
                        ['id' => 'block_description', 'type' => 'description', 'visible' => true, 'colSpan' => 12, 'variant' => 'clean'],
                        ['id' => 'block_benefits', 'type' => 'benefits', 'visible' => true, 'colSpan' => 6, 'variant' => 'cards'],
                        ['id' => 'block_specifications', 'type' => 'specifications', 'visible' => true, 'colSpan' => 6, 'variant' => 'box'],
                        ['id' => 'block_problem_solution', 'type' => 'problem_solution', 'visible' => true, 'colSpan' => 12, 'variant' => 'merged_card'],
                        ['id' => 'block_footer_qr', 'type' => 'footer_qr', 'visible' => true, 'colSpan' => 12, 'variant' => 'full'],
                    ],
                ],
            ],

            // 3. Template Factsheet 2-Kolom Riset Terapan (factsheet_2col)
            [
                'name' => 'Factsheet Eksekutif 2-Kolom Riset Terapan',
                'category' => 'Telecommunication & Sensing',
                'description' => 'Format ringkas 2-kolom berstruktur padat untuk brief investor, pitch mitra industri, lembar fakta hibah riset, dan katalog inovasi siap komersialisasi.',
                'design_style' => 'academic_brief',
                'doc_format' => 'factsheet_2col',
                'layout_preset' => 'balanced',
                'color_theme' => 'crimson_innovation',
                'print_mode' => 'light',
                'boilerplate_type' => 'stas_default',
                'is_system' => true,
                'usage_count' => 19,
                'default_data' => [
                    'title' => 'UAV DRONE SURVEILLANCE & REMOTE SENSING RADAR',
                    'subtitle' => 'ADVANCED SENSING & TELECOMMUNICATION GROUP',
                    'description' => '<p>Platform wahana nirawak (UAV) otonom terintegrasi dengan payload sensor multi-spektral dan radar aperture sintetis untuk surveilans maritim, kehutanan, dan inspeksi infrastruktur kritis secara presisi tinggi.</p>',
                    'benefits' => [
                        'title' => 'MANFAAT & KEUNGGULAN',
                        'content' => '<ul><li>Memangkas waktu survei medan berat hingga 85% lebih cepat dibanding metode konvensional</li><li>Menghasilkan citra pemetaan topografi beresolusi sub-sentimeter dengan integrasi RTK-GPS</li><li>Mampu membawa multi-payload kamera thermal, LiDAR, dan sensor telekomunikasi sekaligus</li><li>Jalur penerbangan waypoint otomatis dengan fitur auto return-to-home saat kondisi darurat</li></ul>',
                    ],
                    'specifications' => [
                        'title' => 'SPESIFIKASI TEKNOLOGI',
                        'content' => '<ul><li><strong>Airframe:</strong> Carbon Fiber Quadcopter Heavy-Lift Industrial Frame</li><li><strong>Flight Endurance:</strong> 45 Menit dengan payload aktif hingga 1.5 kg</li><li><strong>Komunikasi Data:</strong> MIMO COFDM Mesh Telemetry Link 5.8 GHz (Jarak &gt; 10 km)</li><li><strong>Autopilot:</strong> Pixhawk Cube Orange+ with Dual RTK Heading &amp; Obstacle Avoidance</li><li><strong>Ground Station:</strong> Ruggedized GCS Tablet with Real-Time Video Streaming</li></ul>',
                    ],
                    'problem_solution' => [
                        'title' => 'PROBLEM–SOLUTION',
                        'problem' => '<p>Inspeksi manual area berisiko tinggi (saluran transmisi listrik tegangan tinggi, zona bencana, dan perairan lepas pantai) sangat membahayakan keselamatan personel dan memakan biaya operasional besar.</p>',
                        'solution' => '<p>Mengembangkan drone nirawak berdaya jelajah tinggi dengan transmisi data terenkripsi dan sensor multi-spektral untuk inspeksi otonom yang akurat, aman, dan efisien.</p>',
                    ],
                    'footer_website' => 'www.stas-rg.com',
                    'footer_instagram' => '@stas.rg',
                    'footer_youtube' => '@stas_rg',
                    'social_links' => [
                        ['platform' => 'website', 'value' => 'www.stas-rg.com'],
                        ['platform' => 'instagram', 'value' => '@stas.rg'],
                        ['platform' => 'youtube', 'value' => '@stas_rg'],
                    ],
                ],
                'layout_schema' => [
                    'canvas' => [
                        'format' => 'factsheet_2col',
                        'width' => 794,
                        'height' => 1123,
                        'padding' => '40px 36px',
                        'orientation' => 'portrait',
                    ],
                    'blocks' => [
                        ['id' => 'block_header', 'type' => 'header', 'visible' => true, 'colSpan' => 12],
                        ['id' => 'block_description', 'type' => 'description', 'visible' => true, 'colSpan' => 12, 'variant' => 'clean'],
                        ['id' => 'block_media', 'type' => 'media', 'visible' => true, 'colSpan' => 6, 'variant' => 'standard'],
                        ['id' => 'block_problem_solution', 'type' => 'problem_solution', 'visible' => true, 'colSpan' => 6, 'variant' => 'merged_card'],
                        ['id' => 'block_benefits', 'type' => 'benefits', 'visible' => true, 'colSpan' => 6, 'variant' => 'cards'],
                        ['id' => 'block_specifications', 'type' => 'specifications', 'visible' => true, 'colSpan' => 6, 'variant' => 'box'],
                        ['id' => 'block_footer_qr', 'type' => 'footer_qr', 'visible' => true, 'colSpan' => 12, 'variant' => 'full'],
                    ],
                ],
            ],
        ];

        foreach ($templates as $templateData) {
            ProjectTemplate::updateOrCreate(
                ['name' => $templateData['name']],
                array_merge($templateData, [
                    'user_id' => $adminId,
                ])
            );
        }
    }
}

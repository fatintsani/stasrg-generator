import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Image, Check, Settings, Lightbulb, ExternalLink } from 'lucide-react';

function InstagramIcon({ style = {} }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#0D5A34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ ...style, display: 'inline-block', verticalAlign: 'middle' }}>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
    );
}

function GlobeIcon({ style = {} }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#0D5A34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ ...style, display: 'inline-block', verticalAlign: 'middle' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" x2="22" y1="12" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
    );
}

function YoutubeIcon({ style = {} }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#0D5A34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ ...style, display: 'inline-block', verticalAlign: 'middle' }}>
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
            <polygon points="10 15 15 12 10 9 10 15"/>
        </svg>
    );
}

/**
 * Standard A4 Constants at 96 CSS DPI:
 * 210mm = 793.7px (≈ 794px)
 * 297mm = 1122.5px (≈ 1123px)
 */
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

function tryParseJson(str) {
    if (!str) return null;
    if (typeof str !== 'string') return str;
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

/**
 * A4Document: The pure, fixed 1:1 document canvas matching resources/views/pdf/project.blade.php & Image 4
 */
export function A4Document({ project, isLive = false }) {
    if (!project) return null;

    // Normalization of JSON / Object data
    const benefitsData = typeof project.benefits === 'string' 
        ? (tryParseJson(project.benefits) || { content: project.benefits })
        : (project.benefits || {});
    
    const specsData = typeof project.specifications === 'string'
        ? (tryParseJson(project.specifications) || { content: project.specifications })
        : (project.specifications || {});

    const psData = typeof project.problem_solution === 'string'
        ? (tryParseJson(project.problem_solution) || { problem: '', solution: project.problem_solution })
        : (project.problem_solution || {});

    const title = project.title || (isLive ? 'JUDUL PROJECT' : '');
    const subtitle = project.subtitle || '';
    const description = project.description || '';
    
    const mainImageUrl = project.main_image_preview || (project.main_image ? (project.main_image.startsWith('http') || project.main_image.startsWith('blob:') || project.main_image.startsWith('data:') ? project.main_image : `/storage/${project.main_image}`) : null);

    const partnerLogoUrl = project.partner_logo_preview || (project.partner_logo ? (project.partner_logo.startsWith('http') || project.partner_logo.startsWith('blob:') || project.partner_logo.startsWith('data:') ? project.partner_logo : `/storage/${project.partner_logo}`) : '/assets/img/telu.png');

    const projectUrl = project.project_url || '';
    const instagram = project.footer_instagram || '@stas.rg';
    const website = project.footer_website || 'tel-u.ac.id/stasrg';
    const youtube = project.footer_youtube || '@stas_rg';

    const benefitsContent = benefitsData.content || (isLive ? '' : '');
    const specsContent = specsData.content || (isLive ? '' : '');
    const psProblem = psData.problem || '';
    const psSolution = psData.solution || '';

    return (
        <div 
            className="bg-white text-[#1a1a1a] select-none flex flex-col justify-between"
            style={{
                width: `${A4_WIDTH_PX}px`,
                height: `${A4_HEIGHT_PX}px`,
                padding: '68px 57px 57px 57px', // 18mm 15mm 15mm 15mm
                fontFamily: "'Poppins', sans-serif",
                fontSize: '9.5pt',
                lineHeight: 1.45,
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <style>{`
                .flyer-rich-content ul { list-style-type: disc !important; margin-left: 14px !important; margin-top: 2px; margin-bottom: 2px; }
                .flyer-rich-content ol { list-style-type: decimal !important; margin-left: 14px !important; margin-top: 2px; margin-bottom: 2px; }
                .flyer-rich-content li { margin-bottom: 2px; }
                .flyer-rich-content p { margin: 0; }
                .flyer-rich-content a { color: #0D5A34 !important; text-decoration: underline !important; }
            `}</style>

            {/* Top & Main Body Area */}
            <div>
                {/* Header with Logos */}
                <table style={{ width: '100%', marginBottom: '10px', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ verticalAlign: 'middle', width: '30%' }}>
                                {/* Top left intentionally empty to match design */}
                            </td>
                            <td style={{ verticalAlign: 'middle', width: '70%', textAlign: 'right' }}>
                                <img 
                                    src={partnerLogoUrl} 
                                    alt="Partner Logo" 
                                    style={{ height: '34px', marginLeft: '14px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <img 
                                    src="/assets/img/stas.png" 
                                    alt="STAS RG" 
                                    style={{ height: '34px', marginLeft: '14px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Partner / Subtitle Badge */}
                {subtitle && (
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{
                            backgroundColor: '#0d5a34',
                            color: '#ffffff',
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '9.5pt',
                            fontWeight: 600,
                            padding: '4px 12px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            letterSpacing: '0.2px',
                        }}>
                            {subtitle}
                        </div>
                    </div>
                )}

                {/* Main Title */}
                <div style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '21pt',
                    fontWeight: 800,
                    color: '#111827',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    lineHeight: 1.15,
                }}>
                    {title}
                </div>

                {/* Description */}
                {description && (
                    <div 
                        className="flyer-rich-content"
                        style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '9.5pt',
                            color: '#374151',
                            textAlign: 'justify',
                            marginBottom: '14px',
                            lineHeight: 1.45,
                        }}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                )}

                {/* Main Image */}
                <div style={{
                    width: '100%',
                    height: '205px',
                    textAlign: 'center',
                    marginBottom: '14px',
                    overflow: 'hidden',
                    borderRadius: '6px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {mainImageUrl ? (
                        <img 
                            src={mainImageUrl} 
                            alt={title} 
                            style={{
                                width: '100%',
                                height: '205px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                            }}
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af' }}>
                            <Image style={{ width: '28px', height: '28px', marginBottom: '4px', color: '#9ca3af' }} />
                            <span style={{ fontSize: '9pt', fontWeight: 600 }}>Foto Prototype / Gambar Riset</span>
                            <span style={{ fontSize: '8pt', color: '#cbd5e1' }}>Ukuran tetap 205px sesuai hasil PDF</span>
                        </div>
                    )}
                </div>

                {/* Content Sections (Manfaat, Spesifikasi, Problem-Solution) */}
                <div style={{ marginBottom: '10px' }}>
                    
                    {/* MANFAAT */}
                    {(benefitsContent || isLive) && (
                        <div style={{ marginBottom: '9px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ verticalAlign: 'top', width: '32px', paddingTop: '1px' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: '#e6f4ea',
                                                border: '1.5px solid #0d5a34',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#0d5a34',
                                            }}>
                                                <Check style={{ width: '13px', height: '13px', strokeWidth: 3 }} />
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'top', paddingLeft: '6px' }}>
                                            <div style={{
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: '10.5pt',
                                                fontWeight: 700,
                                                color: '#111827',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.3px',
                                                marginBottom: '2px',
                                            }}>
                                                {benefitsData.title || 'MANFAAT'}
                                            </div>
                                            <div 
                                                className="flyer-rich-content"
                                                style={{
                                                    fontFamily: "'Poppins', sans-serif",
                                                    fontSize: '9pt',
                                                    color: '#374151',
                                                    fontStyle: 'italic',
                                                    lineHeight: 1.4,
                                                    textAlign: 'justify',
                                                }}
                                                dangerouslySetInnerHTML={{ 
                                                    __html: benefitsContent || (isLive ? 'Deskripsi manfaat penerapan project ini...' : '') 
                                                }}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* SPESIFIKASI */}
                    {(specsContent || isLive) && (
                        <div style={{ marginBottom: '9px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ verticalAlign: 'top', width: '32px', paddingTop: '1px' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: '#e6f4ea',
                                                border: '1.5px solid #0d5a34',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#0d5a34',
                                            }}>
                                                <Settings style={{ width: '13px', height: '13px', strokeWidth: 2.5 }} />
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'top', paddingLeft: '6px' }}>
                                            <div style={{
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: '10.5pt',
                                                fontWeight: 700,
                                                color: '#111827',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.3px',
                                                marginBottom: '2px',
                                            }}>
                                                {specsData.title || 'SPESIFIKASI'}
                                            </div>
                                            <div 
                                                className="flyer-rich-content"
                                                style={{
                                                    fontFamily: "'Poppins', sans-serif",
                                                    fontSize: '9pt',
                                                    color: '#374151',
                                                    fontStyle: 'italic',
                                                    lineHeight: 1.4,
                                                    textAlign: 'justify',
                                                }}
                                                dangerouslySetInnerHTML={{ 
                                                    __html: specsContent || (isLive ? 'Spesifikasi sensor, mikrokontroler, dan komponen hardware...' : '') 
                                                }}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PROBLEM - SOLUTION */}
                    {(psProblem || psSolution || isLive) && (
                        <div style={{ marginBottom: '9px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ verticalAlign: 'top', width: '32px', paddingTop: '1px' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: '#e6f4ea',
                                                border: '1.5px solid #0d5a34',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#0d5a34',
                                            }}>
                                                <Lightbulb style={{ width: '13px', height: '13px', strokeWidth: 2.5 }} />
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'top', paddingLeft: '6px' }}>
                                            <div style={{
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: '10.5pt',
                                                fontWeight: 700,
                                                color: '#111827',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.3px',
                                                marginBottom: '2px',
                                            }}>
                                                {psData.title || 'PROBLEM–SOLUTION'}
                                            </div>
                                            <div style={{
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: '9pt',
                                                color: '#374151',
                                                fontStyle: 'italic',
                                                lineHeight: 1.4,
                                                textAlign: 'justify',
                                            }}>
                                                {(psProblem || isLive) && (
                                                    <div className="flyer-rich-content">
                                                        <strong style={{ color: '#111827', fontStyle: 'normal', fontWeight: 600 }}>Problem : </strong>
                                                        <span dangerouslySetInnerHTML={{ 
                                                            __html: psProblem || (isLive ? 'Kendala utama yang dihadapi di lapangan...' : '') 
                                                        }} />
                                                    </div>
                                                )}
                                                {(psSolution || isLive) && (
                                                    <div className="flyer-rich-content" style={{ marginTop: '3px' }}>
                                                        <strong style={{ color: '#111827', fontStyle: 'normal', fontWeight: 600 }}>Solution : </strong>
                                                        <span dangerouslySetInnerHTML={{ 
                                                            __html: psSolution || (isLive ? 'Solusi inovasi teknologi yang diterapkan...' : '') 
                                                        }} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse' 
                }}>
                    <tbody>
                        <tr>
                            <td style={{ verticalAlign: 'middle', width: '60%' }}>
                                <div style={{ 
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: '7.5pt', 
                                    color: '#374151', 
                                    fontWeight: 600, 
                                    marginBottom: '5px' 
                                }}>
                                    Kunjungi platform resmi kami untuk informasi lengkap tentang CoE STAS-RG:
                                </div>
                                <div>
                                    {instagram && (
                                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '8pt', color: '#1f2937', fontWeight: 600, paddingRight: '12px', display: 'inline-block', verticalAlign: 'middle' }}>
                                            <InstagramIcon style={{ width: '13px', height: '13px', marginRight: '4px', marginBottom: '2px' }} />
                                            <span>{instagram}</span>
                                        </span>
                                    )}
                                    {website && (
                                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '8pt', color: '#1f2937', fontWeight: 600, paddingRight: '12px', display: 'inline-block', verticalAlign: 'middle' }}>
                                            <GlobeIcon style={{ width: '13px', height: '13px', marginRight: '4px', marginBottom: '2px' }} />
                                            <span>{website}</span>
                                        </span>
                                    )}
                                    {youtube && (
                                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '8pt', color: '#1f2937', fontWeight: 600, paddingRight: '12px', display: 'inline-block', verticalAlign: 'middle' }}>
                                            <YoutubeIcon style={{ width: '13px', height: '13px', marginRight: '4px', marginBottom: '2px' }} />
                                            <span>{youtube}</span>
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td style={{ verticalAlign: 'middle', width: '40%', textAlign: 'right' }}>
                                <div style={{ display: 'inline-block', textAlign: 'right' }}>
                                    <div style={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: '7.5pt',
                                        color: '#374151',
                                        lineHeight: 1.25,
                                        display: 'inline-block',
                                        verticalAlign: 'middle',
                                        textAlign: 'right',
                                        marginRight: '14px',
                                        maxWidth: '105px',
                                        fontWeight: 600,
                                    }}>
                                        Pindai kode QR untuk Video Produk
                                    </div>
                                    <div style={{
                                        width: '54px',
                                        height: '54px',
                                        display: 'inline-block',
                                        verticalAlign: 'middle',
                                        border: '1px solid #d1d5db',
                                        padding: '2px',
                                        background: '#ffffff',
                                        borderRadius: '4px',
                                    }}>
                                        {projectUrl ? (
                                            <QRCodeSVG 
                                                value={projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`} 
                                                size={48} 
                                                level="H" 
                                                fgColor="#0d5a34"
                                                imageSettings={{
                                                    src: "/assets/img/stas.png",
                                                    x: undefined,
                                                    y: undefined,
                                                    height: 12,
                                                    width: 12,
                                                    excavate: true,
                                                }}
                                            />
                                        ) : (
                                            <div style={{ 
                                                lineHeight: '48px', 
                                                textAlign: 'center', 
                                                fontSize: '7pt', 
                                                color: '#9ca3af' 
                                            }}>
                                                [QR Code]
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Bottom Showcase Link */}
                <div style={{
                    marginTop: '6px',
                    paddingTop: '5px',
                    borderTop: '1px dashed #e5e7eb',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '7pt',
                    color: '#6b7280',
                    textAlign: 'center',
                }}>
                    Untuk informasi riset lebih lengkap & demonstrasi interaktif, kunjungi:{' '}
                    <span style={{ color: '#0d5a34', fontWeight: 700, textDecoration: 'underline' }}>
                        {typeof window !== 'undefined' ? `${window.location.origin}/showcase/${project.slug || project.id || 'detail'}` : `http://localhost:8000/showcase/${project.slug || project.id || 'detail'}`}
                    </span>
                </div>
            </div>
        </div>
    );
}

/**
 * ProjectPreview:
 * Fixed A4 aspect ratio & dimensions auto-fitted to container width
 * True 1:1 PDF preview representation without extraneous toolbars
 */
export default function ProjectPreview({ project, isLive = false }) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Measure available container width
    useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        updateWidth();

        const observer = new ResizeObserver(() => {
            updateWidth();
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Calculate dynamic scale to perfectly fit container
    const scale = containerWidth > 0 ? Math.min(1, containerWidth / A4_WIDTH_PX) : 0.6;
    const scaledHeight = A4_HEIGHT_PX * scale;

    return (
        <div className="w-full flex flex-col items-center">
            {/* Document Container */}
            <div 
                ref={containerRef} 
                className="w-full flex justify-center items-start overflow-hidden bg-zinc-100/70 dark:bg-zinc-950/70 p-2 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800"
                style={{ minHeight: `${scaledHeight + 16}px` }}
            >
                <div 
                    style={{
                        width: `${A4_WIDTH_PX}px`,
                        height: `${A4_HEIGHT_PX}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${A4_HEIGHT_PX - scaledHeight}px`,
                        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
                    }}
                    className="rounded-sm bg-white shrink-0"
                >
                    <A4Document project={project} isLive={isLive} />
                </div>
            </div>
        </div>
    );
}

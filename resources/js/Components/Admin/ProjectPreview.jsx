import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Image, Check, Settings, Lightbulb, AlertTriangle, Layers, Columns, LayoutTemplate, FileText } from 'lucide-react';
import { evaluateProjectLayoutLimits } from '../../Utils/textLimits';
import { getLayoutPreset, getDocumentFormat, getColorTheme, getPrintMode } from '../../Utils/layoutPresets';
import { SocialIcon, normalizeSocialLinks } from '../../Utils/socialPlatforms';



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
 * Universal Multi-Format Document Canvas (A4 Flyer, Roll-up Banner, Factsheet 2-Kolom, Pitch Poster)
 */
export function A4Document({ project, isLive = false, id }) {
    if (!project) return null;

    const docFormatId = project.doc_format || 'a4_flyer';
    const colorThemeId = project.color_theme || 'stas_official';
    const printModeId = project.print_mode || 'light';
    const layoutPresetId = project.layout_preset || 'balanced';

    const formatConfig = getDocumentFormat(docFormatId);
    const themeConfig = getColorTheme(colorThemeId);
    const printModeConfig = getPrintMode(printModeId);
    const presetConfig = getLayoutPreset(layoutPresetId);

    const isDark = printModeId === 'dark';
    const canvasId = id || `flyer-canvas-${project.slug || project.id || 'current'}`;

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

    const title = project.title || (isLive ? 'JUDUL PROJECT RISET' : '');
    const subtitle = project.subtitle || '';
    const description = project.description || '';
    
    const mainImageUrl = project.main_image_preview || (project.main_image ? (project.main_image.startsWith('http') || project.main_image.startsWith('blob:') || project.main_image.startsWith('data:') ? project.main_image : `/storage/${project.main_image}`) : null);

    const partnerLogoUrl = project.partner_logo_preview || (project.partner_logo ? (project.partner_logo.startsWith('http') || project.partner_logo.startsWith('blob:') || project.partner_logo.startsWith('data:') ? project.partner_logo : `/storage/${project.partner_logo}`) : '/assets/img/telu.png');

    const projectUrl = project.project_url || '';
    const socialLinks = normalizeSocialLinks(project);
    const website = project.footer_website || 'www.stas-rg.com';

    const benefitsContent = benefitsData.content || '';
    const specsContent = specsData.content || '';
    const psProblem = psData.problem || '';
    const psSolution = psData.solution || '';
    const layoutLimits = isLive && docFormatId === 'a4_flyer' ? evaluateProjectLayoutLimits(project, layoutPresetId) : null;
    
    const { styles } = presetConfig;

    // Theme dynamic style variables
    const primaryColor = themeConfig.primary;
    const accentColor = themeConfig.accent;
    const badgeBg = themeConfig.badgeBg;
    const badgeTextColor = themeConfig.badgeText;
    const canvasBg = isDark ? themeConfig.darkCanvasBg : '#ffffff';
    const textColor = isDark ? '#f3f4f6' : '#1a1a1a';
    const titleColor = isDark ? '#ffffff' : '#111827';
    const mutedColor = isDark ? '#9ca3af' : '#4b5563';
    const cardBg = isDark ? themeConfig.darkCardBg : '#f9fafb';
    const cardBorder = isDark ? '#1f293d' : '#e5e7eb';

    return (
        <div 
            id={canvasId}
            className="select-none flex flex-col justify-between transition-colors duration-200"
            style={{
                width: `${formatConfig.canvasWidth}px`,
                height: `${formatConfig.canvasHeight}px`,
                padding: formatConfig.padding,
                fontFamily: "'Poppins', sans-serif",
                fontSize: styles.descFontSize || '9.5pt',
                lineHeight: 1.45,
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: canvasBg,
                color: textColor,
            }}
        >
            <style>{`
                .flyer-rich-content ul { list-style-type: disc !important; margin-left: 14px !important; margin-top: 2px; margin-bottom: 2px; }
                .flyer-rich-content ol { list-style-type: decimal !important; margin-left: 14px !important; margin-top: 2px; margin-bottom: 2px; }
                .flyer-rich-content li { margin-bottom: 2px; }
                .flyer-rich-content p { margin: 0; }
                .flyer-rich-content a { color: ${primaryColor} !important; text-decoration: underline !important; }
            `}</style>

            {/* Live Preview Text Overflow Warning Watermark */}
            {isLive && layoutLimits?.hasErrors && (
                <div 
                    style={{
                        position: 'absolute',
                        top: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#fffbeb',
                        border: '1.5px solid #f59e0b',
                        borderRadius: '20px',
                        padding: '3px 14px',
                        color: '#92400e',
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '7.5pt',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 40,
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                    }}
                >
                    <AlertTriangle style={{ width: '13px', height: '13px', color: '#92400e', flexShrink: 0 }} />
                    <span>Teks Melebihi Batas Ideal 1 Halaman A4 ({presetConfig.mode} — Potensi Terpotong)</span>
                </div>
            )}

            {/* FORMAT 1: A4 FLYER (STANDARD) */}
            {docFormatId === 'a4_flyer' && (
                <>
                    <div>
                        {/* Header with Logos */}
                        <table style={{ width: '100%', marginBottom: styles.headerMarginBottom || '10px', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle', width: '30%' }}>
                                        {project.category && (
                                            <span style={{ 
                                                fontSize: '8pt', 
                                                fontWeight: 700, 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.5px',
                                                color: primaryColor,
                                            }}>
                                                {project.category}
                                            </span>
                                        )}
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
                                    backgroundColor: badgeBg,
                                    color: badgeTextColor,
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
                            fontSize: styles.titleFontSize || '21pt',
                            fontWeight: 800,
                            color: titleColor,
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
                                    fontSize: styles.descFontSize || '9.5pt',
                                    color: mutedColor,
                                    textAlign: 'justify',
                                    marginBottom: styles.descMarginBottom || '14px',
                                    lineHeight: 1.45,
                                }}
                                dangerouslySetInnerHTML={{ __html: description }}
                            />
                        )}

                        {/* Main Image */}
                        <div style={{
                            width: '100%',
                            height: `${styles.imageHeight}px`,
                            textAlign: 'center',
                            marginBottom: styles.descMarginBottom || '14px',
                            overflow: 'hidden',
                            borderRadius: '6px',
                            backgroundColor: cardBg,
                            border: `1px solid ${cardBorder}`,
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
                                        height: `${styles.imageHeight}px`,
                                        objectFit: 'cover',
                                        borderRadius: '6px',
                                    }}
                                />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af' }}>
                                    <Image style={{ width: styles.imageHeight > 200 ? '34px' : '24px', height: styles.imageHeight > 200 ? '34px' : '24px', marginBottom: '4px', color: '#9ca3af' }} />
                                    <span style={{ fontSize: '9pt', fontWeight: 600 }}>Foto Prototype / Gambar Riset</span>
                                    <span style={{ fontSize: '8pt', color: '#cbd5e1' }}>Ukuran {styles.imageHeight}px ({presetConfig.mode})</span>
                                </div>
                            )}
                        </div>

                        {/* Content Sections */}
                        <div style={{ marginBottom: '10px' }}>
                            {/* MANFAAT */}
                            {(benefitsContent || isLive) && (
                                <div style={{ marginBottom: styles.sectionMarginBottom || '9px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ verticalAlign: 'top', width: styles.iconSize || '32px', paddingTop: '1px' }}>
                                                    <div style={{
                                                        width: styles.iconSize || '24px',
                                                        height: styles.iconSize || '24px',
                                                        backgroundColor: isDark ? `${primaryColor}33` : themeConfig.bgAccent,
                                                        border: `1.5px solid ${primaryColor}`,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: primaryColor,
                                                    }}>
                                                        <Check style={{ width: styles.iconInnerSize || '13px', height: styles.iconInnerSize || '13px', strokeWidth: 3 }} />
                                                    </div>
                                                </td>
                                                <td style={{ verticalAlign: 'top', paddingLeft: '6px' }}>
                                                    <div style={{
                                                        fontFamily: "'Poppins', sans-serif",
                                                        fontSize: styles.sectionTitleFontSize || '10.5pt',
                                                        fontWeight: 700,
                                                        color: titleColor,
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
                                                            fontSize: styles.sectionContentFontSize || '9pt',
                                                            color: mutedColor,
                                                            fontStyle: 'italic',
                                                            lineHeight: styles.sectionLineHeight || 1.4,
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
                                <div style={{ marginBottom: styles.sectionMarginBottom || '9px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ verticalAlign: 'top', width: styles.iconSize || '32px', paddingTop: '1px' }}>
                                                    <div style={{
                                                        width: styles.iconSize || '24px',
                                                        height: styles.iconSize || '24px',
                                                        backgroundColor: isDark ? `${primaryColor}33` : themeConfig.bgAccent,
                                                        border: `1.5px solid ${primaryColor}`,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: primaryColor,
                                                    }}>
                                                        <Settings style={{ width: styles.iconInnerSize || '13px', height: styles.iconInnerSize || '13px', strokeWidth: 2.5 }} />
                                                    </div>
                                                </td>
                                                <td style={{ verticalAlign: 'top', paddingLeft: '6px' }}>
                                                    <div style={{
                                                        fontFamily: "'Poppins', sans-serif",
                                                        fontSize: styles.sectionTitleFontSize || '10.5pt',
                                                        fontWeight: 700,
                                                        color: titleColor,
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
                                                            fontSize: styles.sectionContentFontSize || '9pt',
                                                            color: mutedColor,
                                                            fontStyle: 'italic',
                                                            lineHeight: styles.sectionLineHeight || 1.4,
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
                                <div style={{ marginBottom: styles.sectionMarginBottom || '9px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ verticalAlign: 'top', width: styles.iconSize || '32px', paddingTop: '1px' }}>
                                                    <div style={{
                                                        width: styles.iconSize || '24px',
                                                        height: styles.iconSize || '24px',
                                                        backgroundColor: isDark ? `${primaryColor}33` : themeConfig.bgAccent,
                                                        border: `1.5px solid ${primaryColor}`,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: primaryColor,
                                                    }}>
                                                        <Lightbulb style={{ width: styles.iconInnerSize || '13px', height: styles.iconInnerSize || '13px', strokeWidth: 2.5 }} />
                                                    </div>
                                                </td>
                                                <td style={{ verticalAlign: 'top', paddingLeft: '6px' }}>
                                                    <div style={{
                                                        fontFamily: "'Poppins', sans-serif",
                                                        fontSize: styles.sectionTitleFontSize || '10.5pt',
                                                        fontWeight: 700,
                                                        color: titleColor,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.3px',
                                                        marginBottom: '2px',
                                                    }}>
                                                        {psData.title || 'PROBLEM–SOLUTION'}
                                                    </div>
                                                    <div style={{
                                                        fontFamily: "'Poppins', sans-serif",
                                                        fontSize: styles.sectionContentFontSize || '9pt',
                                                        color: mutedColor,
                                                        fontStyle: 'italic',
                                                        lineHeight: styles.sectionLineHeight || 1.4,
                                                        textAlign: 'justify',
                                                    }}>
                                                        {(psProblem || isLive) && (
                                                            <div className="flyer-rich-content">
                                                                <strong style={{ color: titleColor, fontStyle: 'normal', fontWeight: 600 }}>Problem : </strong>
                                                                <span dangerouslySetInnerHTML={{ 
                                                                     __html: psProblem || (isLive ? 'Kendala utama yang dihadapi di lapangan...' : '') 
                                                                }} />
                                                            </div>
                                                        )}
                                                        {(psSolution || isLive) && (
                                                            <div className="flyer-rich-content" style={{ marginTop: '3px' }}>
                                                                <strong style={{ color: titleColor, fontStyle: 'normal', fontWeight: 600 }}>Solution : </strong>
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
                    <div style={{ marginTop: 'auto', borderTop: `1px solid ${cardBorder}`, paddingTop: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle', width: '60%' }}>
                                        <div style={{ 
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: '7.5pt', 
                                            color: mutedColor, 
                                            fontWeight: 600, 
                                            marginBottom: '5px' 
                                        }}>
                                            Kunjungi platform resmi kami untuk informasi lengkap tentang CoE STAS-RG:
                                        </div>
                                        <div style={{ color: titleColor, display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'center' }}>
                                            {socialLinks.map((item, idx) => (
                                                <span key={idx} style={{ fontSize: '8pt', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <SocialIcon platform={item.platform} style={{ width: '13px', height: '13px', color: primaryColor }} />
                                                    <span>{item.value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ verticalAlign: 'middle', width: '40%', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-block', textAlign: 'right' }}>
                                            <div style={{
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: '7.5pt',
                                                color: mutedColor,
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
                                                border: `1px solid ${cardBorder}`,
                                                padding: '2px',
                                                background: '#ffffff',
                                                borderRadius: '4px',
                                            }}>
                                                {projectUrl ? (
                                                    <QRCodeSVG 
                                                        value={projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`} 
                                                        size={48} 
                                                        level="H" 
                                                        fgColor={primaryColor}
                                                    />
                                                ) : (
                                                    <div style={{ lineHeight: '48px', textAlign: 'center', fontSize: '7pt', color: '#9ca3af' }}>
                                                        [QR Code]
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Showcase link */}
                        <div style={{
                            marginTop: '6px',
                            paddingTop: '5px',
                            borderTop: `1px dashed ${cardBorder}`,
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '7pt',
                            color: mutedColor,
                            textAlign: 'center',
                        }}>
                            Untuk informasi riset lebih lengkap & demonstrasi interaktif, kunjungi:{' '}
                            <span style={{ color: primaryColor, fontWeight: 700, textDecoration: 'underline' }}>
                                {typeof window !== 'undefined' ? `${window.location.origin}/showcase/${project.slug || project.id || 'detail'}` : `http://localhost:8000/showcase/${project.slug || project.id || 'detail'}`}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* FORMAT 2: ROLL-UP BANNER / X-BANNER (600 × 1600 px) */}
            {docFormatId === 'roll_banner' && (
                <div className="flex flex-col justify-between h-full space-y-4">
                    <div>
                        {/* Top Logos Ribbon */}
                        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                    {project.category || 'INNOVATION EXPO'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <img src={partnerLogoUrl} alt="Partner" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <img src="/assets/img/stas.png" alt="STAS" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                        </div>

                        {/* Banner Title & Subtitle */}
                        <div className="mt-4 space-y-2 text-center">
                            {subtitle && (
                                <div className="inline-block text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${primaryColor}22`, color: primaryColor, border: `1px solid ${primaryColor}44` }}>
                                    {subtitle}
                                </div>
                            )}
                            <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-tight px-2" style={{ color: titleColor }}>
                                {title}
                            </h1>
                        </div>

                        {/* Giant Hero Prototype Image */}
                        <div className="mt-5 w-full h-[360px] rounded-xl overflow-hidden flex items-center justify-center border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                            {mainImageUrl ? (
                                <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-zinc-400">
                                    <Image className="w-12 h-12 mb-2 opacity-50" />
                                    <span className="font-bold text-sm">Foto Prototipe Riset (Roll-up Banner)</span>
                                </div>
                            )}
                        </div>

                        {/* Brief Summary */}
                        {description && (
                            <div 
                                className="mt-4 p-3.5 rounded-xl text-xs text-justify leading-relaxed flyer-rich-content border"
                                style={{ backgroundColor: cardBg, borderColor: cardBorder, color: mutedColor }}
                                dangerouslySetInnerHTML={{ __html: description }}
                            />
                        )}

                        {/* Banner Highlights Grid */}
                        <div className="mt-4 space-y-3">
                            {/* Problem - Solution Box */}
                            {(psProblem || psSolution) && (
                                <div className="p-4 rounded-xl border" style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Lightbulb className="w-4 h-4" />
                                        <span>{psData.title || 'PROBLEM & INOVASI SOLUSI'}</span>
                                    </h4>
                                    {psProblem && (
                                        <p className="text-[11px] mb-1.5 leading-relaxed" style={{ color: textColor }}>
                                            <strong style={{ color: primaryColor }}>Tantangan:</strong> {psProblem.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    )}
                                    {psSolution && (
                                        <p className="text-[11px] leading-relaxed" style={{ color: textColor }}>
                                            <strong style={{ color: primaryColor }}>Solusi Unggulan:</strong> {psSolution.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Key Highlights (Manfaat & Spek) */}
                            <div className="grid grid-cols-1 gap-3">
                                {benefitsContent && (
                                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                        <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>{benefitsData.title || 'KEUNGGULAN & MANFAAT'}</span>
                                        </h5>
                                        <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                    </div>
                                )}
                                {specsContent && (
                                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                        <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Settings className="w-3.5 h-3.5" />
                                            <span>{specsData.title || 'SPESIFIKASI TEKNOLOGI'}</span>
                                        </h5>
                                        <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Eye-Level Banner Footer */}
                    <div className="pt-4 border-t space-y-3" style={{ borderColor: cardBorder }}>
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                            <div className="space-y-1">
                                <div className="text-xs font-extrabold uppercase" style={{ color: primaryColor }}>
                                    Pindai Video & Live Demo
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                    Arahkan kamera smartphone ke QR code di samping
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    {socialLinks.slice(0, 3).map((item, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-zinc-700 dark:text-zinc-300">
                                            <SocialIcon platform={item.platform} style={{ width: '11px', height: '11px', color: primaryColor }} />
                                            <span>{item.value}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-1.5 bg-white rounded-lg border border-zinc-300 shrink-0">
                                <QRCodeSVG value={projectUrl ? (projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`) : 'https://www.stas-rg.com'} size={72} level="H" fgColor={primaryColor} />
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-zinc-500">
                            Center of Excellence STAS-RG • Telkom University
                        </div>
                    </div>
                </div>
            )}

            {/* FORMAT 3: FACTSHEET 2-KOLOM (794 × 1123 px) */}
            {docFormatId === 'factsheet_2col' && (
                <div className="flex flex-col justify-between h-full">
                    <div>
                        {/* Header Bar */}
                        <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: cardBorder }}>
                            <div>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                    {subtitle || 'RESEARCH FACTSHEET'}
                                </span>
                                <h1 className="text-xl font-extrabold uppercase mt-1" style={{ color: titleColor }}>
                                    {title}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <img src={partnerLogoUrl} alt="Partner" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <img src="/assets/img/stas.png" alt="STAS" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                        </div>

                        {/* 2-Column Main Split Grid */}
                        <div className="grid grid-cols-12 gap-5">
                            {/* Left Column (5/12): Problem, Solution & Technical Architecture */}
                            <div className="col-span-6 space-y-4">
                                {description && (
                                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>
                                            Executive Summary
                                        </h4>
                                        <div className="text-[11px] text-justify leading-relaxed flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: description }} />
                                    </div>
                                )}

                                {(psProblem || psSolution) && (
                                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Lightbulb className="w-3.5 h-3.5" />
                                            <span>{psData.title || 'PROBLEM & SOLUTION'}</span>
                                        </h4>
                                        {psProblem && (
                                            <div className="text-[11px] mb-2 flyer-rich-content" style={{ color: mutedColor }}>
                                                <strong style={{ color: titleColor }}>Problem:</strong>
                                                <span dangerouslySetInnerHTML={{ __html: psProblem }} />
                                            </div>
                                        )}
                                        {psSolution && (
                                            <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }}>
                                                <strong style={{ color: titleColor }}>Solution:</strong>
                                                <span dangerouslySetInnerHTML={{ __html: psSolution }} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {specsContent && (
                                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Settings className="w-3.5 h-3.5" />
                                            <span>{specsData.title || 'TECHNICAL SPECIFICATIONS'}</span>
                                        </h4>
                                        <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                    </div>
                                )}
                            </div>

                            {/* Right Column (6/12): Figure, Benefits, & Impact Metrics */}
                            <div className="col-span-6 space-y-4">
                                <div className="w-full h-[220px] rounded-xl overflow-hidden border flex items-center justify-center" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                    {mainImageUrl ? (
                                        <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-400">
                                            <Image className="w-8 h-8 mb-1 opacity-50" />
                                            <span className="text-xs font-semibold">Gambar Prototipe / Arsitektur</span>
                                        </div>
                                    )}
                                </div>

                                {benefitsContent && (
                                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>{benefitsData.title || 'KEY BENEFITS & IMPACT'}</span>
                                        </h4>
                                        <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                    </div>
                                )}

                                <div className="p-3.5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <div className="text-[10px] font-bold uppercase" style={{ color: primaryColor }}>Pindai QR Showcase</div>
                                        <div className="text-[9px] text-zinc-500">Akses demo interaktif & spesifikasi lengkap riset</div>
                                        <div className="text-[9px] font-mono text-zinc-600 dark:text-zinc-400">{website}</div>
                                    </div>
                                    <div className="p-1 bg-white border rounded shrink-0">
                                        <QRCodeSVG value={projectUrl || 'https://www.stas-rg.com'} size={52} level="H" fgColor={primaryColor} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Factsheet Footer */}
                    <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[8pt]" style={{ borderColor: cardBorder, color: mutedColor }}>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="font-semibold" style={{ color: primaryColor }}>STAS-RG</span>
                            {socialLinks.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1">
                                    <SocialIcon platform={item.platform} style={{ width: '11px', height: '11px', color: primaryColor }} />
                                    <span>{item.value}</span>
                                </span>
                            ))}
                        </div>
                        <div>Telkom University • All Rights Reserved</div>
                    </div>
                </div>
            )}

            {/* FORMAT 4: PITCH DECK POSTER 16:9 (1200 × 675 px) */}
            {docFormatId === 'pitch_poster' && (
                <div className="flex flex-col justify-between h-full">
                    {/* Top Widescreen Header */}
                    <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                        <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded" style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                {subtitle || 'DEMO DAY PITCH'}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                                {project.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <img src={partnerLogoUrl} alt="Partner" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <img src="/assets/img/stas.png" alt="STAS" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                    </div>

                    {/* 16:9 Widescreen Content Split */}
                    <div className="grid grid-cols-12 gap-6 my-auto items-center">
                        {/* Left Hero Column (5/12): Title, Abstract & Large Image */}
                        <div className="col-span-5 space-y-3">
                            <h1 className="text-2xl font-black uppercase leading-tight tracking-tight" style={{ color: titleColor }}>
                                {title}
                            </h1>
                            <div className="w-full h-[230px] rounded-xl overflow-hidden border flex items-center justify-center" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                {mainImageUrl ? (
                                    <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-400">
                                        <Image className="w-10 h-10 mb-1 opacity-50" />
                                        <span className="text-xs font-bold">16:9 Hero Figure</span>
                                    </div>
                                )}
                            </div>
                            {description && (
                                <div className="text-[11px] text-justify line-clamp-3 flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: description }} />
                            )}
                        </div>

                        {/* Right Content Column (7/12): 3 Pillars Grid */}
                        <div className="col-span-7 grid grid-cols-2 gap-3.5">
                            {/* Problem - Solution Box */}
                            <div className="col-span-2 p-3.5 rounded-xl border" style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                    <Lightbulb className="w-4 h-4" />
                                    <span>Problem & Market Solution</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-[11px]" style={{ color: textColor }}>
                                    <div><strong>Problem:</strong> {psProblem ? psProblem.replace(/<[^>]*>?/gm, '') : 'Tantangan efisiensi riset & implementasi.'}</div>
                                    <div><strong>Solution:</strong> {psSolution ? psSolution.replace(/<[^>]*>?/gm, '') : 'Inovasi sistem terintegrasi STAS-RG.'}</div>
                                </div>
                            </div>

                            {/* Benefits Box */}
                            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Manfaat Utama</span>
                                </h5>
                                <div className="text-[10.5px] flyer-rich-content line-clamp-5" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent || 'Dampak efisiensi dan keunggulan kompetitif' }} />
                            </div>

                            {/* Specs & QR Box */}
                            <div className="p-3.5 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                <div>
                                    <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Settings className="w-3.5 h-3.5" />
                                        <span>Spesifikasi Teknis</span>
                                    </h5>
                                    <div className="text-[10.5px] flyer-rich-content line-clamp-3 mb-2" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: specsContent || 'Spesifikasi sensor & arsitektur' }} />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: cardBorder }}>
                                    <div className="text-[9px] font-mono" style={{ color: mutedColor }}>Scan for Demo</div>
                                    <div className="p-1 bg-white rounded border">
                                        <QRCodeSVG value={projectUrl || 'https://www.stas-rg.com'} size={36} level="M" fgColor={primaryColor} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Widescreen Footer */}
                    <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-[9pt]" style={{ borderColor: cardBorder, color: mutedColor }}>
                        <div className="flex flex-wrap items-center gap-4 font-medium">
                            {socialLinks.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1.5">
                                    <SocialIcon platform={item.platform} style={{ width: '13px', height: '13px', color: primaryColor }} />
                                    <span>{item.value}</span>
                                </span>
                            ))}
                        </div>
                        <div className="font-bold" style={{ color: primaryColor }}>
                            Telkom University • CoE STAS-RG
                        </div>
                    </div>
                </div>
            )}

            {/* FORMAT 5: INSTAGRAM & LINKEDIN FEED 1:1 SQUARE (1080 × 1080 px) */}
            {docFormatId === 'social_feed' && (
                <div className="flex flex-col justify-between h-full space-y-4 select-none">
                    {/* Top Branding Bar */}
                    <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                        <div className="flex items-center gap-2">
                            {project.category && (
                                <span className="text-[12px] font-extrabold uppercase px-3 py-1 rounded-md tracking-wider" style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                    {project.category}
                                </span>
                            )}
                            {subtitle && (
                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md border" style={{ backgroundColor: cardBg, borderColor: cardBorder, color: primaryColor }}>
                                    {subtitle}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <img src={partnerLogoUrl} alt="Partner" className="h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <img src="/assets/img/stas.png" alt="STAS" className="h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                    </div>

                    {/* Main Title & Subtitle */}
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black uppercase leading-tight tracking-tight line-clamp-2" style={{ color: titleColor }}>
                            {title}
                        </h1>
                    </div>

                    {/* Center Hero Image */}
                    <div className="w-full h-[370px] rounded-2xl overflow-hidden border flex items-center justify-center relative" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                        {mainImageUrl ? (
                            <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-zinc-400">
                                <Image className="w-14 h-14 mb-2 opacity-50" />
                                <span className="font-bold text-sm">Foto Prototipe Riset (1:1 Feed)</span>
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg backdrop-blur-md bg-black/60 text-white text-[11px] font-bold uppercase tracking-wider">
                            Inovasi CoE STAS-RG
                        </div>
                    </div>

                    {/* Middle Info Highlights (Split 2 Boxes) */}
                    <div className="grid grid-cols-2 gap-3.5">
                        {/* Problem & Solution Box */}
                        <div className="p-3.5 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    <span>Problem & Solusi</span>
                                </h4>
                                {psProblem && (
                                    <p className="text-[11px] line-clamp-2 leading-relaxed mb-1" style={{ color: textColor }}>
                                        <strong>Tantangan:</strong> {psProblem.replace(/<[^>]*>?/gm, '')}
                                    </p>
                                )}
                                {psSolution && (
                                    <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: textColor }}>
                                        <strong>Solusi:</strong> {psSolution.replace(/<[^>]*>?/gm, '')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Benefits / Specs Box */}
                        <div className="p-3.5 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Manfaat & Keunggulan</span>
                                </h4>
                                <div className="text-[11px] flyer-rich-content line-clamp-3 leading-relaxed" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent || description || 'Penerapan teknologi tepat guna ramah lingkungan.' }} />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Feed Footer with Interactive QR Code */}
                    <div className="pt-3 border-t flex items-center justify-between gap-4" style={{ borderColor: cardBorder }}>
                        <div className="space-y-1">
                            <div className="text-xs font-black uppercase tracking-wider" style={{ color: primaryColor }}>
                                Telkom University • CoE STAS-RG
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: mutedColor }}>
                                {socialLinks.map((item, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1">
                                        <SocialIcon platform={item.platform} style={{ width: '13px', height: '13px', color: primaryColor }} />
                                        <span>{item.value}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-zinc-900 border" style={{ borderColor: cardBorder }}>
                            <div className="text-right">
                                <div className="text-[10px] font-bold uppercase" style={{ color: primaryColor }}>Scan Live Demo</div>
                                <div className="text-[9px] text-zinc-500">Video Prototipe</div>
                            </div>
                            <div className="p-1 bg-white rounded border border-zinc-200 shrink-0">
                                <QRCodeSVG value={projectUrl || 'https://www.stas-rg.com'} size={48} level="H" fgColor={primaryColor} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FORMAT 6: INSTAGRAM STORY & WA STATUS 9:16 VERTICAL (1080 × 1920 px) */}
            {docFormatId === 'social_story' && (
                <div className="flex flex-col justify-between h-full space-y-5 select-none">
                    <div>
                        {/* Top Story Header */}
                        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: cardBorder }}>
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-extrabold uppercase px-3 py-1.5 rounded-lg tracking-wider" style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                    {project.category || 'INNOVATION STORY'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <img src={partnerLogoUrl} alt="Partner" className="h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <img src="/assets/img/stas.png" alt="STAS" className="h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                        </div>

                        {/* Story Subtitle & Title */}
                        <div className="mt-6 space-y-2">
                            {subtitle && (
                                <div className="inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}33` }}>
                                    {subtitle}
                                </div>
                            )}
                            <h1 className="text-3xl sm:text-4xl font-black uppercase leading-tight tracking-tight" style={{ color: titleColor }}>
                                {title}
                            </h1>
                        </div>

                        {/* Tall Hero Prototype Image */}
                        <div className="mt-6 w-full h-[520px] rounded-3xl overflow-hidden border flex items-center justify-center relative" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                            {mainImageUrl ? (
                                <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-zinc-400">
                                    <Image className="w-16 h-16 mb-2 opacity-50" />
                                    <span className="font-bold text-base">Foto Prototipe (9:16 Story)</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-black/60 text-white text-xs font-extrabold uppercase tracking-wider">
                                CoE STAS-RG Research
                            </div>
                        </div>

                        {/* Executive Summary */}
                        {description && (
                            <div 
                                className="mt-5 p-4 rounded-2xl text-xs text-justify leading-relaxed flyer-rich-content border"
                                style={{ backgroundColor: cardBg, borderColor: cardBorder, color: mutedColor }}
                                dangerouslySetInnerHTML={{ __html: description }}
                            />
                        )}

                        {/* 3 Innovation Pillars */}
                        <div className="mt-5 space-y-3">
                            {/* Problem - Solution Box */}
                            {(psProblem || psSolution) && (
                                <div className="p-4 rounded-2xl border" style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Lightbulb className="w-4 h-4" />
                                        <span>Problem & Inovasi Solusi</span>
                                    </h4>
                                    {psProblem && (
                                        <p className="text-xs mb-1 leading-relaxed" style={{ color: textColor }}>
                                            <strong>Tantangan:</strong> {psProblem.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    )}
                                    {psSolution && (
                                        <p className="text-xs leading-relaxed" style={{ color: textColor }}>
                                            <strong>Solusi:</strong> {psSolution.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Benefits */}
                            {benefitsContent && (
                                <div className="p-4 rounded-2xl border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                    <h5 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Check className="w-4 h-4" />
                                        <span>Keunggulan & Manfaat</span>
                                    </h5>
                                    <div className="text-xs flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                </div>
                            )}

                            {/* Technical Specs */}
                            {specsContent && (
                                <div className="p-4 rounded-2xl border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                    <h5 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Settings className="w-4 h-4" />
                                        <span>Spesifikasi Sistem</span>
                                    </h5>
                                    <div className="text-xs flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Story Bottom Interactive QR Bar */}
                    <div className="pt-5 border-t space-y-4" style={{ borderColor: cardBorder }}>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border shadow-xs" style={{ borderColor: cardBorder }}>
                            <div className="space-y-1">
                                <div className="text-xs font-black uppercase" style={{ color: primaryColor }}>
                                    Pindai Video Demo & Riset
                                </div>
                                <div className="text-[11px] text-zinc-500">
                                    Arahkan kamera HP Anda ke QR code berikut:
                                </div>
                                <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                    {website}
                                </div>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-zinc-300 shrink-0">
                                <QRCodeSVG value={projectUrl || 'https://www.stas-rg.com'} size={76} level="H" fgColor={primaryColor} />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium px-2">
                            <div className="flex flex-wrap items-center gap-3">
                                {socialLinks.map((item, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1">
                                        <SocialIcon platform={item.platform} style={{ width: '12px', height: '12px', color: primaryColor }} />
                                        <span>{item.value}</span>
                                    </span>
                                ))}
                            </div>
                            <span className="font-bold" style={{ color: primaryColor }}>Telkom University</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * ProjectPreview:
 * Auto-scaled container accommodating all document formats (A4, Banner, Factsheet, 16:9 Pitch)
 */
export default function ProjectPreview({ project, isLive = false, id }) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const docFormatId = project?.doc_format || 'a4_flyer';
    const formatConfig = getDocumentFormat(docFormatId);

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

    const canvasWidth = formatConfig.canvasWidth;
    const canvasHeight = formatConfig.canvasHeight;

    // Dynamic scale to fit container width nicely
    const scale = containerWidth > 0 ? Math.min(1, (containerWidth - 24) / canvasWidth) : 0.6;
    const scaledHeight = canvasHeight * scale;

    return (
        <div className="w-full flex flex-col items-center">
            <div 
                ref={containerRef} 
                className="w-full flex justify-center items-start overflow-hidden bg-zinc-100/70 dark:bg-zinc-950/70 p-2 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800"
                style={{ minHeight: `${scaledHeight + 20}px` }}
            >
                <div 
                    style={{
                        width: `${canvasWidth}px`,
                        height: `${canvasHeight}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${canvasHeight - scaledHeight}px`,
                        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
                    }}
                    className="rounded-sm shrink-0"
                >
                    <A4Document project={project} isLive={isLive} id={id} />
                </div>
            </div>
        </div>
    );
}

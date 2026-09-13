import { toPng, toJpeg } from 'html-to-image';
import JSZip from 'jszip';

/**
 * Send export audit signal to backend.
 */
async function sendExportAuditLog(format, projectName = null, projectId = null) {
    try {
        const tokenMeta = document.querySelector('meta[name="csrf-token"]');
        const csrfToken = tokenMeta ? tokenMeta.getAttribute('content') : '';

        await fetch('/activity-logs/track-export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                format,
                project_name: projectName,
                project_id: projectId,
            }),
        });
    } catch {
        // Non-blocking catch
    }
}

/**
 * Download an A4 flyer DOM element as a high-resolution PNG image.
 * 
 * @param {HTMLElement|string} target - The DOM element or ID of the flyer canvas.
 * @param {string} filename - Desired filename for the PNG download.
 * @param {object} options - Optional overrides for html-to-image.
 * @returns {Promise<boolean>}
 */
export async function downloadFlyerAsPng(target, filename = 'flyer.png', options = {}) {
    const element = typeof target === 'string' ? document.getElementById(target) : target;

    if (!element) {
        console.error('Target element for flyer PNG export not found');
        return false;
    }

    try {
        // High pixelRatio (2.5x or 3x) produces ~300 DPI crystal clear export
        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2.5,
            backgroundColor: '#ffffff',
            cacheBust: true,
            style: {
                transform: 'none',
                margin: '0',
            },
            filter: (node) => {
                // Skip nodes marked with 'no-export' class
                if (node.classList && node.classList.contains('no-export')) {
                    return false;
                }
                return true;
            },
            ...options,
        });

        // Trigger browser download
        const link = document.createElement('a');
        link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Record audit trail
        sendExportAuditLog('png', filename.replace('.png', ''));

        return true;
    } catch (error) {
        console.error('Error generating PNG flyer:', error);
        throw error;
    }
}

/**
 * Download an A4 flyer DOM element as a high-resolution JPG image.
 */
export async function downloadFlyerAsJpg(target, filename = 'flyer.jpg', options = {}) {
    const element = typeof target === 'string' ? document.getElementById(target) : target;

    if (!element) {
        console.error('Target element for flyer JPG export not found');
        return false;
    }

    try {
        const dataUrl = await toJpeg(element, {
            quality: 0.95,
            pixelRatio: 2.5,
            backgroundColor: '#ffffff',
            cacheBust: true,
            style: {
                transform: 'none',
                margin: '0',
            },
            ...options,
        });

        const link = document.createElement('a');
        link.download = filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? filename : `${filename}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        sendExportAuditLog('jpg', filename.replace(/\.(jpg|jpeg)$/, ''));

        return true;
    } catch (error) {
        console.error('Error generating JPG flyer:', error);
        throw error;
    }
}

/**
 * Universal Multi-Format Image Exporter (PNG or JPG) with custom pixel ratios.
 * 
 * @param {HTMLElement|string} target - The DOM element or ID of the canvas.
 * @param {string} filename - Output filename.
 * @param {'png'|'jpg'} format - Image format ('png' or 'jpg').
 * @param {object} options - Overrides for html-to-image.
 * @returns {Promise<boolean>}
 */
export async function downloadElementAsImage(target, filename = 'export', format = 'png', options = {}) {
    if (format === 'jpg' || format === 'jpeg') {
        return await downloadFlyerAsJpg(target, `${filename}.jpg`, options);
    }
    return await downloadFlyerAsPng(target, `${filename}.png`, options);
}

/**
 * Copy the rendered visual canvas directly to the user's OS Clipboard as PNG.
 * Enables instant pasting (Ctrl+V) into WhatsApp Web, Figma, Canva, Discord, etc.
 * 
 * @param {HTMLElement|string} target - The DOM element or ID of the canvas.
 * @param {object} options - Overrides for html-to-image.
 * @returns {Promise<boolean>}
 */
export async function copyElementToClipboard(target, options = {}) {
    const element = typeof target === 'string' ? document.getElementById(target) : target;

    if (!element) {
        throw new Error('Elemen canvas tidak ditemukan untuk disalin.');
    }

    try {
        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2.0,
            backgroundColor: '#ffffff',
            cacheBust: true,
            style: {
                transform: 'none',
                margin: '0',
            },
            filter: (node) => {
                if (node.classList && node.classList.contains('no-export')) {
                    return false;
                }
                return true;
            },
            ...options,
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();

        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob,
                }),
            ]);
            sendExportAuditLog('clipboard_copy');
            return true;
        } else {
            throw new Error('Clipboard API tidak didukung pada peramban ini.');
        }
    } catch (error) {
        console.error('Error copying element to clipboard:', error);
        throw error;
    }
}

/**
 * Print the flyer directly using browser print dialog with pure A4 layout styling.
 * 
 * @param {HTMLElement|string} target - The DOM element or ID of the flyer canvas.
 * @param {string} documentTitle - Document title for the print job.
 */
export function printFlyer(target, documentTitle = 'Flyer STAS-RG') {
    const element = typeof target === 'string' ? document.getElementById(target) : target;

    // Record print audit log
    sendExportAuditLog('print', documentTitle);

    if (!element) {
        console.error('Target element for flyer print not found');
        window.print();
        return;
    }

    // Create an isolated hidden iframe for printing to avoid printing admin UI
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.zIndex = '-9999';

    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;

    // Collect all stylesheet links and inline styles from current page
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((node) => node.outerHTML)
        .join('\n');

    frameDoc.open();
    frameDoc.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>${documentTitle}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
                ${styles}
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        box-sizing: border-box;
                    }
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        width: 210mm;
                        height: 297mm;
                        overflow: hidden;
                    }
                    .print-container {
                        width: 210mm !important;
                        height: 297mm !important;
                        max-width: 210mm !important;
                        max-height: 297mm !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    ${element.outerHTML}
                </div>
            </body>
        </html>
    `);
    frameDoc.close();

    // Trigger print once iframe resources are ready
    setTimeout(() => {
        try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
        } catch (err) {
            console.error('Print iframe error, falling back to window.print():', err);
            window.print();
        } finally {
            setTimeout(() => {
                if (document.body.contains(printFrame)) {
                    document.body.removeChild(printFrame);
                }
            }, 2000);
        }
    }, 500);
}

/**
 * Capture an A4 flyer DOM element as a high-resolution PNG data URL.
 * 
 * @param {HTMLElement|string} target - The DOM element or ID of the flyer canvas.
 * @param {object} options - Optional overrides for html-to-image.
 * @returns {Promise<string>}
 */
export async function captureFlyerToDataUrl(target, options = {}) {
    const element = typeof target === 'string' ? document.getElementById(target) : target;

    if (!element) {
        throw new Error('Target element for flyer capture not found');
    }

    return await toPng(element, {
        quality: 1.0,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
            transform: 'none',
            margin: '0',
        },
        filter: (node) => {
            if (node.classList && node.classList.contains('no-export')) {
                return false;
            }
            return true;
        },
        ...options,
    });
}

/**
 * Bundle multiple flyer data URLs into a single .zip file and trigger download.
 * 
 * @param {Array<{ filename: string, dataUrl: string, projectName?: string }>} files - Array of files to pack.
 * @param {string} zipFilename - Output zip filename.
 * @returns {Promise<boolean>}
 */
export async function createZipFromFlyerImages(files, zipFilename = 'STAS-RG_Flyers_Batch.zip') {
    if (!files || files.length === 0) {
        throw new Error('No files provided to bundle into ZIP');
    }

    const zip = new JSZip();

    files.forEach(({ filename, dataUrl }) => {
        const base64Data = dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const safeName = filename.endsWith('.png') ? filename : `${filename}.png`;
        zip.file(safeName, base64Data, { base64: true });
    });

    // Add metadata summary README
    const timestamp = new Date().toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'long',
    });

    const readmeContent = `=====================================================
CoE STAS-RG - BATCH FLYER EXPORT ARCHIVE
=====================================================
Waktu Export : ${timestamp}
Total Flyer  : ${files.length} Lembar Dokumen

Daftar Berkas Dokumen Flyer:
${files.map((f, i) => `${i + 1}. ${f.filename}${f.projectName ? ` (${f.projectName})` : ''}`).join('\n')}

Format Dokumen : Gambar PNG Resolusi Tinggi (Standar A4 Cetak 300 DPI)
Dihasilkan Oleh: STAS RG Projects Platform
Lembaga        : Center of Excellence Sustainable Technology and Applied Sciences Research Group
Institusi      : Telkom University
=====================================================`;

    zip.file('README_EXPORT_INFO.txt', readmeContent);

    const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
    });

    const finalName = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    return true;
}


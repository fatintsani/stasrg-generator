/**
 * Intelligent Client-Side Image Compressor
 * Automatically scales & compresses oversized images to fit within target size
 * while maintaining maximum visual quality.
 */

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Compress an image File object.
 * 
 * @param {File} file - Original file input
 * @param {Object} options - Compression options
 * @param {number} [options.maxSizeMB=4] - Target max size in MB
 * @param {number} [options.maxWidth=2560] - Max width constraint
 * @param {number} [options.maxHeight=2560] - Max height constraint
 * @param {number} [options.initialQuality=0.88] - Starting quality factor (0.1 to 1.0)
 * @param {Function} [options.onProgress] - Callback for progress updates: ({ stage, percent, currentSize, targetSize })
 * @returns {Promise<{ file: File, previewUrl: string, originalSizeStr: string, compressedSizeStr: string, savedPercent: number, width: number, height: number, wasCompressed: boolean }>}
 */
export async function compressImage(file, options = {}) {
    const {
        maxSizeMB = 4,
        maxWidth = 2560,
        maxHeight = 2560,
        initialQuality = 0.88,
        onProgress = () => {},
    } = options;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const originalSize = file.size;

    // SVG or non-image files are returned as-is
    if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) {
        return {
            file,
            previewUrl: URL.createObjectURL(file),
            originalSizeStr: formatFileSize(originalSize),
            compressedSizeStr: formatFileSize(originalSize),
            savedPercent: 0,
            wasCompressed: false,
        };
    }

    onProgress({ stage: 'Membaca file gambar...', percent: 15, currentSize: originalSize, targetSize: maxSizeBytes });

    // Load Image
    const imageBitmap = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Gagal memuat file gambar untuk dikompresi.'));
        };
        img.src = url;
    });

    onProgress({ stage: 'Menghitung dimensi optimal...', percent: 35, currentSize: originalSize, targetSize: maxSizeBytes });

    let { width, height } = imageBitmap;

    // Calculate new dimensions preserving aspect ratio
    if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
        } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
        }
    }

    onProgress({ stage: 'Merender kanvas resolusi tinggi...', percent: 55, currentSize: originalSize, targetSize: maxSizeBytes });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: file.type === 'image/png' });

    // High quality downscaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // If PNG with transparency, keep transparent background; otherwise white bg
    if (file.type !== 'image/png') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // Determine output mime type
    let outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    
    // Convert large PNG photos to WebP / JPEG if PNG exceeds target
    if (file.type === 'image/png' && originalSize > maxSizeBytes) {
        outputMime = 'image/webp';
    }

    onProgress({ stage: 'Mengompresi data piksel...', percent: 75, currentSize: originalSize, targetSize: maxSizeBytes });

    let quality = initialQuality;
    let blob = await new Promise((resolve) => canvas.toBlob(resolve, outputMime, quality));

    // Iterative quality reduction if still exceeds max size
    let attempts = 0;
    while (blob && blob.size > maxSizeBytes && attempts < 5 && quality > 0.4) {
        attempts++;
        quality -= 0.12;
        onProgress({
            stage: `Optimasi kompresi (tahap ${attempts + 1})...`,
            percent: Math.min(75 + attempts * 5, 95),
            currentSize: blob.size,
            targetSize: maxSizeBytes,
        });
        blob = await new Promise((resolve) => canvas.toBlob(resolve, outputMime, quality));
    }

    // Fallback if still slightly larger: scale canvas down by 85%
    if (blob && blob.size > maxSizeBytes) {
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = Math.round(canvas.width * 0.85);
        fallbackCanvas.height = Math.round(canvas.height * 0.85);
        const fbCtx = fallbackCanvas.getContext('2d');
        fbCtx.imageSmoothingEnabled = true;
        fbCtx.imageSmoothingQuality = 'high';
        fbCtx.drawImage(canvas, 0, 0, fallbackCanvas.width, fallbackCanvas.height);
        blob = await new Promise((resolve) => fallbackCanvas.toBlob(resolve, outputMime, Math.max(quality, 0.5)));
    }

    if (!blob) {
        throw new Error('Gagal menghasilkan file kompresi.');
    }

    // Determine output extension
    let extension = file.name.split('.').pop() || 'jpg';
    if (outputMime === 'image/webp' && !extension.match(/webp/i)) {
        extension = 'webp';
    } else if (outputMime === 'image/jpeg' && !extension.match(/jpe?g/i)) {
        extension = 'jpg';
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}.${extension}`;

    const compressedFile = new File([blob], newFileName, {
        type: outputMime,
        lastModified: Date.now(),
    });

    const savedPercent = Math.max(0, Math.round(((originalSize - compressedFile.size) / originalSize) * 100));

    onProgress({ stage: 'Selesai!', percent: 100, currentSize: compressedFile.size, targetSize: maxSizeBytes });

    return {
        file: compressedFile,
        previewUrl: URL.createObjectURL(compressedFile),
        originalSizeStr: formatFileSize(originalSize),
        compressedSizeStr: formatFileSize(compressedFile.size),
        savedPercent,
        wasCompressed: compressedFile.size < originalSize || width !== imageBitmap.width || height !== imageBitmap.height,
        width,
        height,
    };
}

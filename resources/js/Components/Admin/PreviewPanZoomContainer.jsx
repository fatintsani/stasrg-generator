import React, { useRef, useState, useEffect } from 'react';
import { Move, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * PreviewPanZoomContainer
 * Provides interactive panning (drag-to-scroll) and zooming wrapper for flyer and document previews.
 * Resolves flexbox scroll clipping so users can freely pan/scroll in all 4 directions (left, right, top, bottom).
 */
export default function PreviewPanZoomContainer({
    children,
    zoom = 100,
    className = "",
    maxHeight = "calc(100vh - 140px)",
    showControls = true,
    showHint = true,
    onResetZoom = null,
}) {
    const containerRef = useRef(null);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
    const [isGrabbing, setIsGrabbing] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Center content whenever zoom changes to 100% or on mount
    const recenterPreview = () => {
        const container = containerRef.current;
        if (!container) return;
        const targetScrollLeft = Math.max(0, (container.scrollWidth - container.clientWidth) / 2);
        const targetScrollTop = 0;
        container.scrollTo({
            left: targetScrollLeft,
            top: targetScrollTop,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        if (zoom === 100) {
            recenterPreview();
        }
    }, [zoom]);

    // Mouse drag-to-pan handlers
    const handleMouseDown = (e) => {
        // Only trigger on primary (left) mouse click
        if (e.button !== 0) return;
        
        // Don't drag if clicking interactive form elements (inputs, buttons, links)
        if (e.target.closest('button, input, select, textarea, a')) return;

        const container = containerRef.current;
        if (!container) return;

        isDraggingRef.current = true;
        setIsGrabbing(true);
        setHasInteracted(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: container.scrollLeft,
            scrollTop: container.scrollTop,
        };
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current) return;
        const container = containerRef.current;
        if (!container) return;

        e.preventDefault();
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        container.scrollLeft = dragStartRef.current.scrollLeft - deltaX;
        container.scrollTop = dragStartRef.current.scrollTop - deltaY;
    };

    const handleMouseUpOrLeave = () => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            setIsGrabbing(false);
        }
    };

    // Touch drag-to-pan handlers (Mobile/Tablet)
    const handleTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        const container = containerRef.current;
        if (!container) return;

        const touch = e.touches[0];
        isDraggingRef.current = true;
        setIsGrabbing(true);
        setHasInteracted(true);
        dragStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            scrollLeft: container.scrollLeft,
            scrollTop: container.scrollTop,
        };
    };

    const handleTouchMove = (e) => {
        if (!isDraggingRef.current || e.touches.length !== 1) return;
        const container = containerRef.current;
        if (!container) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartRef.current.x;
        const deltaY = touch.clientY - dragStartRef.current.y;

        container.scrollLeft = dragStartRef.current.scrollLeft - deltaX;
        container.scrollTop = dragStartRef.current.scrollTop - deltaY;
    };

    const handleTouchEnd = () => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            setIsGrabbing(false);
        }
    };

    // Directional pan helpers (step by 120px)
    const panBy = (deltaX, deltaY) => {
        const container = containerRef.current;
        if (!container) return;
        container.scrollBy({
            left: deltaX,
            top: deltaY,
            behavior: 'smooth',
        });
    };

    return (
        <div className="relative w-full group/panzoom">
            {/* Main Scrollable Canvas Viewport */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ maxHeight }}
                className={`w-full overflow-auto rounded-2xl bg-zinc-100/60 dark:bg-zinc-950/40 p-2 sm:p-4 border border-zinc-200/80 dark:border-zinc-800/80 scrollbar-thin shadow-inner select-none transition-colors duration-200 ${
                    isGrabbing
                        ? 'cursor-grabbing select-none'
                        : zoom > 100
                        ? 'cursor-grab'
                        : 'cursor-default'
                } ${className}`}
            >
                {/* 
                    Inner wrapper uses min-w-full and w-max with flex + margin:auto 
                    to ensure perfectly centered preview when fits, and full 4-direction scrollability when zoomed 
                */}
                <div className="min-w-full min-h-full w-max flex items-start justify-center">
                    <div
                        style={{
                            zoom: zoom !== 100 ? `${zoom}%` : undefined,
                            margin: 'auto',
                            transformOrigin: 'top center',
                        }}
                        className="transition-all duration-150 flex justify-center py-2 px-1"
                    >
                        {children}
                    </div>
                </div>
            </div>

            {/* Floating Navigation Controls when Zoomed (> 100%) */}
            {zoom > 100 && (
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 p-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                    <button
                        type="button"
                        onClick={() => panBy(-100, 0)}
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Geser Kiri (Pan Left)"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => panBy(0, -100)}
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Geser Atas (Pan Up)"
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={recenterPreview}
                        className="p-1.5 rounded-lg text-[#0AB600] hover:bg-[#0AB600]/10 transition-colors cursor-pointer"
                        title="Pusatkan Tampilan (Recenter)"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => panBy(0, 100)}
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Geser Bawah (Pan Down)"
                    >
                        <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => panBy(100, 0)}
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Geser Kanan (Pan Right)"
                    >
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Helper Hint Badge when Zoomed */}
            {showHint && zoom > 100 && !hasInteracted && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-opacity duration-300">
                    <div className="bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-1 rounded-full shadow-lg border border-white/10 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
                        <Move className="w-3 h-3 text-[#0AB600]" />
                        <span>Klik & geser mouse untuk menggeser pratinjau</span>
                    </div>
                </div>
            )}
        </div>
    );
}

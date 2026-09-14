import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * GlobalTooltipProvider
 * 
 * Automatically enhances any element in the application with modern, animated,
 * high-contrast tooltips using either:
 * 1. data-tooltip="Teks Tooltip"
 * 2. title="Teks Tooltip" (automatically converted from browser default)
 * 
 * Optional attributes:
 * - data-tooltip-pos="top" | "bottom" | "left" | "right" (default: "top")
 * - data-tooltip-variant="dark" | "brand" | "light" | "glass" (default: "dark")
 * - data-tooltip-shortcut="Ctrl+S"
 */
export default function GlobalTooltipProvider({ children }) {
    const [tooltipState, setTooltipState] = useState({
        visible: false,
        text: '',
        shortcut: null,
        variant: 'dark',
        position: 'top',
        top: 0,
        left: 0,
        actualPosition: 'top',
    });

    const activeElementRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const handlePointerOver = (e) => {
            const target = e.target.closest('[data-tooltip], [title], [data-original-title]');
            if (!target) return;

            // Extract tooltip text
            let text = target.getAttribute('data-tooltip');
            if (!text && target.hasAttribute('title')) {
                const titleVal = target.getAttribute('title');
                if (titleVal && titleVal.trim()) {
                    text = titleVal.trim();
                    target.setAttribute('data-original-title', text);
                    target.removeAttribute('title'); // Prevent native browser tooltip collision
                }
            } else if (!text && target.hasAttribute('data-original-title')) {
                text = target.getAttribute('data-original-title');
            }

            if (!text) return;

            activeElementRef.current = target;
            const pos = target.getAttribute('data-tooltip-pos') || 'top';
            const variant = target.getAttribute('data-tooltip-variant') || 'dark';
            const shortcut = target.getAttribute('data-tooltip-shortcut') || null;

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                if (activeElementRef.current !== target) return;

                const rect = target.getBoundingClientRect();
                const gap = 8;
                let actualPos = pos;
                let top = 0;
                let left = 0;

                const estWidth = Math.min(260, text.length * 7.5 + 30);
                const estHeight = 32;

                if (pos === 'top') {
                    top = rect.top - gap;
                    left = rect.left + rect.width / 2;
                    if (top < 36) {
                        actualPos = 'bottom';
                        top = rect.bottom + gap;
                    }
                } else if (pos === 'bottom') {
                    top = rect.bottom + gap;
                    left = rect.left + rect.width / 2;
                    if (top > window.innerHeight - 36) {
                        actualPos = 'top';
                        top = rect.top - gap;
                    }
                } else if (pos === 'left') {
                    top = rect.top + rect.height / 2;
                    left = rect.left - gap;
                    if (left < 100) {
                        actualPos = 'right';
                        left = rect.right + gap;
                    }
                } else if (pos === 'right') {
                    top = rect.top + rect.height / 2;
                    left = rect.right + gap;
                    if (left > window.innerWidth - 100) {
                        actualPos = 'left';
                        left = rect.left - gap;
                    }
                }

                // Keep horizontally bounded within screen
                left = Math.max(16, Math.min(window.innerWidth - 16, left));

                setTooltipState({
                    visible: true,
                    text,
                    shortcut,
                    variant,
                    position: pos,
                    top,
                    left,
                    actualPosition: actualPos,
                });
            }, 100);
        };

        const handlePointerOut = (e) => {
            const target = e.target.closest('[data-tooltip], [data-original-title]');
            if (!target) return;

            if (activeElementRef.current === target) {
                activeElementRef.current = null;
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setTooltipState((prev) => ({ ...prev, visible: false }));
            }
        };

        const handleScrollOrKey = () => {
            if (activeElementRef.current) {
                activeElementRef.current = null;
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setTooltipState((prev) => ({ ...prev, visible: false }));
            }
        };

        document.addEventListener('pointerover', handlePointerOver, { passive: true });
        document.addEventListener('pointerout', handlePointerOut, { passive: true });
        document.addEventListener('focusin', handlePointerOver, { passive: true });
        document.addEventListener('focusout', handlePointerOut, { passive: true });
        window.addEventListener('scroll', handleScrollOrKey, { passive: true });
        window.addEventListener('keydown', handleScrollOrKey, { passive: true });

        return () => {
            document.removeEventListener('pointerover', handlePointerOver);
            document.removeEventListener('pointerout', handlePointerOut);
            document.removeEventListener('focusin', handlePointerOver);
            document.removeEventListener('focusout', handlePointerOut);
            window.removeEventListener('scroll', handleScrollOrKey);
            window.removeEventListener('keydown', handleScrollOrKey);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const getVariantClasses = (variant) => {
        switch (variant) {
            case 'brand':
                return 'bg-[#0AB600] text-white border border-[#099600] font-semibold';
            case 'glass':
                return 'bg-zinc-900/90 dark:bg-zinc-950/90 text-white backdrop-blur-md border border-white/10 font-medium';
            case 'light':
                return 'bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 font-medium';
            case 'dark':
            default:
                return 'bg-zinc-900 dark:bg-[#182234] text-white border border-zinc-700/80 dark:border-zinc-700 font-medium';
        }
    };

    const getTransform = (actualPos) => {
        switch (actualPos) {
            case 'top':
                return 'translate(-50%, -100%)';
            case 'bottom':
                return 'translate(-50%, 0)';
            case 'left':
                return 'translate(-100%, -50%)';
            case 'right':
                return 'translate(0, -50%)';
            default:
                return 'translate(-50%, -100%)';
        }
    };

    return (
        <>
            {children}

            {tooltipState.visible && typeof document !== 'undefined' && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: `${tooltipState.top}px`,
                        left: `${tooltipState.left}px`,
                        transform: getTransform(tooltipState.actualPosition),
                        zIndex: 999999,
                        pointerEvents: 'none',
                    }}
                    className="animate-in fade-in zoom-in-95 duration-150 select-none max-w-xs"
                >
                    <div
                        className={`px-2.5 py-1.5 rounded-lg text-xs tracking-tight flex items-center gap-1.5 shadow-sm whitespace-nowrap ${getVariantClasses(
                            tooltipState.variant
                        )}`}
                    >
                        <span>{tooltipState.text}</span>
                        {tooltipState.shortcut && (
                            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/15 dark:bg-black/30 rounded text-white/90 border border-white/20">
                                {tooltipState.shortcut}
                            </kbd>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

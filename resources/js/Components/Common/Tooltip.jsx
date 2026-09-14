import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Universal Tooltip Component
 * 
 * Usage:
 * <Tooltip content="Simpan perubahan" position="top" shortcut="Ctrl+S">
 *   <button>Simpan</button>
 * </Tooltip>
 */
export default function Tooltip({
    children,
    content,
    position = 'top',
    variant = 'dark',
    shortcut = null,
    delay = 120,
    disabled = false,
    className = '',
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, actualPosition: position });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);

    const showTooltip = () => {
        if (disabled || !content) return;
        timeoutRef.current = setTimeout(() => {
            calculatePosition();
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const calculatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const gap = 8;
        let actualPos = position;

        // Approximate dimensions before render
        const estWidth = 140;
        const estHeight = 36;

        let top = 0;
        let left = 0;

        if (position === 'top') {
            top = rect.top - estHeight - gap;
            left = rect.left + rect.width / 2;
            if (top < 10) {
                actualPos = 'bottom';
                top = rect.bottom + gap;
            }
        } else if (position === 'bottom') {
            top = rect.bottom + gap;
            left = rect.left + rect.width / 2;
            if (top + estHeight > window.innerHeight - 10) {
                actualPos = 'top';
                top = rect.top - estHeight - gap;
            }
        } else if (position === 'left') {
            top = rect.top + rect.height / 2;
            left = rect.left - estWidth - gap;
            if (left < 10) {
                actualPos = 'right';
                left = rect.right + gap;
            }
        } else if (position === 'right') {
            top = rect.top + rect.height / 2;
            left = rect.right + gap;
            if (left + estWidth > window.innerWidth - 10) {
                actualPos = 'left';
                left = rect.left - estWidth - gap;
            }
        }

        // Clamp within viewport
        left = Math.max(12, Math.min(window.innerWidth - 12, left));

        setCoords({ top, left, actualPosition: actualPos });
    };

    useEffect(() => {
        if (isVisible) {
            const handleScrollOrResize = () => {
                hideTooltip();
            };
            window.addEventListener('scroll', handleScrollOrResize, { passive: true });
            window.addEventListener('resize', handleScrollOrResize);
            return () => {
                window.removeEventListener('scroll', handleScrollOrResize);
                window.removeEventListener('resize', handleScrollOrResize);
            };
        }
    }, [isVisible]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const getVariantStyles = () => {
        switch (variant) {
            case 'brand':
                return 'bg-[#0AB600] text-white border border-[#099600]';
            case 'glass':
                return 'bg-zinc-900/90 dark:bg-zinc-950/90 text-white backdrop-blur-md border border-white/10';
            case 'light':
                return 'bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700';
            case 'dark':
            default:
                return 'bg-zinc-900 dark:bg-[#182234] text-white border border-zinc-700/80 dark:border-zinc-700';
        }
    };

    return (
        <span
            ref={triggerRef}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            className={`inline-flex ${className}`}
        >
            {children}

            {isVisible && typeof document !== 'undefined' && createPortal(
                <div
                    ref={tooltipRef}
                    style={{
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        transform: coords.actualPosition === 'top' || coords.actualPosition === 'bottom' 
                            ? 'translateX(-50%)' 
                            : 'translateY(-50%)',
                        zIndex: 99999,
                        pointerEvents: 'none',
                    }}
                    className="animate-in fade-in zoom-in-95 duration-150"
                >
                    <div className={`px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-tight flex items-center gap-1.5 shadow-xs whitespace-nowrap ${getVariantStyles()}`}>
                        <span>{content}</span>
                        {shortcut && (
                            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/15 dark:bg-black/30 rounded text-white/90 border border-white/20">
                                {shortcut}
                            </kbd>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </span>
    );
}

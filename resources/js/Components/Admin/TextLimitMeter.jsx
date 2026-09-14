import React from 'react';
import { getPlainTextLength, getFormatLimits } from '../../Utils/textLimits';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export default function TextLimitMeter({
    value = '',
    limitKey,
    preset = 'balanced',
    docFormat = 'a4_flyer',
    customMax = null,
    className = '',
    showProgressBar = true,
}) {
    const limits = getFormatLimits(docFormat, preset);
    const config = limits[limitKey] || {
        max: customMax || 300,
        warn: (customMax || 300) * 0.85,
        label: 'Karakter',
    };

    const max = customMax || config.max;
    const length = getPlainTextLength(value);
    const percent = Math.min(Math.round((length / max) * 100), 100);
    const isOver = length > max;
    const isWarning = length >= config.warn && !isOver;

    let barColor = 'bg-[#0AB600]';
    let textColor = 'text-zinc-400 dark:text-zinc-500';
    let icon = null;

    if (isOver) {
        barColor = 'bg-rose-500';
        textColor = 'text-rose-600 dark:text-rose-400 font-semibold';
        icon = <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />;
    } else if (isWarning) {
        barColor = 'bg-amber-500';
        textColor = 'text-amber-600 dark:text-amber-400 font-medium';
        icon = <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />;
    } else if (length > 0) {
        textColor = 'text-zinc-500 dark:text-zinc-400';
    }

    return (
        <div className={`flex items-center justify-between gap-3 pt-1 text-[11px] ${className}`}>
            {showProgressBar && (
                <div className="flex items-center gap-1.5 flex-1 max-w-[130px]">
                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700/80 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 rounded-full ${barColor}`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            )}

            <div className={`flex items-center gap-1 ml-auto shrink-0 ${textColor}`}>
                {icon}
                <span>
                    {isOver ? (
                        <span>
                            <strong>{length}</strong>/{max} kkt (+{length - max} berlebih)
                        </span>
                    ) : (
                        <span>
                            {length}/{max} kkt
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}

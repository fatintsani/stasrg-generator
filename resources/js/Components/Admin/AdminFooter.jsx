import React from 'react';
import { Link } from '@inertiajs/react';
import { Database, ShieldCheck } from 'lucide-react';
import { useApp } from '../../Context/AppContext';

export default function AdminFooter() {
    const { t } = useApp();

    return (
        <footer className="mt-auto py-4 px-4 sm:px-6 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-[#090D16]/50 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                {/* Left: Copyright & System version */}
                <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
                    <span>{t.admin?.footer?.copyright || '© 2026 CoE STAS-RG Telkom University.'}</span>
                    <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="font-mono text-zinc-400 dark:text-zinc-500">
                        {t.admin?.footer?.version || 'STAS RG Generator v1.0.0'}
                    </span>
                </div>

                {/* Right: Database Status & Legal Links */}
                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <Database className="w-3 h-3" />
                        <span>{t.admin?.footer?.connected || 'MySQL Connected'}</span>
                    </div>

                    <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                        Privasi
                    </Link>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                        Ketentuan
                    </Link>
                </div>
            </div>
        </footer>
    );
}

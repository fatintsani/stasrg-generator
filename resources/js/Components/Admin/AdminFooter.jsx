import React from 'react';
import { Link } from '@inertiajs/react';
import { useApp } from '../../Context/AppContext';
import { Headphones } from 'lucide-react';

export default function AdminFooter() {
    const { t } = useApp();

    return (
        <footer className="mt-auto py-4 px-4 sm:px-6 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-[#090D16]/50 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                {/* Left: Copyright */}
                <div className="text-center sm:text-left">
                    <span>{t.admin?.footer?.copyright || '© 2026 CoE STAS-RG Telkom University.'}</span>
                </div>

                {/* Center / Right: Contact Support & Legal Links */}
                <div className="flex flex-wrap items-center justify-center gap-3.5">
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

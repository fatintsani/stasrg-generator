import React from 'react';
import { Link } from '@inertiajs/react';
import { useApp } from '../../Context/AppContext';
import { Headphones } from 'lucide-react';

export default function AdminFooter() {
    const { t } = useApp();

    return (
        <footer className="mt-auto py-3.5 px-4 sm:px-6 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-[#090D16]/50 transition-colors">
            <div className="max-w-7xl mx-auto space-y-2">
                {/* Row 1: Copyright on Left, Legal on Right */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <div className="text-center sm:text-left">
                        <span>{t.admin?.footer?.copyright || '© 2026 CoE STAS-RG Telkom University.'}</span>
                    </div>

                    {/* Legal Links */}
                    <div className="flex items-center gap-3 text-[11px]">
                        <Link href="/privacy" className="text-zinc-600 dark:text-zinc-400 hover:text-[#0AB600] dark:hover:text-[#0AB600] font-medium transition-colors">
                            Privasi
                        </Link>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <Link href="/terms" className="text-zinc-600 dark:text-zinc-400 hover:text-[#0AB600] dark:hover:text-[#0AB600] font-medium transition-colors">
                            Ketentuan
                        </Link>
                    </div>
                </div>

                {/* Row 2: Developed by at the very bottom with Main Brand Color #0AB600 */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/40 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>{t.footer?.developedBy || 'Developed by'} </span>
                    <Link href="/team" className="font-bold text-[#0AB600] dark:text-[#0AB600] hover:text-[#089600] dark:hover:text-[#089600] hover:underline transition-colors">
                        {t.footer?.teamTitle || 'Tim Pengembang CoE STAS-RG'}
                    </Link>
                </div>
            </div>
        </footer>
    );
}

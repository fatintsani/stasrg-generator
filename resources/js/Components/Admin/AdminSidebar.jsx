import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    Archive,
    ShieldCheck,
    Settings,
    LogOut,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    User as UserIcon,
    Sparkles,
    X,
} from 'lucide-react';
import { useApp } from '../../Context/AppContext';

export default function AdminSidebar({
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    currentPath = '/dashboard',
}) {
    const { t, language } = useApp();
    const { props: pageProps } = usePage() || { props: {} };
    const user = pageProps?.auth?.user || { name: 'Administrator', email: 'admin@stasrg.internal', role: 'admin' };

    const navItems = [
        {
            group: t.admin?.sidebar?.mainGroup || 'Utama',
            items: [
                {
                    id: 'dashboard',
                    name: t.admin?.sidebar?.dashboard || 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutDashboard,
                    active: currentPath === '/dashboard',
                    badge: null,
                },
                {
                    id: 'projects',
                    name: t.admin?.sidebar?.projects || 'Manajemen Proyek',
                    href: '#projects',
                    icon: FolderKanban,
                    active: currentPath.startsWith('/projects'),
                    badge: '4',
                },
                {
                    id: 'generator',
                    name: t.admin?.sidebar?.generator || 'Generator Dokumen',
                    href: '#generator',
                    icon: FileText,
                    active: currentPath.startsWith('/generator'),
                    badge: '28',
                },
                {
                    id: 'repository',
                    name: t.admin?.sidebar?.repository || 'Repositori Riset',
                    href: '#repository',
                    icon: Archive,
                    active: currentPath.startsWith('/repository'),
                    badge: null,
                },
            ],
        },
        {
            group: t.admin?.sidebar?.systemGroup || 'Sistem & Konfigurasi',
            items: [
                {
                    id: 'security',
                    name: t.admin?.sidebar?.security || 'Keamanan & Passkey',
                    href: '#security',
                    icon: ShieldCheck,
                    active: currentPath.startsWith('/security'),
                    badge: user.is_biometric_enabled ? 'Aktif' : null,
                    badgeColor: 'emerald',
                },
                {
                    id: 'settings',
                    name: t.admin?.sidebar?.settings || 'Pengaturan',
                    href: '#settings',
                    icon: Settings,
                    active: currentPath.startsWith('/settings'),
                    badge: null,
                },
            ],
        },
    ];

    const sidebarContent = (
        <div className="h-full flex flex-col justify-between bg-white dark:bg-[#090D16] border-r border-zinc-200/80 dark:border-zinc-800/80 transition-colors select-none">
            {/* Top: Brand Header */}
            <div>
                <div className={`h-16 px-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-zinc-200/80 dark:border-zinc-800/80`}>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 overflow-hidden group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                            <img
                                src="/assets/img/stas.png"
                                alt="STAS RG"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = '/assets/img/STAS RG.png';
                                }}
                            />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                    STAS RG <span className="text-zinc-500 dark:text-zinc-400 font-normal">Generator</span>
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
                                    Admin Console
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen(false)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)] custom-scrollbar">
                    {navItems.map((group, gIdx) => (
                        <div key={gIdx}>
                            {!isCollapsed && (
                                <p className="px-3 mb-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                    {group.group}
                                </p>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            title={isCollapsed ? item.name : undefined}
                                            className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                                item.active
                                                    ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-[#0D5A34] dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80'
                                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-850/60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-[#0D5A34] dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                                                {!isCollapsed && <span className="truncate">{item.name}</span>}
                                            </div>

                                            {!isCollapsed && item.badge && (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                                    item.badgeColor === 'emerald'
                                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom: User Card & Collapse Control */}
            <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
                {/* View Landing Page Link */}
                <Link
                    href="/"
                    title={t.admin?.sidebar?.backToHome || 'Lihat Landing Page'}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors`}
                >
                    <div className="flex items-center gap-2.5 truncate">
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        {!isCollapsed && <span className="truncate">{t.admin?.sidebar?.backToHome || 'Lihat Landing Page'}</span>}
                    </div>
                </Link>

                {/* User Pill & Quick Logout */}
                <div className={`p-2.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
                    <div className="flex items-center gap-2.5 truncate">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-[#0D5A34] dark:text-emerald-300 font-bold text-xs shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {user.name}
                                </span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {user.email}
                                </span>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <Link
                            method="post"
                            href="/logout"
                            as="button"
                            title={t.admin?.sidebar?.logout || 'Keluar'}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                {/* Desktop Collapse Toggle */}
                <div className="hidden md:flex justify-end pt-1">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? (t.admin?.sidebar?.expand || 'Perluas Sidebar') : (t.admin?.sidebar?.collapse || 'Perkecil Sidebar')}
                        className="w-full py-1.5 px-2 rounded-lg text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <>
                                <ChevronLeft className="w-4 h-4" />
                                <span>{t.admin?.sidebar?.collapse || 'Perkecil'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Fixed Sidebar */}
            <aside
                className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

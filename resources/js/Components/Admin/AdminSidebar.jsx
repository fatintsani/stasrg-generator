import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FolderKanban,
    List,
    FilePlus2,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
} from 'lucide-react';
import { useApp } from '../../Context/AppContext';
import { useAlert } from '../../Context/AlertContext';

export default function AdminSidebar({
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    currentPath = '/dashboard',
}) {
    const { t } = useApp();
    const { showConfirm } = useAlert();
    const { props: pageProps } = usePage() || { props: {} };
    const user = pageProps?.auth?.user || { name: 'Administrator', email: 'admin@stasrg.internal', role: 'admin' };
    const [isProjectsOpen, setIsProjectsOpen] = useState(
        currentPath.startsWith('/projects')
    );

    const navItems = [
        {
            id: 'dashboard',
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            active: currentPath === '/dashboard',
        },
        {
            id: 'projects',
            name: 'Projects',
            icon: FolderKanban,
            active: currentPath.startsWith('/projects'),
            children: [
                {
                    id: 'projects-all',
                    name: 'All Projects',
                    href: '/projects',
                    icon: List,
                    active: currentPath === '/projects',
                },
                {
                    id: 'projects-create',
                    name: 'Create Project',
                    href: '/projects/create',
                    icon: FilePlus2,
                    active: currentPath === '/projects/create',
                },
            ],
        },
        {
            id: 'users',
            name: 'User Approval',
            href: '/users',
            icon: Users,
            active: currentPath.startsWith('/users'),
        },
        {
            id: 'settings',
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            active: currentPath.startsWith('/settings'),
        },
    ];

    const handleProjectsToggle = () => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setIsProjectsOpen(true);
        } else {
            setIsProjectsOpen(!isProjectsOpen);
        }
    };

    const renderNavItem = (item) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
            return (
                <div key={item.id}>
                    <button
                        type="button"
                        onClick={handleProjectsToggle}
                        title={isCollapsed ? item.name : undefined}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                            item.active
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-[#0D5A34] dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
                        }`}
                    >
                        <div className="flex items-center gap-3 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-[#0D5A34] dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!isCollapsed && (
                            <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isProjectsOpen ? 'rotate-180' : ''} ${item.active ? 'text-[#0D5A34] dark:text-emerald-400' : 'text-zinc-400'}`} />
                        )}
                    </button>

                    {/* Submenu */}
                    {!isCollapsed && (
                        <AnimatePresence initial={false}>
                            {isProjectsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-4 pl-3 mt-1 space-y-0.5 border-l border-zinc-200/80 dark:border-zinc-800/80">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            return (
                                                <Link
                                                    key={child.id}
                                                    href={child.href}
                                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                                                        child.active
                                                            ? 'text-[#0D5A34] dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
                                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                                                    }`}
                                                >
                                                    <ChildIcon className={`w-3.5 h-3.5 shrink-0 ${child.active ? 'text-[#0D5A34] dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                                                    <span>{child.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.id}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    item.active
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-[#0D5A34] dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
                }`}
            >
                <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-[#0D5A34] dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>
            </Link>
        );
    };

    const handleLogout = async () => {
        const confirmed = await showConfirm({
            title: 'Konfirmasi Keluar',
            message: 'Apakah Anda yakin ingin mengakhiri sesi Admin STASIKATOR?',
            confirmText: 'Keluar Akun',
            cancelText: 'Batal',
            variant: 'danger',
        });
        if (confirmed) {
            router.post('/logout');
        }
    };

    const sidebarContent = (
        <div className="h-full flex flex-col justify-between bg-white dark:bg-[#090D16] border-r border-zinc-200/80 dark:border-zinc-800/80 transition-colors select-none">
            {/* Top: Brand Header */}
            <div>
                <div className={`h-16 px-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-zinc-200/80 dark:border-zinc-800/80`}>
                    {isCollapsed ? (
                        <button
                            type="button"
                            onClick={() => setIsCollapsed(false)}
                            title="Perluas Sidebar"
                            className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform hover:scale-105 cursor-pointer"
                        >
                            <img
                                src="/assets/img/stas.png"
                                alt="STAS RG"
                                className="w-8 h-8 object-contain"
                            />
                        </button>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2.5 overflow-hidden group"
                            >
                                <div className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                    <img
                                        src="/assets/img/stas.png"
                                        alt="STAS RG"
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="text-sm sm:text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                        STAS RG <span className="text-emerald-700 dark:text-emerald-400 font-bold">Generator</span>
                                    </span>
                                </div>
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
                    )}
                </div>

                {/* Navigation Items */}
                <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)] custom-scrollbar">
                    {navItems.map(renderNavItem)}
                </div>
            </div>

            {/* Bottom: User Card */}
            <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
                {/* User Pill & Quick Logout (Clean without background) */}
                <div className={`px-2.5 py-1.5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
                    <div className="flex items-center gap-2.5 truncate">
                        {user?.avatar_url || user?.avatar ? (
                            <img
                                src={user.avatar_url || `/storage/${user.avatar}`}
                                alt={user.name || 'User'}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#0D5A34] dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                        )}
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
                        <button
                            type="button"
                            onClick={handleLogout}
                            title="Keluar Akun"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
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
                            className="relative w-72 max-w-[85vw] h-full z-10"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

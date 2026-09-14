import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { AppProvider } from '../Context/AppContext';
import { useAlert } from '../Context/AlertContext';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import AdminHeader from '../Components/Admin/AdminHeader';
import AdminFooter from '../Components/Admin/AdminFooter';
import {
    DashboardSkeleton,
    ProjectsIndexSkeleton,
    ProjectFormSkeleton,
    ActivityLogsSkeleton,
    SettingsSkeleton,
    ProjectDetailSkeleton,
    UsersSkeleton,
    AnalyticsSkeleton,
} from '../Components/Common/Skeleton';

function getSkeletonForRoute(path = '') {
    const cleanPath = (path || '').toLowerCase();
    if (cleanPath.includes('/analytics')) return <AnalyticsSkeleton />;
    if (cleanPath.includes('/activity-logs')) return <ActivityLogsSkeleton />;
    if (cleanPath.includes('/support-tickets')) return <ProjectsIndexSkeleton />;
    if (cleanPath.includes('/media-library')) return <ProjectsIndexSkeleton />;
    if (cleanPath.includes('/projects/create') || cleanPath.includes('/edit')) return <ProjectFormSkeleton />;
    if (cleanPath.includes('/projects/') && !cleanPath.endsWith('/projects')) return <ProjectDetailSkeleton />;
    if (cleanPath.includes('/projects')) return <ProjectsIndexSkeleton />;
    if (cleanPath.includes('/settings')) return <SettingsSkeleton />;
    if (cleanPath.includes('/users')) return <UsersSkeleton />;
    return <DashboardSkeleton />;
}

export default function AdminLayout({
    children,
    title = 'Admin Dashboard',
    currentPath: propCurrentPath,
    onOpenNewProject,
}) {
    const { url, props } = usePage() || { url: '', props: {} };
    const detectedPath = url ? url.split('?')[0] : '';
    const activePath = propCurrentPath || detectedPath || '/dashboard';

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [targetPath, setTargetPath] = useState(activePath);
    const { showSuccess, showError } = useAlert();

    useEffect(() => {
        if (props.flash?.success) {
            showSuccess('Berhasil', props.flash.success);
        } else if (props.flash?.error) {
            showError('Perhatian', props.flash.error);
        }
    }, [props.flash?.success, props.flash?.error]);

    // Listen to Inertia page transitions to render realistic skeleton loading
    useEffect(() => {
        let timer = null;

        const removeStartListener = router.on('start', (event) => {
            const url = event.detail?.visit?.url?.pathname || event.detail?.visit?.url || '';
            setTargetPath(url.toString());
            // Small debounce (60ms) to prevent flicker on instant cache hits
            timer = setTimeout(() => {
                setIsNavigating(true);
            }, 60);
        });

        const removeFinishListener = router.on('finish', () => {
            if (timer) clearTimeout(timer);
            setIsNavigating(false);
        });

        return () => {
            if (timer) clearTimeout(timer);
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    return (
        <div className="min-h-screen flex bg-[#FAFAFA] dark:bg-[#090D16] text-slate-900 dark:text-zinc-100 font-sans antialiased transition-colors">
            <Head title={`${title} - STAS RG Projects`} />

            {/* Sidebar Navigation */}
            <AdminSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                currentPath={activePath}
            />

            {/* Main Area */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'md:pl-20' : 'md:pl-64'
                }`}
            >
                {/* Header Navbar */}
                <AdminHeader
                    isSidebarCollapsed={isCollapsed}
                    onToggleSidebar={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                            setIsMobileOpen(!isMobileOpen);
                        } else {
                            setIsCollapsed(!isCollapsed);
                        }
                    }}
                />

                {/* Page Content Body with Skeleton fallback during navigation */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {isNavigating ? (
                        <div className="animate-in fade-in duration-200">
                            {getSkeletonForRoute(targetPath || activePath)}
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-200">
                            {children}
                        </div>
                    )}
                </main>

                {/* Panel Footer */}
                <AdminFooter />
            </div>
        </div>
    );
}

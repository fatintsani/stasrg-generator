import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { AppProvider } from '../Context/AppContext';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import AdminHeader from '../Components/Admin/AdminHeader';
import AdminFooter from '../Components/Admin/AdminFooter';

export default function AdminLayout({
    children,
    title = 'Admin Dashboard',
    currentPath = '/dashboard',
    onOpenNewProject,
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-[#FAFAFA] dark:bg-[#090D16] text-slate-900 dark:text-zinc-100 font-sans antialiased transition-colors">
            <Head title={`${title} - STAS RG Generator`} />

            {/* Sidebar Navigation */}
            <AdminSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                currentPath={currentPath}
            />

            {/* Main Area */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'md:pl-20' : 'md:pl-64'
                }`}
            >
                {/* Header Navbar */}
                <AdminHeader
                    onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
                    onOpenNewProjectModal={onOpenNewProject}
                />

                {/* Page Content Body */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>

                {/* Panel Footer */}
                <AdminFooter />
            </div>
        </div>
    );
}

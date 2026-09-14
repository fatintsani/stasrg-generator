import React from 'react';

/**
 * Base Primitive Skeleton Component with animated shimmer and dark/light support
 */
export function Skeleton({ className = '', style = {}, rounded = 'rounded-xl', ...props }) {
    return (
        <div
            className={`animate-pulse bg-zinc-200/80 dark:bg-zinc-800/80 ${rounded} relative overflow-hidden animate-shimmer ${className}`}
            style={style}
            {...props}
        />
    );
}

/**
 * Dashboard Page Skeleton
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Top Greeting Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-64 rounded-xl" />
                    <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
                </div>
                <div className="flex items-center gap-2.5">
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24 rounded-md" />
                            <Skeleton className="w-9 h-9 rounded-xl" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-lg" />
                        <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                            <Skeleton className="h-3 w-16 rounded-sm" />
                            <Skeleton className="h-3 w-28 rounded-sm" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-Column Chart & Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-44 rounded-lg" />
                        <Skeleton className="h-8 w-28 rounded-xl" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                    <Skeleton className="h-5 w-36 rounded-lg" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-3.5 w-3/4 rounded-sm" />
                                    <Skeleton className="h-2.5 w-1/2 rounded-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Projects Table Skeleton */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-12 h-10 rounded-lg shrink-0" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-48 rounded-md" />
                                    <Skeleton className="h-3 w-32 rounded-md" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Projects List / Index Page Skeleton
 */
export function ProjectsIndexSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <Skeleton className="h-8 w-56 rounded-xl" />
                    <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
            </div>

            {/* Search & Filters Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-3">
                <Skeleton className="h-10 w-full md:w-80 rounded-xl" />
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Skeleton className="h-10 w-36 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>

            {/* Projects Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 overflow-hidden space-y-3 p-4">
                        <Skeleton className="h-44 w-full rounded-xl" />
                        <div className="flex items-center justify-between gap-2">
                            <Skeleton className="h-5 w-24 rounded-md" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-5 w-full rounded-md" />
                        <Skeleton className="h-3.5 w-4/5 rounded-sm" />
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                            <Skeleton className="h-3 w-28 rounded-sm" />
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Project Form / Editor Page Skeleton
 */
export function ProjectFormSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-6 w-60 rounded-lg" />
                        <Skeleton className="h-3.5 w-80 rounded-md" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            {/* 2-Column Editor Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Inputs Column (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                    {/* Basic Info Box */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                        <Skeleton className="h-5 w-36 rounded-md" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                    </div>

                    {/* Presets & Templates Box */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-44 rounded-md" />
                            <Skeleton className="h-8 w-52 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            <Skeleton className="h-28 rounded-xl" />
                            <Skeleton className="h-28 rounded-xl" />
                            <Skeleton className="h-28 rounded-xl" />
                            <Skeleton className="h-28 rounded-xl" />
                        </div>
                    </div>

                    {/* Upload Photo & Logo Box */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                        <Skeleton className="h-5 w-40 rounded-md" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                </div>

                {/* Right Live Preview Canvas Column (5 cols) */}
                <div className="lg:col-span-5 space-y-3 sticky top-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-36 rounded-md" />
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-7 w-16 rounded-lg" />
                            <Skeleton className="h-7 w-16 rounded-lg" />
                        </div>
                    </div>
                    <div className="w-full p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 flex justify-center">
                        <Skeleton className="w-full h-[580px] rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Activity & Audit Logs Page Skeleton
 */
export function ActivityLogsSkeleton() {
    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <Skeleton className="h-8 w-64 rounded-xl" />
                    <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            {/* 6 Stats Mini Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                        <Skeleton className="h-3 w-20 rounded-xs" />
                        <Skeleton className="h-6 w-12 rounded-md" />
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-3">
                <Skeleton className="h-10 w-full md:w-80 rounded-xl" />
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>

            {/* Logs Table Skeleton */}
            <div className="rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded-sm" />
                    <Skeleton className="h-4 w-40 rounded-sm" />
                    <Skeleton className="h-4 w-60 rounded-sm" />
                    <Skeleton className="h-4 w-20 rounded-sm" />
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-1/4">
                                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                <div className="space-y-1 flex-1">
                                    <Skeleton className="h-3.5 w-24 rounded-sm" />
                                    <Skeleton className="h-2.5 w-16 rounded-sm" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-28 rounded-full" />
                            <Skeleton className="h-4 flex-1 max-w-md rounded-md" />
                            <Skeleton className="h-3 w-28 rounded-sm" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Settings Page Skeleton
 */
export function SettingsSkeleton() {
    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Header Title */}
            <div className="space-y-1.5">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
            </div>

            {/* Tabs Bar */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 w-full sm:w-max">
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-28 rounded-xl" />
            </div>

            {/* Settings Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-32 rounded-md" />
                            <Skeleton className="h-3 w-40 rounded-sm" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-5">
                    <Skeleton className="h-6 w-48 rounded-lg" />
                    <div className="space-y-3">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Project Detail & Showcase Page Skeleton
 */
export function ProjectDetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
            {/* Top Breadcrumbs & Actions */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48 rounded-md" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-28 rounded-xl" />
                    <Skeleton className="h-9 w-32 rounded-xl" />
                </div>
            </div>

            {/* Main Showcase Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Flyer Showcase Preview (7 cols) */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 flex justify-center">
                    <Skeleton className="w-full h-[620px] rounded-2xl" />
                </div>

                {/* Right Specs & Information (5 cols) */}
                <div className="lg:col-span-5 space-y-5">
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                        <Skeleton className="h-6 w-28 rounded-full" />
                        <Skeleton className="h-8 w-4/5 rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                        <Skeleton className="h-5 w-36 rounded-md" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Users Management Page Skeleton
 */
export function UsersSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <Skeleton className="h-8 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-72 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
            <div className="rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-10 w-72 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-36 rounded-sm" />
                                    <Skeleton className="h-3 w-48 rounded-sm" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-8 w-16 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Analytics & Insights Page Skeleton
 */
export function AnalyticsSkeleton() {
    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Header & Filter Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-64 rounded-xl" />
                    <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
                </div>
                <div className="flex items-center gap-2.5">
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-28 rounded-md" />
                            <Skeleton className="w-9 h-9 rounded-xl" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-3 w-36 rounded-sm" />
                    </div>
                ))}
            </div>

            {/* Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-48 rounded-lg" />
                        <Skeleton className="h-8 w-32 rounded-xl" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                    <Skeleton className="h-5 w-44 rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
}


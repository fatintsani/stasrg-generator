import React from 'react';
import { Head } from '@inertiajs/react';
import { AppProvider, useApp } from '../Context/AppContext';
import Navbar from '../Components/Navbar';
import HeroSection from '../Components/HeroSection';
import ProjectShowcaseSection from '../Components/ProjectShowcaseSection';
import AboutSection from '../Components/AboutSection';
import PrinciplesSection from '../Components/PrinciplesSection';
import HowItWorksSection from '../Components/HowItWorksSection';
import InternalNoteBanner from '../Components/InternalNoteBanner';
import Footer from '../Components/Footer';

function LandingContent({ publishedProjects = [], stats = {} }) {
    const { t } = useApp();

    const pageTitle = t?.nav?.brand 
        ? `${t.nav.brand} - Project & Document Platform` 
        : 'STAS RG Projects - Project & Document Platform';

    const pageDesc = t?.hero?.subtitle || 'A simple internal platform for organizing and generating standardized STAS RG project documents.';

    return (
        <>
            <Head title={pageTitle}>
                <meta name="description" content={pageDesc} />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900 font-sans antialiased transition-colors">
                {/* Top Sticky Header */}
                <Navbar />

                {/* Main Content Area */}
                <main className="flex-grow">
                    {/* Hero Section with Live Stats Widget */}
                    <HeroSection stats={stats} />

                    {/* Published Projects Showcase Section */}
                    <ProjectShowcaseSection projects={publishedProjects} />

                    {/* About Section */}
                    <AboutSection />

                    {/* Operational Principles (01 Organized, 02 Consistent, 03 Efficient) */}
                    <PrinciplesSection />

                    {/* Sequential Protocol / How It Works */}
                    <HowItWorksSection />

                    {/* Internal Security & Call to Action */}
                    <InternalNoteBanner />
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}

export default function Welcome({ publishedProjects = [], stats = {} }) {
    return (
        <AppProvider>
            <LandingContent publishedProjects={publishedProjects} stats={stats} />
        </AppProvider>
    );
}

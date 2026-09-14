import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { AppProvider } from './Context/AppContext';
import { AlertProvider } from './Context/AlertContext';
import GlobalTooltipProvider from './Components/Common/GlobalTooltipProvider';

const appName = import.meta.env.VITE_APP_NAME || 'STAS RG Projects';

createInertiaApp({
    title: (title) => `${title ? `${title} - ` : ''}${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <AppProvider>
                <AlertProvider>
                    <GlobalTooltipProvider>
                        <App {...props} />
                    </GlobalTooltipProvider>
                </AlertProvider>
            </AppProvider>
        );
    },
    progress: {
        color: '#0AB600',
        showSpinner: false,
    },
});

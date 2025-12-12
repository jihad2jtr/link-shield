// Google Analytics 4 Integration
import ReactGA from 'react-ga4';

const MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '';

let isInitialized = false;

export const initGA = () => {
    if (typeof window === 'undefined') {
        return; // Skip on server-side
    }

    if (MEASUREMENT_ID && !isInitialized) {
        try {
            ReactGA.initialize(MEASUREMENT_ID);
            isInitialized = true;
            console.log('Google Analytics initialized');
        } catch (error) {
            console.warn('Failed to initialize Google Analytics:', error);
        }
    }
};

export const logPageView = (path: string) => {
    if (isInitialized) {
        try {
            ReactGA.send({ hitType: 'pageview', page: path });
        } catch (error) {
            console.warn('Failed to log page view:', error);
        }
    }
};

export const logEvent = (category: string, action: string, label?: string, value?: number) => {
    if (isInitialized) {
        try {
            ReactGA.event({
                category,
                action,
                label,
                value,
            });
        } catch (error) {
            console.warn('Failed to log event:', error);
        }
    }
};

// Custom event tracking functions
export const trackLinkCreated = (redirectType: string) => {
    logEvent('Link', 'Create', redirectType);
};

export const trackLinkClicked = (shortCode: string) => {
    logEvent('Link', 'Click', shortCode);
};

export const trackUserSignUp = (method: 'email' | 'google') => {
    logEvent('User', 'Sign Up', method);
};

export const trackUserSignIn = (method: 'email' | 'google') => {
    logEvent('User', 'Sign In', method);
};

export const trackAdvertisementUpload = () => {
    logEvent('Advertisement', 'Upload');
};

export const trackReportSubmitted = () => {
    logEvent('Report', 'Submit');
};

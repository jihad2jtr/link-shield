// Google reCAPTCHA v3 Integration

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY || '';

declare global {
    interface Window {
        grecaptcha: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

export const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (typeof window === 'undefined') {
        console.warn('reCAPTCHA: window is undefined');
        return null;
    }

    if (!RECAPTCHA_SITE_KEY) {
        console.warn('reCAPTCHA site key not configured');
        return null;
    }

    if (!window.grecaptcha) {
        console.warn('reCAPTCHA script not loaded');
        return null;
    }

    try {
        return await new Promise((resolve, reject) => {
            window.grecaptcha.ready(async () => {
                try {
                    const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
                    resolve(token);
                } catch (error) {
                    console.error('reCAPTCHA execution error:', error);
                    resolve(null); // Return null instead of rejecting
                }
            });
        });
    } catch (error) {
        console.error('reCAPTCHA error:', error);
        return null;
    }
};

export const getRecaptchaToken = async (action: 'login' | 'register' | 'create_link' | 'submit_report'): Promise<string | null> => {
    return executeRecaptcha(action);
};

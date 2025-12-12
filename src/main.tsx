import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';
import { initGA } from './lib/analytics';

// Initialize Google Analytics (safe to call even if not configured)
try {
    initGA();
} catch (error) {
    console.warn('Failed to initialize Google Analytics:', error);
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const root = createRoot(document.getElementById("root")!);

// Only wrap with GoogleOAuthProvider if client ID is configured
if (GOOGLE_CLIENT_ID) {
    root.render(
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    );
} else {
    console.warn('Google OAuth Client ID not configured');
    root.render(<App />);
}

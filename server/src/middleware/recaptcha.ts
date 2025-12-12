import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const RECAPTCHA_SECRET_KEY = process.env.GOOGLE_RECAPTCHA_SECRET_KEY || '';

interface RecaptchaResponse {
    success: boolean;
    score?: number;
    action?: string;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
}

export const verifyRecaptcha = async (req: Request, res: Response, next: NextFunction) => {
    const { recaptchaToken } = req.body;

    // Skip verification if no secret key configured or no token provided
    if (!RECAPTCHA_SECRET_KEY || !recaptchaToken) {
        console.warn('reCAPTCHA verification skipped - no secret key or token');
        return next();
    }

    try {
        const response = await axios.post<RecaptchaResponse>(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken,
                },
            }
        );

        const { success, score } = response.data;

        if (!success) {
            return res.status(400).json({
                error: { message: 'reCAPTCHA verification failed' },
            });
        }

        // For reCAPTCHA v3, check the score (0.0 - 1.0)
        // Score of 0.5 or higher is generally considered human
        if (score !== undefined && score < 0.5) {
            return res.status(400).json({
                error: { message: 'Suspicious activity detected' },
            });
        }

        // Verification successful, proceed to next middleware
        next();
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        // Don't block the request if reCAPTCHA service is down
        next();
    }
};

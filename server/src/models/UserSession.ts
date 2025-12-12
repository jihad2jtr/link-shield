import { Schema, model, Types } from 'mongoose';

interface IUserSession {
    session_id: string;
    user_id?: Types.ObjectId;
    user_agent: string;
    browser_info: any;
    cookies_data: any;
    referrer: string;
    device_type: string;
    screen_resolution: string;
    ip_address?: string;
    page_views: number;
    last_activity: Date;
    created_at: Date;
}

const userSessionSchema = new Schema<IUserSession>({
    session_id: { type: String, required: true, unique: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    user_agent: { type: String },
    browser_info: { type: Schema.Types.Mixed },
    cookies_data: { type: Schema.Types.Mixed },
    referrer: { type: String },
    device_type: { type: String },
    screen_resolution: { type: String },
    ip_address: { type: String },
    page_views: { type: Number, default: 1 },
    last_activity: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now }
});

export const UserSession = model<IUserSession>('UserSession', userSessionSchema);

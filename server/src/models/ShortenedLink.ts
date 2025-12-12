import { Schema, model, Types } from 'mongoose';

interface IShortenedLink {
    original_url: string;
    short_code: string;
    title?: string;
    redirect_type: 'direct' | 'timer' | 'ad';
    user_id?: Types.ObjectId; // Optional for anonymous links if allowed, or linked to User
    clicks: number;
    status: 'active' | 'inactive' | 'banned';
    created_at: Date;
}

const shortenedLinkSchema = new Schema<IShortenedLink>({
    original_url: { type: String, required: true },
    short_code: { type: String, required: true, unique: true },
    title: { type: String },
    redirect_type: { type: String, enum: ['direct', 'timer', 'ad'], default: 'direct' },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    clicks: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
    created_at: { type: Date, default: Date.now }
});

export const ShortenedLink = model<IShortenedLink>('ShortenedLink', shortenedLinkSchema);

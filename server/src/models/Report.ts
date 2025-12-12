import { Schema, model, Types } from 'mongoose';

interface IReport {
    link_id: Types.ObjectId;
    reporter_email: string;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved';
    admin_response?: string;
    created_at: Date;
    updated_at: Date;
}

const reportSchema = new Schema<IReport>({
    link_id: { type: Schema.Types.ObjectId, ref: 'ShortenedLink', required: true },
    reporter_email: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    admin_response: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

reportSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

export const Report = model<IReport>('Report', reportSchema);

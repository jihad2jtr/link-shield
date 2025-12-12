import { Schema, model } from 'mongoose';

interface IAdvertisement {
    title: string;
    description?: string;
    image_url: string;
    target_url?: string;
    is_active: boolean;
    created_at: Date;
}

const advertisementSchema = new Schema<IAdvertisement>({
    title: { type: String, required: true },
    description: { type: String },
    image_url: { type: String, required: true },
    target_url: { type: String },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

export const Advertisement = model<IAdvertisement>('Advertisement', advertisementSchema);

import mongoose from 'mongoose';

interface ISiteSettings {
    adsense_client_id: string;
    adsense_timer_slot: string;
    adsense_ad_slot: string;
    adsense_enabled: boolean;
    updated_at: Date;
}

const siteSettingsSchema = new mongoose.Schema<ISiteSettings>({
    adsense_client_id: { type: String, default: '' },
    adsense_timer_slot: { type: String, default: '' },
    adsense_ad_slot: { type: String, default: '' },
    adsense_enabled: { type: Boolean, default: false },
    updated_at: { type: Date, default: Date.now }
});

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);

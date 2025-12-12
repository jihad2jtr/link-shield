import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Save, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AdSenseSettings {
    adsense_client_id: string;
    adsense_timer_slot: string;
    adsense_ad_slot: string;
    adsense_enabled: boolean;
}

export const AdSenseSettings = () => {
    const [settings, setSettings] = useState<AdSenseSettings>({
        adsense_client_id: '',
        adsense_timer_slot: '',
        adsense_ad_slot: '',
        adsense_enabled: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/settings`);
            if (response.data.data) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast({
                title: 'خطأ',
                description: 'فشل في تحميل الإعدادات',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('session');
            if (!token) throw new Error('Not authenticated');

            const { access_token } = JSON.parse(token);

            const response = await axios.put(
                `${API_URL}/api/settings`,
                settings,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            );

            toast({
                title: 'تم الحفظ',
                description: 'تم حفظ إعدادات AdSense بنجاح'
            });
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast({
                title: 'خطأ',
                description: error.response?.data?.error?.message || 'فشل في حفظ الإعدادات',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">جاري تحميل الإعدادات...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>إعدادات Google AdSense</CardTitle>
                        <CardDescription>
                            قم بإدخال معلومات حساب AdSense لعرض الإعلانات على صفحات إعادة التوجيه
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchSettings}
                        disabled={loading}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        تحديث
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="adsense-enabled">تفعيل إعلانات AdSense</Label>
                            <p className="text-sm text-muted-foreground">
                                عرض إعلانات Google على صفحات إعادة التوجيه
                            </p>
                        </div>
                        <Switch
                            id="adsense-enabled"
                            checked={settings.adsense_enabled}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, adsense_enabled: checked })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="client-id">معرف الناشر (Publisher ID)</Label>
                        <Input
                            id="client-id"
                            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                            value={settings.adsense_client_id}
                            onChange={(e) =>
                                setSettings({ ...settings, adsense_client_id: e.target.value })
                            }
                            dir="ltr"
                        />
                        <p className="text-xs text-muted-foreground">
                            احصل عليه من لوحة تحكم AdSense
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timer-slot">معرف وحدة إعلانية - صفحة المؤقت</Label>
                        <Input
                            id="timer-slot"
                            placeholder="XXXXXXXXXX"
                            value={settings.adsense_timer_slot}
                            onChange={(e) =>
                                setSettings({ ...settings, adsense_timer_slot: e.target.value })
                            }
                            dir="ltr"
                        />
                        <p className="text-xs text-muted-foreground">
                            الإعلان الذي يظهر في صفحة العد التنازلي 5 ثواني
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ad-slot">معرف وحدة إعلانية - صفحة الإعلان</Label>
                        <Input
                            id="ad-slot"
                            placeholder="XXXXXXXXXX"
                            value={settings.adsense_ad_slot}
                            onChange={(e) =>
                                setSettings({ ...settings, adsense_ad_slot: e.target.value })
                            }
                            dir="ltr"
                        />
                        <p className="text-xs text-muted-foreground">
                            الإعلان الذي يظهر في صفحة الإعلانات
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={saveSettings} disabled={saving} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                    </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">كيفية الحصول على معلومات AdSense:</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                        <li>سجل الدخول إلى <a href="https://www.google.com/adsense/" target="_blank" className="text-blue-600 hover:underline">Google AdSense</a></li>
                        <li>من القائمة الجانبية، اختر "الإعلانات" ثم "نظرة عامة"</li>
                        <li>انسخ معرف الناشر (Publisher ID) من أعلى الصفحة</li>
                        <li>أنشئ وحدتين إعلانيتين جديدتين (واحدة لكل صفحة)</li>
                        <li>انسخ معرف كل وحدة إعلانية (Ad Unit ID)</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
};

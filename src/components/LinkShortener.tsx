import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, ExternalLink, Shuffle, Link2, Check } from 'lucide-react';
import { links } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { trackLinkCreated } from '@/lib/analytics';
import { getRecaptchaToken } from '@/lib/recaptcha';

export const LinkShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [redirectType, setRedirectType] = useState('direct');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Get user from auth hook

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'http://' + url;
    }
    return url;
  };

  const generateRandomCode = async () => {
    try {
      const { data: shortCodeData } = await links.generateCode();
      if (shortCodeData) {
        setCustomCode(shortCodeData);
      }
    } catch (error) {
      console.error('Error generating random code:', error);
    }
  };

  const validateCustomCode = (code: string) => {
    // Allow only alphanumeric characters and hyphens, 3-50 characters
    const regex = /^[a-zA-Z0-9-]{3,50}$/;
    return regex.test(code);
  };

  const checkCodeAvailability = async (code: string) => {
    const { data } = await links.getByCode(code);
    return !data; // Returns true if code is available (no existing data)
  };

  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedUrl = formatUrl(originalUrl);
      let finalShortCode = customCode.trim();

      // If no custom code provided, generate one - handled by backend if not sent, 
      // but current logic generates frontend side call to backend gen code first or lets backend handle it?
      // Our backend create logic handles generation if not provided.
      // But we also validate custom code here.

      if (!finalShortCode) {
        // Let backend handle it or generate here? Backend handles it if empty.
        // But existing logic shows generated code in UI? No, it just sets customCode state.
        // Let's rely on backend generation mostly, but if we want to show it before creation we can call generate.
        // Actually, let's just send empty short_code if empty and let backend generate.
      } else {
        // Validate custom code
        if (!validateCustomCode(finalShortCode)) {
          throw new Error('الرمز المختصر يجب أن يحتوي على أحرف وأرقام فقط (3-50 حرف)');
        }

        // Check if custom code is available - optional, backend will also check
        const isAvailable = await checkCodeAvailability(finalShortCode);
        if (!isAvailable) {
          throw new Error('هذا الرمز المختصر مستخدم بالفعل، يرجى اختيار رمز آخر');
        }
      }

      console.log('Creating link with title:', title); // Debug log

      const { data, error } = await links.create({
        original_url: formattedUrl,
        short_code: finalShortCode || undefined,
        title: title.trim() || undefined,
        redirect_type: redirectType,
        // user_id is handled by backend from token
      });

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message || 'فشل في إنشاء الرابط');
      }

      console.log('Created link data:', data); // Debug log

      const shortUrl = `${window.location.origin}/${data.short_code}`;
      setShortenedUrl(shortUrl);

      // Clear form after successful creation
      setOriginalUrl('');
      setTitle('');
      setCustomCode('');
      setRedirectType('direct');

      toast({
        title: "تم اختصار الرابط بنجاح!",
        description: `تم إنشاء الرابط${title ? ` بعنوان: ${title}` : ''}`,
      });
    } catch (error: any) {
      console.error('Error creating shortened link:', error);
      toast({
        title: "خطأ في اختصار الرابط",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    toast({
      title: "تم النسخ!",
      description: "تم نسخ الرابط المختصر إلى الحافظة",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card border-2 shadow-2xl hover-lift">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold gradient-text">اختصار رابط جديد</CardTitle>
        <p className="text-muted-foreground">حول روابطك الطويلة إلى روابط قصيرة وسهلة المشاركة</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleShortenUrl} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="originalUrl" className="text-sm font-semibold flex items-center gap-2">
              الرابط الأصلي *
              <span className="text-xs text-muted-foreground font-normal">(مطلوب)</span>
            </Label>
            <Input
              id="originalUrl"
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:scale-[1.01]"
              required
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              سيتم إضافة http:// تلقائياً إذا لم تكن موجودة
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
              العنوان
              <span className="text-xs text-muted-foreground font-normal">(اختياري)</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="وصف مختصر للرابط"
              maxLength={100}
              className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">العنوان سيظهر في قائمة الروابط</p>
              <span className={`text-xs font-medium ${title.length > 80 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {title.length}/100
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customCode" className="text-sm font-semibold flex items-center gap-2">
              الرمز المختصر
              <span className="text-xs text-muted-foreground font-normal">(اختياري)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="customCode"
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-custom-link"
                className="flex-1 h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateRandomCode}
                className="shrink-0 h-11 px-4 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                title="توليد رمز عشوائي"
              >
                <Shuffle className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              3-50 حرف، أحرف وأرقام وشرطات فقط. سيتم توليد رمز عشوائي إذا تُرك فارغاً
            </p>
            {customCode && (
              <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-primary" dir="ltr">
                  {window.location.origin}/{customCode}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirectType" className="text-sm font-semibold">نوع إعادة التوجيه</Label>
            <Select value={redirectType} onValueChange={setRedirectType}>
              <SelectTrigger className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/50">
                <SelectValue placeholder="اختر نوع إعادة التوجيه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    إعادة توجيه مباشر
                  </div>
                </SelectItem>
                <SelectItem value="timer" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    انتظار 5 ثواني
                  </div>
                </SelectItem>
                <SelectItem value="ad" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    صفحة إعلانات مع زر تخطي
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full h-12 btn-premium text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={loading || !originalUrl.trim()}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الاختصار...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                اختصار الرابط
              </div>
            )}
          </Button>
        </form>

        {shortenedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <Label className="text-base font-bold text-green-800 dark:text-green-200">
                تم الاختصار بنجاح! 🎉
              </Label>
            </div>
            <div className="flex items-center gap-2" dir="ltr">
              <Input
                value={shortenedUrl}
                readOnly
                className="flex-1 h-11 font-mono text-sm bg-white dark:bg-gray-900 border-green-300 dark:border-green-700"
              />
              <Button
                type="button"
                size="sm"
                onClick={copyToClipboard}
                className="shrink-0 h-11 px-4 bg-green-600 hover:bg-green-700 text-white"
                title="نسخ الرابط"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => window.open(shortenedUrl, '_blank')}
                variant="outline"
                className="shrink-0 h-11 px-4 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                title="فتح الرابط"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

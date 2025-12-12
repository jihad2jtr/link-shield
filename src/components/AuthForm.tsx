
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { GoogleSignIn } from '@/components/GoogleSignIn';
import { getRecaptchaToken } from '@/lib/recaptcha';
import { trackUserSignIn, trackUserSignUp } from '@/lib/analytics';
import { motion } from 'framer-motion';
import { Link2, Sparkles, Shield } from 'lucide-react';

export const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken('login');

      const { error } = await signIn(email, password, recaptchaToken);

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message,
          variant: "destructive",
        });
      } else {
        trackUserSignIn('email');
        toast({
          title: "مرحباً بك!",
          description: "تم تسجيل الدخول بنجاح",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken('register');

      const { error } = await signUp(email, password, fullName, recaptchaToken);

      if (error) {
        toast({
          title: "خطأ في التسجيل",
          description: error.message,
          variant: "destructive",
        });
      } else {
        trackUserSignUp('email');
        toast({
          title: "تم التسجيل بنجاح!",
          description: "تحقق من بريدك الإلكتروني لتأكيد الحساب",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 animated-gradient" />

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-2 shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg glow"
            >
              <Link2 className="w-8 h-8 text-white" />
            </motion.div>

            <div>
              <CardTitle className="text-3xl font-bold gradient-text">
                مختصر الروابط
              </CardTitle>
              <CardDescription className="text-base mt-2 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                اختصر روابطك وشاركها بسهولة
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Google Sign-In */}
            <div className="space-y-3">
              <GoogleSignIn />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">أو</span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary/50">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  تسجيل الدخول
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  إنشاء حساب
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      كلمة المرور
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full btn-premium h-11 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري تسجيل الدخول...
                      </div>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      الاسم الكامل
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      كلمة المرور
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full btn-premium h-11 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري إنشاء الحساب...
                      </div>
                    ) : (
                      'إنشاء حساب'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* reCAPTCHA Notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>محمي بواسطة Google reCAPTCHA</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

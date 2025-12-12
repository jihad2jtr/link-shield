
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { LogOut, User, Link as LinkIcon, Settings, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "خطأ في تسجيل الخروج",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Clear local storage session data
        localStorage.removeItem('session_id');

        toast({
          title: "تم تسجيل الخروج",
          description: "نراك قريباً!",
        });

        // Force navigation to home page
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      console.error('Unexpected logout error:', error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="sticky top-0 z-50 glass-card border-b border-border/50 shadow-lg backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
                Link Shepherd
                <Sparkles className="h-4 w-4 text-primary" />
              </h1>
              <p className="text-xs text-muted-foreground">مختصر الروابط الذكي</p>
            </div>
          </motion.div>

          {user && (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">لوحة الإدارة</span>
                  </Button>
                </motion.div>
              )}

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">مرحباً</span>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 border-destructive/30 hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">خروج</span>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

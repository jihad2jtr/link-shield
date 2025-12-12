
import { useState } from 'react';
import { Header } from '@/components/Header';
import { LinkShortener } from '@/components/LinkShortener';
import { LinksList } from '@/components/LinksList';
import { AdvertisementUpload } from '@/components/AdvertisementUpload';
import { UserAdvertisements } from '@/components/UserAdvertisements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Image, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold gradient-text mb-3 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-8 h-8 text-primary" />
              لوحة التحكم
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg"
            >
              إدارة روابطك وإعلاناتك بكل سهولة
            </motion.p>
          </div>

          <Tabs defaultValue="links" className="w-full">
            <TabsList className="grid w-full grid-cols-4 p-1.5 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg h-auto">
              <TabsTrigger
                value="links"
                className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300 data-[state=active]:shadow-lg rounded-lg"
              >
                <Link className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">الروابط</span>
              </TabsTrigger>
              <TabsTrigger
                value="my-links"
                className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300 data-[state=active]:shadow-lg rounded-lg"
              >
                <Link className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">روابطي</span>
              </TabsTrigger>
              <TabsTrigger
                value="add-ad"
                className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300 data-[state=active]:shadow-lg rounded-lg"
              >
                <Image className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">إضافة إعلان</span>
              </TabsTrigger>
              <TabsTrigger
                value="my-ads"
                className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300 data-[state=active]:shadow-lg rounded-lg"
              >
                <Image className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">إعلاناتي</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="links" className="space-y-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <LinkShortener />
              </motion.div>
            </TabsContent>

            <TabsContent value="my-links" className="space-y-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <LinksList />
              </motion.div>
            </TabsContent>

            <TabsContent value="add-ad" className="space-y-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <AdvertisementUpload />
              </motion.div>
            </TabsContent>

            <TabsContent value="my-ads" className="space-y-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <UserAdvertisements />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

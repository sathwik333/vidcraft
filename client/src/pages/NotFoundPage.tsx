import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { MagneticButton } from "@/components/animation/MagneticButton";
import { GlowButton } from "@/components/animation/GlowButton";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 text-center">
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600"
          >
            404
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold tracking-tight"
          >
            Page Not Found
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[hsl(var(--muted-foreground))] max-w-md mx-auto"
          >
            The page you are looking for does not exist or has been moved.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MagneticButton>
              <Link to="/">
                <GlowButton className="bg-gold-500 hover:bg-gold-600 text-white mt-4">
                  <Home className="h-4 w-4" />
                  Back to Home
                </GlowButton>
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

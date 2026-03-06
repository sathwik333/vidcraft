import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))]/50 bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <img src="/transparent-logo.png" alt="VidCraft" className="h-7 w-7 rounded-md" />
                <span className="text-xl font-bold">VidCraft</span>
              </Link>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Transform your photos into stunning AI-powered videos in seconds.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                <li>
                  <Link to="/pricing" className="hover:text-gold-500 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/generate" className="hover:text-gold-500 transition-colors">
                    Generate
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-gold-500 transition-colors">
                    Gallery
                  </Link>
                </li>
              </ul>
            </div>

            {/* Models */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">AI Models</h4>
              <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                <li>Google Veo 3.1</li>
                <li>Runway Gen-4 Turbo</li>
                <li>Kling 2.1</li>
                <li>Sora 2</li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                <li>
                  <span className="hover:text-gold-500 transition-colors cursor-pointer">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="hover:text-gold-500 transition-colors cursor-pointer">
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-8 border-t border-[hsl(var(--border))]/50 pt-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          &copy; {new Date().getFullYear()} VidCraft. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

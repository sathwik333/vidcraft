import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/animation/MagneticButton";
import { GlowButton } from "@/components/animation/GlowButton";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
];

const authLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/generate", label: "Generate" },
  { href: "/gallery", label: "Gallery" },
];

export function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(var(--background))]/80 backdrop-blur-2xl">
      {/* Gold gradient line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to={isSignedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img src="/transparent-logo.png" alt="VidCraft" className="h-8 w-8 rounded-md" />
          <span className="text-xl font-bold">VidCraft</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <SignedOut>
            {publicLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm",
                    isActive(link.href) && "bg-gold-500/10 text-gold-500"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </SignedOut>
          <SignedIn>
            {authLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm",
                    isActive(link.href) && "bg-gold-500/10 text-gold-500"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <Link to="/pricing">
              <Button
                variant="ghost"
                className={cn(
                  "text-sm",
                  isActive("/pricing") && "bg-gold-500/10 text-gold-500"
                )}
              >
                Pricing
              </Button>
            </Link>
          </SignedIn>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <Link to="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <MagneticButton>
              <Link to="/sign-up">
                <GlowButton className="bg-gold-500 hover:bg-gold-600 text-white text-sm px-4 py-2">
                  Get Started
                </GlowButton>
              </Link>
            </MagneticButton>
          </SignedOut>
          <SignedIn>
            <NotificationBell />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </SignedIn>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                <SignedOut>
                  {publicLinks.map((link) => (
                    <Link key={link.href} to={link.href} onClick={() => setOpen(false)}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start",
                          isActive(link.href) && "bg-gold-500/10 text-gold-500"
                        )}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                  <Link to="/sign-in" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/sign-up" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-gold-500 hover:bg-gold-600 text-white">
                      Get Started
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  {authLinks.map((link) => (
                    <Link key={link.href} to={link.href} onClick={() => setOpen(false)}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start",
                          isActive(link.href) && "bg-gold-500/10 text-gold-500"
                        )}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                  <Link to="/pricing" onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isActive("/pricing") && "bg-gold-500/10 text-gold-500"
                      )}
                    >
                      Pricing
                    </Button>
                  </Link>
                  <Link to="/settings" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Settings
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Bottom border */}
      <div className="h-px w-full bg-[hsl(var(--border))]/50" />
    </header>
  );
}

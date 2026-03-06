import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wand2,
  Image,
  CreditCard,
  Settings,
  User,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate", icon: Wand2 },
  { href: "/gallery", label: "Gallery", icon: Image },
  { href: "/payments", label: "Payments", icon: Receipt },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-[hsl(var(--border))]/50 bg-[hsl(var(--background))] p-4">
      <nav className="flex flex-col gap-1 mt-4">
        {sidebarLinks.map((link) => (
          <Link key={link.href} to={link.href} className="relative">
            {/* Animated active indicator */}
            {isActive(link.href) && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gold-500"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sm pl-4",
                isActive(link.href)
                  ? "bg-gold-500/10 text-gold-500 hover:bg-gold-500/20 hover:text-gold-500"
                  : "hover:bg-white/5"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

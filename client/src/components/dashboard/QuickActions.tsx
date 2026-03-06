import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Image, CreditCard } from "lucide-react";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  delay?: number;
}

function ActionCard({ icon, title, description, href, delay = 0 }: ActionCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(href)}
      className="glass group flex flex-col items-center gap-3 rounded-xl border border-[hsl(var(--border))] p-6 text-center transition-colors hover:border-gold-500/40 hover:bg-gold-500/5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 transition-colors group-hover:bg-gold-500/20">
        <div className="text-gold-500">{icon}</div>
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      </div>
    </motion.button>
  );
}

export function QuickActions() {
  const actions = [
    {
      icon: <Plus className="h-6 w-6" />,
      title: "New Video",
      description: "Upload a photo and generate a video",
      href: "/generate",
    },
    {
      icon: <Image className="h-6 w-6" />,
      title: "View Gallery",
      description: "Browse all your generated videos",
      href: "/gallery",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Buy Credits",
      description: "Get more credits for video generation",
      href: "/pricing",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass rounded-xl border border-[hsl(var(--border))] p-6"
    >
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, i) => (
          <ActionCard
            key={action.title}
            icon={action.icon}
            title={action.title}
            description={action.description}
            href={action.href}
            delay={0.25 + i * 0.08}
          />
        ))}
      </div>
    </motion.div>
  );
}

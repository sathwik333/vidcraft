import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/useTheme";
import { useCredits } from "@/hooks/useCredits";
import {
  Sun,
  Moon,
  Bell,
  Mail,
  MessageSquare,
  Shield,
  Trash2,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { TiltCard } from "@/components/animation/TiltCard";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { tier } = useCredits();

  // Notification preferences and loading state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [generationCompleteEmail, setGenerationCompleteEmail] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const { data } = await api.get("/users/preferences");
        if (data) {
          setEmailNotifications(data.emailNotifications ?? true);
          setInAppNotifications(data.inAppNotifications ?? true);
          setGenerationCompleteEmail(data.generationCompleteEmail ?? true);
          setMarketingEmails(data.marketingEmails ?? false);
        }
      } catch (err) {
        console.error("Failed to load preferences", err);
      } finally {
        setIsLoadingPrefs(false);
      }
    }
    fetchPreferences();
  }, []);

  const updatePreference = async (key: string, value: boolean) => {
    try {
      // Optimistic update
      if (key === "emailNotifications") setEmailNotifications(value);
      if (key === "inAppNotifications") setInAppNotifications(value);
      if (key === "generationCompleteEmail") setGenerationCompleteEmail(value);
      if (key === "marketingEmails") setMarketingEmails(value);

      await api.put("/users/preferences", { [key]: value });
      toast.success("Preferences updated");
    } catch (err) {
      toast.error("Failed to update preferences");
      // Revert on failure
      if (key === "emailNotifications") setEmailNotifications(!value);
      if (key === "inAppNotifications") setInAppNotifications(!value);
      if (key === "generationCompleteEmail") setGenerationCompleteEmail(!value);
      if (key === "marketingEmails") setMarketingEmails(!value);
    }
  };

  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || "No email set";

  return (
    <PageWrapper>
      <div className="space-y-6 p-6">
        {/* Page header */}
        <ScrollReveal>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Manage your account preferences, notifications, and application
            settings.
          </p>
        </ScrollReveal>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* ---- Appearance Tab ---- */}
          <TabsContent value="appearance">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card border-[hsl(var(--border))]">
                <CardHeader>
                  <CardTitle className="text-xl">Theme</CardTitle>
                  <CardDescription>
                    Choose how VidCraft looks to you. Select a theme preference
                    below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Light theme */}
                    <TiltCard tiltAmount={6}>
                      <button
                        onClick={() => setTheme("light")}
                        className={`group flex w-full flex-col items-center gap-3 rounded-xl border p-6 transition-all ${theme === "light"
                          ? "border-gold-500 bg-gold-500/5"
                          : "border-[hsl(var(--border))] hover:border-gold-500/40"
                          }`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${theme === "light"
                            ? "bg-gold-500/20 text-gold-500"
                            : "bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))]"
                            }`}
                        >
                          <Sun className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium">Light</span>
                        {theme === "light" && (
                          <Badge className="bg-gold-500 text-black">Active</Badge>
                        )}
                      </button>
                    </TiltCard>

                    {/* Dark theme */}
                    <TiltCard tiltAmount={6}>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`group flex w-full flex-col items-center gap-3 rounded-xl border p-6 transition-all ${theme === "dark"
                          ? "border-gold-500 bg-gold-500/5"
                          : "border-[hsl(var(--border))] hover:border-gold-500/40"
                          }`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${theme === "dark"
                            ? "bg-gold-500/20 text-gold-500"
                            : "bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))]"
                            }`}
                        >
                          <Moon className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium">Dark</span>
                        {theme === "dark" && (
                          <Badge className="bg-gold-500 text-black">Active</Badge>
                        )}
                      </button>
                    </TiltCard>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ---- Notifications Tab ---- */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="glass-card border-[hsl(var(--border))]">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gold-500" />
                    In-App Notifications
                  </CardTitle>
                  <CardDescription>
                    Control what notifications you receive within VidCraft.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <Label htmlFor="in-app-toggle" className="font-medium">
                          Push Notifications
                        </Label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Receive in-app notifications for important updates
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="in-app-toggle"
                      disabled={isLoadingPrefs}
                      checked={inAppNotifications}
                      onCheckedChange={(val) => updatePreference('inAppNotifications', val)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-[hsl(var(--border))]">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Mail className="h-5 w-5 text-gold-500" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Choose which emails you would like to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <Label htmlFor="email-toggle" className="font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Receive email notifications for account activity
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="email-toggle"
                      disabled={isLoadingPrefs}
                      checked={emailNotifications}
                      onCheckedChange={(val) => updatePreference('emailNotifications', val)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <Label
                          htmlFor="gen-complete-toggle"
                          className="font-medium"
                        >
                          Generation Complete
                        </Label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Get notified when your video finishes generating
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="gen-complete-toggle"
                      disabled={isLoadingPrefs}
                      checked={generationCompleteEmail}
                      onCheckedChange={(val) => updatePreference('generationCompleteEmail', val)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <Label
                          htmlFor="marketing-toggle"
                          className="font-medium"
                        >
                          Marketing Emails
                        </Label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Receive tips, product updates, and promotions
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="marketing-toggle"
                      disabled={isLoadingPrefs}
                      checked={marketingEmails}
                      onCheckedChange={(val) => updatePreference('marketingEmails', val)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ---- Account Tab ---- */}
          <TabsContent value="account">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="glass-card border-[hsl(var(--border))]">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gold-500" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Your account details and subscription information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-[hsl(var(--muted-foreground))]">
                      Email Address
                    </Label>
                    <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted-foreground))]/5 px-4 py-3">
                      <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span className="text-sm">{userEmail}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Verified
                      </Badge>
                    </div>
                  </div>

                  {/* Current tier */}
                  <div className="space-y-2">
                    <Label className="text-[hsl(var(--muted-foreground))]">
                      Current Plan
                    </Label>
                    <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted-foreground))]/5 px-4 py-3">
                      <CreditCard className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span className="text-sm capitalize">{tier} Plan</span>
                      <Badge className="ml-auto bg-gold-500/10 text-gold-500 border-gold-500/30 capitalize">
                        {tier}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Manage subscription */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Manage Subscription
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Update your billing information and plan
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = "/pricing"}
                    >
                      {tier === "free" ? "Upgrade Plan" : "Change Plan"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger zone */}
              <Card className="border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that permanently affect your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                    <div>
                      <p className="text-sm font-medium">Delete Account</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Delete account confirmation */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                This action is permanent and cannot be undone. All your videos,
                settings, and account data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}

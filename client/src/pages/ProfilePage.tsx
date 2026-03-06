import { useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCredits } from "@/hooks/useCredits";
import {
  User,
  Mail,
  Calendar,
  Crown,
  Pencil,
  Check,
  X,
  Camera,
  Loader2,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { TiltCard } from "@/components/animation/TiltCard";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { tier } = useCredits();

  const [isEditingName, setIsEditingName] = useState(false);
  const [firstNameEdit, setFirstNameEdit] = useState("");
  const [lastNameEdit, setLastNameEdit] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoaded || !user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </div>
      </PageWrapper>
    );
  }

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
  const primaryEmail =
    user.primaryEmailAddress?.emailAddress || "No email set";
  const memberSince = user.createdAt ? new Date(user.createdAt) : new Date();

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function startEditing() {
    setFirstNameEdit(user!.firstName || "");
    setLastNameEdit(user!.lastName || "");
    setIsEditingName(true);
  }

  async function handleSaveName() {
    if (!firstNameEdit.trim()) {
      toast.error("First name is required");
      return;
    }
    setIsSaving(true);
    try {
      await user!.update({
        firstName: firstNameEdit.trim(),
        lastName: lastNameEdit.trim(),
      });
      toast.success("Name updated successfully");
      setIsEditingName(false);
    } catch {
      toast.error("Failed to update name");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelEdit() {
    setIsEditingName(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      await user!.setProfileImage({ file });
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemovePhoto() {
    setIsUploadingPhoto(true);
    try {
      await user!.setProfileImage({ file: null });
      toast.success("Profile picture removed");
    } catch {
      toast.error("Failed to remove profile picture");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  return (
    <PageWrapper>
      {/* Full page gradient background wrapper */}
      <div className="relative min-h-screen w-full bg-gradient-to-br from-background via-background/90 to-gold-900/10">

        {/* Subtle decorative blurred blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 space-y-8 p-6 lg:p-12 max-w-4xl mx-auto">
          {/* Page header */}
          <ScrollReveal className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-2">
              Manage your profile information and account details.
            </p>
          </ScrollReveal>

          <div className="w-full space-y-8">
            {/* Profile Card */}
            <ScrollReveal delay={0.1}>
              <TiltCard tiltAmount={3}>
                <Card className="glass-card border-[hsl(var(--border))] overflow-hidden">
                  {/* Gradient banner */}
                  <div className="relative h-40 bg-gradient-to-r from-gold-500/20 via-amber-500/10 to-gold-600/20" />

                  <CardContent className="relative px-6 pb-8 sm:px-10">
                    {/* Avatar + info row */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 -mt-16">
                      <div className="relative group shrink-0">
                        <Avatar className="h-32 w-32 border-4 border-[hsl(var(--background))] shadow-xl">
                          <AvatarImage src={user.imageUrl} alt={fullName} />
                          <AvatarFallback className="bg-gold-500 text-black text-4xl font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isUploadingPhoto ? (
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                          ) : (
                            <Camera className="h-5 w-5 text-white" />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </div>

                      <div className="flex-1 pt-2 sm:pt-20 space-y-1.5">
                        <h2 className="text-2xl font-bold">{fullName}</h2>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {primaryEmail}
                        </p>
                      </div>

                      <div className="sm:pt-20">
                        <Badge className="bg-gold-500/10 text-gold-500 border-gold-500/30 capitalize px-3 py-1 text-sm">
                          <Crown className="h-4 w-4 mr-1.5" />
                          {tier}
                        </Badge>
                      </div>
                    </div>

                    {/* Photo actions */}
                    <div className="flex justify-center sm:justify-start gap-3 mt-6 sm:ml-[10.5rem]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                      {user.hasImage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemovePhoto}
                          disabled={isUploadingPhoto}
                          className="text-[hsl(var(--muted-foreground))]"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            </ScrollReveal>

            {/* Personal Info Card */}
            <ScrollReveal delay={0.2}>
              <Card className="glass-card border-[hsl(var(--border))]">
                <CardContent className="p-6 space-y-5">
                  <h3 className="text-lg font-semibold">Personal Information</h3>

                  {/* Name fields */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      Full Name
                    </Label>
                    {isEditingName ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">
                              First Name
                            </Label>
                            <Input
                              value={firstNameEdit}
                              onChange={(e) => setFirstNameEdit(e.target.value)}
                              placeholder="First name"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveName();
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">
                              Last Name
                            </Label>
                            <Input
                              value={lastNameEdit}
                              onChange={(e) => setLastNameEdit(e.target.value)}
                              placeholder="Last name"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveName();
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveName}
                            disabled={isSaving}
                            className="bg-gold-500 hover:bg-gold-600 text-white"
                          >
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <p className="text-base font-medium">{fullName}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[hsl(var(--muted-foreground))] hover:text-gold-500"
                          onClick={startEditing}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      Email Address
                    </Label>
                    <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-4 py-3">
                      <span className="text-sm">{primaryEmail}</span>
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs gap-1"
                      >
                        <Shield className="h-3 w-3" />
                        Managed by Clerk
                      </Badge>
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Email is managed through your authentication provider.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Stats Card */}
            <ScrollReveal delay={0.3}>
              <Card className="glass-card border-[hsl(var(--border))]">
                <CardContent className="p-6 space-y-5">
                  <h3 className="text-lg font-semibold">Account Overview</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TiltCard tiltAmount={6}>
                      <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gold-500" />
                          <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                            Member Since
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          {format(memberSince, "MMM d, yyyy")}
                        </p>
                      </div>
                    </TiltCard>

                    <TiltCard tiltAmount={6}>
                      <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="h-4 w-4 text-gold-500" />
                          <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                            Current Tier
                          </span>
                        </div>
                        <Badge className="bg-gold-500/10 text-gold-500 border-gold-500/30 capitalize">
                          {tier}
                        </Badge>
                      </div>
                    </TiltCard>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

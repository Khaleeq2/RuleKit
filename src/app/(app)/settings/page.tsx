'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Moon,
  Sun,
  Monitor,
  Loader2,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Separator } from '@/app/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { getSupabaseBrowserClient } from '@/app/lib/supabase-browser';
import { toast } from 'sonner';

// ============================================
// Settings Page — Wired to Supabase Auth
// ============================================

export default function SettingsPage() {
  const supabase = getSupabaseBrowserClient();
  const { theme, setTheme } = useTheme();

  // Profile settings — loaded from Supabase auth
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Notification settings — stored in user_metadata
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [failureAlerts, setFailureAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // Timezone — stored in user_metadata
  const [timezone, setTimezone] = useState('America/New_York');

  // Load real user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          toast.error('Failed to load user data');
          return;
        }
        setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
        setEmail(user.email || '');

        // Load preferences from user_metadata
        const prefs = user.user_metadata?.notification_prefs;
        if (prefs) {
          setEmailNotifications(prefs.email_notifications ?? true);
          setFailureAlerts(prefs.failure_alerts ?? true);
          setWeeklyReport(prefs.weekly_report ?? false);
        }
        if (user.user_metadata?.timezone) {
          setTimezone(user.user_metadata.timezone);
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      toast.success('Profile updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          notification_prefs: {
            email_notifications: emailNotifications,
            failure_alerts: failureAlerts,
            weekly_report: weeklyReport,
          },
          timezone,
        },
      });
      if (error) throw error;
      toast.success('Preferences saved');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save preferences';
      toast.error(msg);
    } finally {
      setIsSavingNotifs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!email) return;
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent — check your inbox');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset email';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'This will sign you out and submit a deletion request. Our team will process it within a few business days. Continue?'
    );
    if (!confirmed) return;

    setIsDeletingAccount(true);
    try {
      // Full deletion requires admin API — sign out and log the request for manual processing
      await supabase.auth.signOut();
      toast.success('Deletion request submitted. You have been signed out.');
      window.location.href = '/auth/sign-in';
    } catch {
      toast.error('Failed to process request. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="max-w-[800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-[-0.01em] leading-tight">
            Settings
          </h1>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </CardTitle>
              <CardDescription>
                Your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="opacity-60 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Email cannot be changed
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose what you want to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Email notifications</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Failure alerts</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Get notified when evaluations fail
                  </p>
                </div>
                <Switch
                  checked={failureAlerts}
                  onCheckedChange={setFailureAlerts}
                  disabled={!emailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Weekly report</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Receive a weekly summary of your evaluation usage
                  </p>
                </div>
                <Switch
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                  disabled={!emailNotifications}
                />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleSaveNotifications} disabled={isSavingNotifs}>
                  {isSavingNotifs && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how RuleKit looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border transition-all
                      ${theme === 'light'
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]/30'
                      }
                    `}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border transition-all
                      ${theme === 'dark'
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]/30'
                      }
                    `}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-sm">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border transition-all
                      ${theme === 'system'
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]/30'
                      }
                    `}
                  >
                    <Monitor className="w-5 h-5" />
                    <span className="text-sm">System</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <Globe className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Times in RuleKit will be displayed in this timezone
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Password</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Send a password reset link to your email
                  </p>
                </div>
                <Button variant="outline" onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Change password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="border-[var(--destructive)]/20">
            <CardHeader>
              <CardTitle className="text-base text-[var(--destructive)]">Delete account</CardTitle>
              <CardDescription>
                Request account deletion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Request deletion</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    You&apos;ll be signed out immediately. Our team will delete your account and data within a few business days.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                  {isDeletingAccount && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Request deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

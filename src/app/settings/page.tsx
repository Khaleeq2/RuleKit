'use client';

import { useState } from 'react';
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
import { toast } from 'sonner';

// ============================================
// Settings Page
// ============================================

export default function SettingsPage() {
  // Profile settings
  const [name, setName] = useState('User');
  const [email, setEmail] = useState('user@example.com');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [failureAlerts, setFailureAlerts] = useState(true);
  const [deploymentNotifs, setDeploymentNotifs] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // Appearance settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [timezone, setTimezone] = useState('America/New_York');

  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveProfile = () => {
    toast.success('Profile updated');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleChangePassword = () => {
    toast.success('Password reset email sent');
  };

  return (
    <div className="min-h-full">
      <div className="max-w-[800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
            Settings
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
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
                    Get notified when decisions fail
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
                    Receive a weekly summary of your decision usage
                  </p>
                </div>
                <Switch
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                  disabled={!emailNotifications}
                />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleSaveNotifications}>
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
                  <p className="font-medium text-[var(--foreground)]">Two-factor authentication</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Password</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Change your password
                  </p>
                </div>
                <Button variant="outline" onClick={handleChangePassword}>
                  Change password
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Active sessions</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Manage devices where you're logged in
                  </p>
                </div>
                <Button variant="outline">
                  View sessions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-[var(--destructive)]/20">
            <CardHeader>
              <CardTitle className="text-base text-[var(--destructive)]">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Delete account</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive">
                  Delete account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

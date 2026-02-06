'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/app/components/ui/command';
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  CheckCircle2,
  Clock,
  LogOut,
  ChevronLeft,
  Plus,
  Sparkles,
  Bell,
  Search,
  Settings,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

const navigationItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Rules', href: '/dashboard/rules', icon: BookOpen },
  { label: 'Assets', href: '/dashboard/assets', icon: FolderOpen },
  { label: 'Validation', href: '/dashboard/validation', icon: CheckCircle2 },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openAsk = (q: string) => {
    setCommandOpen(false);
    router.push(`/dashboard?ask=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    try {
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    }
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-[280px]' : 'w-[80px]'
        } bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300 ease-out flex flex-col relative`}
      >
        {/* Logo Section */}
        <div className={`p-6 ${!sidebarOpen && 'px-4'}`}>
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center'}`}>
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src="/RuleKit-Slate-Blue.svg"
                alt="RuleKit Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="text-[18px] font-semibold text-[var(--foreground)] tracking-[0.02em]">
                  RuleKit
                </h1>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1.5 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                    transition-colors duration-150 ease-out group relative
                    ${!sidebarOpen && 'justify-center px-3'}
                    ${isActive 
                      ? 'bg-[var(--foreground)] text-[var(--background)]' 
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <span className="font-medium text-sm block">{item.label}</span>
                  )}
                  {isActive && sidebarOpen && (
                    <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Pro Upgrade - Subtle Gradient Card */}
          {sidebarOpen && (
            <div className="mx-1 mb-4 p-4 rounded-xl bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/10 dark:to-transparent border border-indigo-100 dark:border-indigo-900/20">
              <div className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-indigo-950/50 flex items-center justify-center shadow-sm border border-indigo-50 dark:border-indigo-900/30">
                  <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 fill-indigo-500/20" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-0.5">Upgrade to Pro</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Get advanced validation rules</p>
                </div>
                <button className="w-full py-2 text-xs font-medium text-white bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity shadow-sm">
                  View Plans
                </button>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* User Section */}
        <div className={`p-4 border-t border-[var(--border)] ${!sidebarOpen && 'px-3'}`}>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600
              dark:hover:bg-red-950/30 dark:hover:text-red-400
              transition-all duration-200 group
              ${!sidebarOpen && 'justify-center px-3'}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {sidebarOpen && <span className="font-medium text-sm">Sign out</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-all duration-200 z-10"
        >
          <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${!sidebarOpen && 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="w-[280px] h-10 pl-10 pr-10 text-sm bg-[var(--muted)] border-0 rounded-xl text-left text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/35 transition-all duration-200"
              >
                Ask anything...
              </button>
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)] bg-[var(--background)] rounded border border-[var(--border)]">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--foreground)] rounded-full" />
            </button>

            {/* Settings */}
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200">
              <Settings className="w-5 h-5" />
            </button>

            {/* User Avatar */}
            <button className="ml-2 flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--muted)] transition-all duration-200">
              <div className="w-8 h-8 rounded-full bg-[var(--foreground)] flex items-center justify-center text-[var(--background)] text-sm font-medium">
                U
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[var(--foreground)]">User</p>
                <p className="text-xs text-[var(--muted-foreground)]">Pro Plan</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[var(--background)]">
          {children}
        </main>

        {/* Command Palette */}
        <CommandDialog
          open={commandOpen}
          onOpenChange={setCommandOpen}
          title="RuleKit"
          description="Ask RuleKit or jump to a page"
        >
          <CommandInput placeholder="Ask RuleKit or search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Ask">
              <CommandItem onSelect={() => openAsk('Show failures')}>
                <Sparkles className="w-4 h-4" />
                Show failures
              </CommandItem>
              <CommandItem onSelect={() => openAsk('Show recent decisions')}>
                <Clock className="w-4 h-4" />
                Show recent decisions
              </CommandItem>
              <CommandItem onSelect={() => openAsk('Why did my pass rate change?')}>
                <LayoutDashboard className="w-4 h-4" />
                Explain pass rate
              </CommandItem>
              <CommandItem onSelect={() => openAsk('Execute rules')}>
                <Zap className="w-4 h-4" />
                Execute rules
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navigate">
              <CommandItem onSelect={() => { setCommandOpen(false); router.push('/dashboard'); }}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </CommandItem>
              <CommandItem onSelect={() => { setCommandOpen(false); router.push('/dashboard/rules'); }}>
                <BookOpen className="w-4 h-4" />
                Rules
              </CommandItem>
              <CommandItem onSelect={() => { setCommandOpen(false); router.push('/dashboard/assets'); }}>
                <FolderOpen className="w-4 h-4" />
                Assets
              </CommandItem>
              <CommandItem onSelect={() => { setCommandOpen(false); router.push('/dashboard/validation'); }}>
                <CheckCircle2 className="w-4 h-4" />
                Validation
              </CommandItem>
              <CommandItem onSelect={() => { setCommandOpen(false); router.push('/dashboard/rules/new'); }}>
                <Plus className="w-4 h-4" />
                Create rule
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </div>
  );
}

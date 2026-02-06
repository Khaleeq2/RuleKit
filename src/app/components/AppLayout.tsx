'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  GitBranch,
  Play,
  Settings,
  LogOut,
  User,
  Coins,
  Sun,
  Moon,
  ChevronsUpDown,
  ChevronRight,
  Building2,
  Plus,
  Check,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { billingRepo } from '@/app/lib/billing';
import { PageTransition } from '@/app/components/PageTransition';
import { CreditBalance } from '@/app/lib/types';

// ============================================
// Navigation Items
// ============================================

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, href: '/home' },
  { id: 'decisions', label: 'Rules', icon: GitBranch, href: '/decisions' },
  { id: 'history', label: 'History', icon: Play, href: '/history' },
] as const;

// ============================================
// Mock workspaces (UI-only for now)
// ============================================

const WORKSPACES = [
  { id: 'default', name: 'Default Workspace', isActive: true },
  { id: 'staging', name: 'Staging', isActive: false },
] as const;

// ============================================
// AppLayout Component
// ============================================

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const logoSrc = mounted && resolvedTheme === 'dark'
    ? '/RuleKit-White.svg'
    : '/RuleKit-Slate-Blue.svg';

  // Load credits
  useEffect(() => {
    const loadCredits = async () => {
      const balance = await billingRepo.getBalance();
      setCredits(balance);
    };
    loadCredits();

    const unsubscribe = billingRepo.subscribe(() => {
      loadCredits();
    });

    return unsubscribe;
  }, []);

  const getActiveNavId = () => {
    if (pathname === '/' || pathname === '/home') return 'home';
    if (pathname.startsWith('/decisions')) return 'decisions';
    if (pathname.startsWith('/history')) return 'history';
    return 'home';
  };

  const activeNavId = getActiveNavId();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-screen flex flex-col bg-[var(--background)]">

        {/* ── Top Bar ── full width, fixed height */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 border-b border-[var(--border)]">
          {/* Left: Logo */}
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src={logoSrc}
                alt="RuleKit"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[15px] font-semibold text-[var(--foreground)] tracking-tight">
              RuleKit
            </span>
          </Link>

          {/* Right: Workspace Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-8 px-3 rounded-lg text-[13px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                <Building2 className="w-4 h-4" />
                <span>Default Workspace</span>
                <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[var(--popover)] border border-[var(--border)] shadow-xl">
              <DropdownMenuLabel className="text-xs text-[var(--muted-foreground)]">Workspaces</DropdownMenuLabel>
              {WORKSPACES.map((ws) => (
                <DropdownMenuItem key={ws.id} className="flex items-center justify-between">
                  <span>{ws.name}</span>
                  {ws.isActive && <Check className="w-3.5 h-3.5 text-[var(--brand)]" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Plus className="w-3.5 h-3.5 mr-2" />
                Create workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* ── Below header: icon rail + content ── */}
        <div className="flex-1 flex min-h-0">

          {/* Sidebar — icon rail with hover expand chevron */}
          <aside className="relative w-[60px] flex-shrink-0 border-r border-[var(--border)] flex flex-col group/sidebar">

            {/* Expand chevron — appears on sidebar hover */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="
                    absolute -right-3 top-3 z-50
                    w-6 h-6 rounded-full
                    bg-[var(--card)] border border-[var(--border)] shadow-sm
                    flex items-center justify-center
                    text-[var(--muted-foreground)] hover:text-[var(--foreground)]
                    opacity-0 group-hover/sidebar:opacity-100
                    transition-all duration-200
                    cursor-pointer
                  "
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Expand sidebar
              </TooltipContent>
            </Tooltip>

            {/* Navigation */}
            <nav className="flex-1 py-3">
              <ul className="space-y-1 px-2.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeNavId === item.id;
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={`
                              flex items-center justify-center py-2.5 rounded-lg
                              transition-all duration-150
                              ${isActive
                                ? 'bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.06)]'
                                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/70'
                              }
                            `}
                          >
                            <Icon className="w-[18px] h-[18px]" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom: User Menu */}
            <div className="px-2.5 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex items-center justify-center w-full p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          U
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      <span>user@example.com</span>
                      {credits && (
                        <span className={`ml-2 text-xs tabular-nums ${credits.balance <= 10 ? 'text-[var(--warning)]' : ''}`}>
                          ({credits.balance} credits)
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right" className="w-52">
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/billing')}>
                    <Coins className="w-4 h-4 mr-2" />
                    Credits & Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
                    {resolvedTheme === 'dark' ? (
                      <Sun className="w-4 h-4 mr-2" />
                    ) : (
                      <Moon className="w-4 h-4 mr-2" />
                    )}
                    {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[var(--destructive)]">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 overflow-auto">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default AppLayout;

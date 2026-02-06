'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  ShieldCheck,
  Play,
  Settings,
  LogOut,
  User,
  Coins,
  Sun,
  Moon,
  ChevronsUpDown,
  ChevronRight,
  ChevronLeft,
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
  { id: 'decisions', label: 'Rules', icon: ShieldCheck, href: '/decisions' },
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

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

          {/* Sidebar — expandable icon rail */}
          <aside
            onClick={(e) => {
              if (e.target === e.currentTarget) setSidebarExpanded(!sidebarExpanded);
            }}
            className={`
              relative flex-shrink-0 border-r border-[var(--border)] flex flex-col group/sidebar
              transition-all duration-200 ease-in-out cursor-pointer
              ${sidebarExpanded ? 'w-[200px]' : 'w-[60px]'}
            `}
          >

            {/* Toggle chevron — vertically centered, appears on hover */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className={`
                    absolute -right-3 top-1/2 -translate-y-1/2 z-50
                    w-6 h-6 rounded-full
                    bg-[var(--card)] border border-[var(--ring)]/40 shadow-sm
                    flex items-center justify-center
                    text-[var(--muted-foreground)] hover:text-[var(--foreground)]
                    transition-all duration-200
                    cursor-pointer
                    ${sidebarExpanded ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'}
                  `}
                >
                  {sidebarExpanded
                    ? <ChevronLeft className="w-3 h-3" />
                    : <ChevronRight className="w-3 h-3" />
                  }
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              </TooltipContent>
            </Tooltip>

            {/* Navigation */}
            <nav
              className="flex-1 py-3"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSidebarExpanded(!sidebarExpanded);
              }}
            >
              <ul className="space-y-1 px-2.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeNavId === item.id;
                  const Icon = item.icon;

                  const navLink = (
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 py-2.5 rounded-lg
                        transition-all duration-150
                        ${sidebarExpanded ? 'px-3' : 'justify-center'}
                        ${isActive
                          ? 'bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] shadow-[0_1px_2px_0_rgb(0_0_0/0.06)]'
                          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/70'
                        }
                      `}
                    >
                      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {sidebarExpanded && (
                        <span className="text-sm font-medium truncate">{item.label}</span>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.id}>
                      {sidebarExpanded ? navLink : (
                        <Tooltip>
                          <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom: User Menu */}
            <div className="px-2.5 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center w-full p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors ${sidebarExpanded ? 'gap-2.5' : 'justify-center'}`}>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      U
                    </div>
                    {sidebarExpanded && (
                      <span className="text-sm text-[var(--foreground)] truncate">user@example.com</span>
                    )}
                  </button>
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

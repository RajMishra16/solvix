'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth0-provider';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function TopNav() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const userName = user?.name ?? 'Guest User';
  const userEmail = user?.email ?? 'guest@example.com';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    await logout();
    router.push('/');
  }

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
        <Link
          href="/home"
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg text-foreground tracking-tight">
            Solvix
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-full hover:bg-muted/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-medium shadow-sm">
              {userInitials}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <div className="px-2 py-3 mb-1">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2.5 cursor-pointer">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2.5 cursor-pointer">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleSignOut}
              className="py-2.5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

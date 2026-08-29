'use client';

import { ReactNode } from 'react';
import { TopNav } from './top-nav';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  className?: string;
  hideNav?: boolean;
}

export function AppShell({ children, className, hideNav = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideNav && <TopNav />}
      <main className={cn('flex-1 flex flex-col', className)}>
        {children}
      </main>
    </div>
  );
}

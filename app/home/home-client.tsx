'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { usePlanStore } from '@/stores/plan-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/lib/auth0-provider';
import { AppShell } from '@/components/layout/app-shell';
import { PageTransition } from '@/components/layout/page-transition';
import { Button } from '@/components/ui/button';
import { PlanCard } from '@/components/home/plan-card';
import { EmptyState } from '@/components/home/empty-state';
import { DashboardControls } from '@/components/home/dashboard-controls';
import type { Plan, PlanStatus } from '@/types/plan';

function filterAndSortPlans(
  plans: Plan[],
  searchQuery: string,
  statusFilter: 'all' | PlanStatus,
  sortBy: 'date' | 'name' | 'status'
): Plan[] {
  let filtered = plans;

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (plan) =>
        plan.name.toLowerCase().includes(query) ||
        plan.area.address?.toLowerCase().includes(query)
    );
  }

  if (statusFilter !== 'all') {
    filtered = filtered.filter((plan) => plan.status === statusFilter);
  }

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status': {
        const statusOrder: Record<PlanStatus, number> = { complete: 0, analyzing: 1, draft: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      default:
        return 0;
    }
  });

  return sorted;
}

export default function HomeClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { plans, initializeSampleData, initialized } = usePlanStore();
  const {
    dashboardSearchQuery,
    setDashboardSearchQuery,
    dashboardSortBy,
    setDashboardSortBy,
    dashboardStatusFilter,
    setDashboardStatusFilter,
    dashboardViewMode,
    setDashboardViewMode,
  } = useUIStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    initializeSampleData();
  }, [initializeSampleData]);

  const filteredPlans = useMemo(
    () => filterAndSortPlans(plans, dashboardSearchQuery, dashboardStatusFilter, dashboardSortBy),
    [plans, dashboardSearchQuery, dashboardStatusFilter, dashboardSortBy]
  );

  if (!initialized && plans.length === 0) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageTransition className="flex-1 p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Your Plans
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your energy projects and analyses
            </p>
          </div>

          {plans.length > 0 && (
            <Link href="/area-select">
              <Button className="shadow-sm hover:shadow-md transition-shadow">
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </Link>
          )}
        </header>

        {plans.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <DashboardControls
              searchQuery={dashboardSearchQuery}
              onSearchChange={setDashboardSearchQuery}
              sortBy={dashboardSortBy}
              onSortChange={setDashboardSortBy}
              statusFilter={dashboardStatusFilter}
              onStatusFilterChange={setDashboardStatusFilter}
              viewMode={dashboardViewMode}
              onViewModeChange={setDashboardViewMode}
              totalCount={plans.length}
              filteredCount={filteredPlans.length}
            />

            {filteredPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground">No plans match your filters.</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => {
                    setDashboardSearchQuery('');
                    setDashboardStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div
                className={
                  dashboardViewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'
                    : 'flex flex-col gap-4 mt-6'
                }
              >
                {filteredPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </>
        )}
      </PageTransition>
    </AppShell>
  );
}

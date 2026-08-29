'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Leaf,
  MoreHorizontal,
  Download,
  Share2,
  Copy,
  Trash2,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlanDetailPanel } from '@/components/overview';
import { usePlanStore } from '@/stores/plan-store';
import type { Plan } from '@/types/plan';

const TerrainAnalysisScene = dynamic(
  () => import('@/components/3d/terrain-analysis-scene').then((mod) => mod.TerrainAnalysisScene),
  { ssr: false }
);

const AnalysisOverlay = dynamic(
  () => import('@/components/3d/analysis-overlay').then((mod) => mod.AnalysisOverlay),
  { ssr: false }
);

export default function OverviewPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const { plans, updatePlan, deletePlan } = usePlanStore();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (planId) {
      const found = plans.find(p => p.id === planId);
      if (found) {
        setPlan(found);
        setEditedName(found.name);
      } else {
        router.push('/home');
      }
    } else {
      router.push('/home');
    }
  }, [planId, plans, router]);

  const handleStartEditName = useCallback(() => {
    setIsEditingName(true);
    setEditedName(plan?.name || '');
  }, [plan?.name]);

  const handleSaveName = useCallback(() => {
    if (plan && editedName.trim()) {
      updatePlan(plan.id, { name: editedName.trim() });
    }
    setIsEditingName(false);
  }, [plan, editedName, updatePlan]);

  const handleCancelEditName = useCallback(() => {
    setIsEditingName(false);
    setEditedName(plan?.name || '');
  }, [plan?.name]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEditName();
    }
  }, [handleSaveName, handleCancelEditName]);

  const handleDelete = useCallback(() => {
    if (plan) {
      deletePlan(plan.id);
      router.push('/home');
    }
  }, [plan, deletePlan, router]);

  // ✅ FIXED (safe window usage)
  const handleShare = useCallback(() => {
    if (plan && typeof window !== "undefined") {
      const url = `${window.location.origin}/overview/${plan.id}`;
      navigator.clipboard.writeText(url);
    }
  }, [plan]);

  if (!plan) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading plan...</div>
      </div>
    );
  }

  const polygonCoords = plan.area.coordinates.map(c => ({ lat: c.lat, lng: c.lng }));

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col lg:flex-row">
      <div className="relative h-[40vh] lg:h-full lg:w-[60%] flex-shrink-0 bg-slate-50">
        <TerrainAnalysisScene
          phase="complete"
          progress={1}
          isVisible={true}
          polygon={polygonCoords}
          className="right-0"
        />

        <AnalysisOverlay
          phase="complete"
          progress={1}
          isAnalyzing={false}
          locationName={plan.area.address ? plan.area.address.split(',')[0] : 'Remote Location'}
          className="right-0"
          onBack={() => router.push('/home')}
        />
      </div>

      <div className="flex-1 lg:w-[40%] flex flex-col border-l border-border overflow-hidden">
        <header className="shrink-0 z-30 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="flex-1 px-3 py-1.5 text-lg font-semibold bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName} className="h-8 w-8">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEditName} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={handleStartEditName}
                  className="flex items-center gap-2 min-w-0 group"
                >
                  <h1 className="text-lg font-semibold text-foreground truncate">
                    {plan.name}
                  </h1>
                  <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>

            {/* ✅ FIXED HERE */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => { }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {plan.area.address && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {plan.area.address}
            </p>
          )}
        </header>

        <PlanDetailPanel plan={plan} className="flex-1" />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{plan.name}&quot; and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
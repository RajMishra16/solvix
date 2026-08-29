import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeJSONStorage } from '@/lib/zustand-storage';

type SidebarType = 'constraints' | 'agent' | 'analytics' | 'billing' | 'implementation' | null;
type SortBy = 'date' | 'name' | 'status';
type StatusFilter = 'all' | 'draft' | 'analyzing' | 'complete';
type ViewMode = 'grid' | 'list';

interface UIState {
  // Sidebar state
  sidebarOpen: SidebarType;
  openSidebar: (type: SidebarType) => void;
  closeSidebar: () => void;
  
  // Map state
  isMapFullscreen: boolean;
  setMapFullscreen: (value: boolean) => void;
  mapStyle: 'street' | 'satellite';
  setMapStyle: (style: 'street' | 'satellite') => void;
  
  // Dashboard preferences
  dashboardSortBy: SortBy;
  setDashboardSortBy: (sort: SortBy) => void;
  dashboardStatusFilter: StatusFilter;
  setDashboardStatusFilter: (status: StatusFilter) => void;
  dashboardViewMode: ViewMode;
  setDashboardViewMode: (mode: ViewMode) => void;
  dashboardSearchQuery: string;
  setDashboardSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar state
      sidebarOpen: null,
      openSidebar: (type) => set({ sidebarOpen: type }),
      closeSidebar: () => set({ sidebarOpen: null }),
      
      // Map state
      isMapFullscreen: false,
      setMapFullscreen: (value) => set({ isMapFullscreen: value }),
      mapStyle: 'street',
      setMapStyle: (style) => set({ mapStyle: style }),
      
      // Dashboard preferences
      dashboardSortBy: 'date',
      setDashboardSortBy: (sort) => set({ dashboardSortBy: sort }),
      dashboardStatusFilter: 'all',
      setDashboardStatusFilter: (status) => set({ dashboardStatusFilter: status }),
      dashboardViewMode: 'grid',
      setDashboardViewMode: (mode) => set({ dashboardViewMode: mode }),
      dashboardSearchQuery: '',
      setDashboardSearchQuery: (query) => set({ dashboardSearchQuery: query }),
    }),
    {
      name: 'Solvix-ui',
      storage: safeJSONStorage,
      partialize: (state) => ({
        dashboardSortBy: state.dashboardSortBy,
        dashboardStatusFilter: state.dashboardStatusFilter,
        dashboardViewMode: state.dashboardViewMode,
        mapStyle: state.mapStyle,
      }),
    }
  )
);

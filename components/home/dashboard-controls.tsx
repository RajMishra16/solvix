"use client"

import { Search, LayoutGrid, List, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: 'date' | 'name' | 'status'
  onSortChange: (sort: 'date' | 'name' | 'status') => void
  statusFilter: 'all' | 'draft' | 'analyzing' | 'complete'
  onStatusFilterChange: (status: 'all' | 'draft' | 'analyzing' | 'complete') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  totalCount: number
  filteredCount: number
}

export function DashboardControls({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
}: DashboardControlsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="bg-muted/30 border border-border/50 rounded-xl p-3 md:p-2 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between shadow-sm backdrop-blur-sm">
        
        <div className="relative w-full md:w-[320px] lg:w-[400px] group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors duration-200" />
          </div>
          <Input 
            placeholder="Search plans..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background/50 border-transparent hover:bg-background focus:bg-background focus:border-input transition-all duration-200 shadow-none h-10 md:h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          
          <div className="hidden lg:flex items-center bg-background/50 border border-border/40 p-0.5 rounded-lg mr-2">
            {(['all', 'draft', 'analyzing', 'complete'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 capitalize",
                  statusFilter === status 
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm ring-1 ring-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            
            <Select value={sortBy} onValueChange={(value) => value && onSortChange(value as 'date' | 'name' | 'status')}>
              <SelectTrigger className="h-10 md:h-9 bg-background/50 border-transparent hover:bg-background transition-all min-w-[140px] flex-1 md:flex-none">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm truncate">
                    <span className="text-muted-foreground font-normal mr-1">Sort by:</span>
                    <span className="font-medium capitalize">{sortBy}</span>
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border border-border/40 rounded-lg p-0.5 bg-background/50 h-10 md:h-9 shrink-0">
              <Button 
                variant="ghost" 
                size="icon-sm"
                className={cn(
                  "h-full w-8 rounded-md transition-all", 
                  viewMode === 'grid' 
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => onViewModeChange('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon-sm"
                className={cn(
                  "h-full w-8 rounded-md transition-all", 
                  viewMode === 'list' 
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => onViewModeChange('list')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between px-1">
        
        <div className="flex lg:hidden overflow-x-auto pb-1 w-full sm:w-auto -mx-1 px-1 scrollbar-hide">
          <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-border/40 min-w-full sm:min-w-0">
            {(['all', 'draft', 'analyzing', 'complete'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status)}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize whitespace-nowrap",
                  statusFilter === status 
                    ? "bg-background text-primary shadow-sm ring-1 ring-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-medium animate-in fade-in slide-in-from-bottom-2 duration-500">
          Showing <span className="text-foreground">{filteredCount}</span> of <span className="text-foreground">{totalCount}</span> plans
        </div>
      </div>
    </div>
  )
}

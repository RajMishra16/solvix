# Solvix Development Learnings

This document captures learnings, decisions, gotchas, and discoveries made during the RALPH loop development process. Update this file after completing each task.

---

## How to Use This Document

After completing each task:
1. Add an entry under the relevant section
2. Include the task ID, date, and description
3. Note any decisions made and why
4. Document gotchas or issues encountered
5. Record any reusable patterns discovered

When starting a new task:
1. Search this document for relevant prior learnings
2. Copy relevant sections into your RALPH prompt's "Previous Context" section

---

## Project Setup & Configuration

### Task 1.1 - Project Setup
*Date: Jan 24, 2026*

**Decisions Made:**
- [x] Folder structure: components/{layout,landing,auth,home,map,plan}, stores/, types/
- [x] Package manager: npm
- [x] Initial dependencies: framer-motion, zustand added to existing Next.js 16 + shadcn/ui stack

**Tech Stack Versions:**
- Next.js 16.1.4 (with Turbopack)
- React 19.2.3
- Tailwind CSS v4
- shadcn/ui (base-vega style)
- Framer Motion (latest)
- Zustand (latest)

**Gotchas:**
- Next.js 16 auto-generates type validation files in `types/` directory (validator.ts, routes.d.ts, cache-life.d.ts). These should NOT be checked in and may cause build failures if stale. Delete them if build fails with type errors about missing modules.
- shadcn/ui uses @base-ui/react primitives in base-vega style (not radix-ui)

**Code Patterns:**
- Path alias: `@/*` maps to project root
- CSS variables defined in globals.css using OKLCH color space
- Primary color is a forest green (oklch 0.60 0.13 163) 

---

### Task 1.2 - Theme Configuration
*Date: [DATE]*

**Color Tokens Defined:**
```css
/* Document the final color values here */
--background: 
--foreground: 
--primary: 
--primary-foreground: 
--secondary: 
--accent: 
--muted: 
--border: 
/* etc */
```

**Decisions Made:**
- 

**Gotchas:**
- 

---

## Component Patterns

### Base Components

#### AppShell
*From Task 1.3*

```tsx
import { AppShell } from '@/components/layout';

// Wrap authenticated pages
<AppShell>
  <YourPageContent />
</AppShell>

// Hide nav for fullscreen pages (e.g., map)
<AppShell hideNav>
  <FullscreenMap />
</AppShell>
```

#### TopNav
*From Task 1.3*

- Logo links to `/`
- Nav links (Dashboard, New Plan) hidden on mobile
- User dropdown with Settings and Sign out
- Uses base-ui Menu primitives (not radix)

#### Sidebar
*From Task 1.3*

```tsx
import { Sidebar } from '@/components/layout';

<Sidebar
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Constraints"
  width="lg" // sm (320px), md (384px), lg (480px)
>
  <SidebarContent />
</Sidebar>
```

**Animation Config:**
- Type: Spring
- Damping: 30
- Stiffness: 300
- Overlay: backdrop-blur-sm + black/20

---

### Auth Components
*From Task 1.4*

#### AuthLayout
Split-screen layout for login/register pages:
- Left side: Branded green background with animated icons, logo, quote
- Right side: Form content area
- Responsive: Stacks on mobile

```tsx
import { AuthLayout } from '@/components/auth';

<AuthLayout quote="Your quote" author="Attribution">
  <YourFormContent />
</AuthLayout>
```

#### Auth Store (Mock)
```tsx
import { useAuthStore } from '@/stores/auth-store';

const { user, isAuthenticated, login, logout } = useAuthStore();

// Login sets default mock user
login(); // or login({ name: 'Custom Name' })

// Logout clears user
logout();
```

#### Password Strength Indicator
Register page includes a 5-bar password strength meter:
- Checks: length >= 8, length >= 12, mixed case, digits, special chars
- Visual: Colored bars (red → orange → yellow → green → emerald)

---

### Landing Components

#### Hero Section
*From Task 2.1*

**Files Created:**
- `components/landing/hero.tsx` - Full viewport hero with animated background
- `components/landing/index.ts` - Barrel export

```tsx
import { Hero } from '@/components/landing';

// In app/page.tsx
<main>
  <Hero />
  <section id="learn-more">...</section>
</main>
```

**Features:**
- Full viewport height (min-h-screen)
- Animated floating particles (20 dots, CSS/Framer Motion)
- Gradient orbs with parallax scroll effect
- Subtle grid pattern overlay (3% opacity)
- Staggered entrance animations
- Bouncing scroll indicator that fades on scroll

**Animation Config:**
- Background particles: 10-30s duration cycles
- Hero content: 0.8s duration, staggered delays (0.1s, 0.2s, 0.3s)
- Easing: [0.22, 1, 0.36, 1] (custom cubic bezier)
- Scroll indicator: 2s bounce loop

**Gotchas:**
- **base-ui Button does NOT support `asChild` prop** like radix-ui. Use `render` prop instead:
  ```tsx
  // WRONG (radix pattern)
  <Button asChild><Link href="/x">...</Link></Button>
  
  // CORRECT (base-ui pattern)
  <Button render={(props) => <Link {...props} href="/x" />}>...</Button>
  ```

---

#### Landing Page Sections
*From Task 2.2*

**Files Created:**
- `components/landing/how-it-works.tsx` - 3-step process
- `components/landing/stats-bar.tsx` - Animated number counters
- `components/landing/testimonials.tsx` - Customer quotes grid
- `components/landing/final-cta.tsx` - Closing CTA section
- `components/landing/footer.tsx` - Site footer

**Scroll Animation Pattern:**
```tsx
import { motion, useInView } from "framer-motion"

function Section() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        Content
      </motion.div>
    </section>
  )
}
```

**Animated Counter Pattern (stats-bar):**
- Uses `useSpring` from framer-motion
- Triggers on `useInView` becoming true
- Spring config: `{ damping: 30, stiffness: 100 }`

---

### Home Dashboard Components

#### DashboardControls
*From Task 3.1*

**Files Created:**
- `components/home/dashboard-controls.tsx` - Search, sort, filter, view toggle controls

```tsx
import { DashboardControls } from '@/components/home';

<DashboardControls
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  sortBy={sortBy}
  onSortChange={setSortBy}
  statusFilter={statusFilter}
  onStatusFilterChange={setStatusFilter}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  totalCount={plans.length}
  filteredCount={filteredPlans.length}
/>
```

**Features:**
- Search input with icon
- Sort dropdown (date, name, status)
- Status filter tabs (all, draft, analyzing, complete)
- Grid/List view toggle
- Responsive: stacks on mobile, inline on desktop
- "Showing X of Y plans" counter

**UI Store Dashboard State:**
```tsx
import { useUIStore } from '@/stores/ui-store';

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
```

**Filtering/Sorting Helper:**
```tsx
function filterAndSortPlans(
  plans: Plan[],
  searchQuery: string,
  statusFilter: 'all' | PlanStatus,
  sortBy: 'date' | 'name' | 'status'
): Plan[] {
  // Filter by search query (name or address)
  // Filter by status
  // Sort by date (desc), name (asc), or status (complete > analyzing > draft)
}
```

**Gotchas:**
- Dashboard preferences are persisted in localStorage via Zustand persist middleware
- The `partialize` option ensures only preferences (not search query) are persisted

---

#### ConstraintsSidebar Pattern
*From Task 5.1 - Date: Jan 24, 2026*

**Files Created:**
- `components/constraints/constraints-sidebar.tsx` - Slide-in sidebar for constraints form
- `components/constraints/index.ts` - Barrel export

```tsx
import { ConstraintsSidebar } from '@/components/constraints';

// In page component
const [isOpen, setIsOpen] = useState(false);
const [mapWidth, setMapWidth] = useState('100%');

<ConstraintsSidebar
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onMapWidthChange={setMapWidth}
>
  {/* Constraint form sections go here */}
</ConstraintsSidebar>
```

**Animation Values:**
- Type: Spring
- Damping: 30
- Stiffness: 300
- Width: 420px

**Key Differences from Layout Sidebar:**
- NO backdrop overlay (map remains interactive)
- Compresses map via `onMapWidthChange` callback instead of overlaying
- Fixed footer with "Analyze" button

**Usage with Map Compression:**
```tsx
// Map container must animate its width to compress
<motion.div
  animate={{ width: mapWidth }}
  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
>
  <Map />
</motion.div>
```

**Gotchas:**
- **Leaflet map invalidation required**: After map container resize, call `map.invalidateSize()` after transition completes (~350ms delay) to ensure tiles render correctly
- Sidebar has z-50, ensure map controls have lower z-index or adjust positioning

#### AgentSidebar Pattern
*From Task 6.1 - Date: Jan 24, 2026*

**Files Created:**
- `components/agent/agent-message.tsx` - Individual message component with icon/text/timestamp
- `components/agent/agent-message-stream.tsx` - Auto-scrolling message container
- `components/agent/agent-progress.tsx` - Phase progress indicator (5 analysis phases)
- `components/agent/agent-sidebar.tsx` - Main sidebar with animated transition
- `components/agent/index.ts` - Barrel exports

**Message Types:**
```tsx
type AgentMessageType = 'loading' | 'success' | 'info' | 'error' | 'search' | 'processing' | 'analysis' | 'result';

interface AgentMessageData {
  id: string;
  type: AgentMessageType;
  text: string;
  timestamp: Date;
}
```

**Analysis Phases:**
```tsx
// Updated in Task 6.2 with proper phase names
type AnalysisPhase = 
  | 'data-collection'
  | 'constraint-integration'
  | 'technology-optimization'
  | 'system-design'
  | 'financial-modeling'
  | 'complete';
```

**Usage in area-select page:**
```tsx
import { AgentSidebar, type AnalysisPhase, type AgentMessageData } from '@/components/agent';

// State
const [isAgentSidebarOpen, setIsAgentSidebarOpen] = useState(false);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [currentPhase, setCurrentPhase] = useState<AnalysisPhase>('data-collection');
const [agentMessages, setAgentMessages] = useState<AgentMessageData[]>([]);

// Helper to add messages
const addAgentMessage = useCallback((type: AgentMessageType, text: string) => {
  const message: AgentMessageData = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    text,
    timestamp: new Date(),
  };
  setAgentMessages(prev => [...prev, message]);
}, []);

// Component
<AgentSidebar
  isOpen={isAgentSidebarOpen}
  onClose={() => setIsAgentSidebarOpen(false)}
  onBack={handleBackToConstraints}
  onStop={handleStopAnalysis}
  onComplete={handleViewPlan}
  onMapWidthChange={handleMapWidthChange}
  messages={agentMessages}
  currentPhase={currentPhase}
  isAnalyzing={isAnalyzing}
/>
```

**Mode Switching Pattern:**
- Constraints sidebar and Agent sidebar are mutually exclusive
- When user clicks "Analyze", constraints closes, agent opens
- Back button returns to constraints with reset state
- Uses same `onMapWidthChange` pattern for map compression
- Animation timing: 400ms delay between closing one and opening other

**Auto-scroll Behavior:**
- Container auto-scrolls to bottom on new messages
- Detects manual scroll-up to pause auto-scroll
- Resumes auto-scroll when user scrolls back to bottom

**Gotchas:**
- Use unique message IDs with timestamp + random suffix to prevent React key collisions
- Relative time formatting updates on re-render only (not real-time clock)

#### Technical Constraints Components
*From Task 5.4*

**TechnologySelect:**
- 2x2 checkbox grid for Solar/Wind/Storage/Hydro
- Uses existing Checkbox component with card-style labels
- Icons: Sun, Wind, Battery, Droplets from lucide-react
- Default: Solar pre-selected

**AestheticSlider:**
- Gradient track (stone→amber→rose) for visual concern spectrum
- Dynamic labels: Not concerned / Somewhat important / Important / Very important
- Uses same slider styling pattern as PaybackSlider

**MaintenanceOptions:**
- 3-column radio grid with sr-only radio buttons
- Icons: Wrench (DIY), HeadphonesIcon (Full service), Puzzle (Mixed)
- Centered layout with icon on top, labels below

**TimelineOptions:**
- 2x2 grid layout for urgency selection
- Icons: Zap (ASAP), Calendar (This year), Clock (1-2 years), Search (Exploring)
- Card-based radio selection pattern

**Integration Pattern:**
```tsx
// Technical constraints state in area-select page
const technologies: Technology[] = draftConstraints?.technical?.technologies ?? ['solar'];
const aestheticConcern: number = draftConstraints?.technical?.aestheticConcern ?? 25;
const maintenanceCapacity: MaintenanceCapacity = draftConstraints?.technical?.maintenanceCapacity ?? 'mixed';
const timeline: Timeline = draftConstraints?.timeline ?? 'exploring';

// Handlers update the full technical object to preserve other values
const handleTechnologiesChange = useCallback((value: Technology[]) => {
  updateDraftConstraints({
    technical: { technologies: value, aestheticConcern, maintenanceCapacity },
  });
}, [aestheticConcern, maintenanceCapacity, updateDraftConstraints]);
```

#### Constraints Validation Pattern
*From Task 5.5*

**Validation Hook:**
```tsx
import { useConstraintsValidation } from '@/hooks/use-constraints-validation';

const validation = useConstraintsValidation({
  budget,
  financing,
  primaryGoal,
  gridConnection,
  currentUse,
  technologies,
  timeline,
});

// validation returns:
// - sections: SectionValidation[] (id, label, isComplete, isRequired)
// - completedCount: number
// - requiredCount: number
// - requiredCompletedCount: number
// - isValid: boolean (all required sections complete)
// - canProceed: boolean (same as isValid for now)
```

**Required vs Optional Sections:**
- Required: Financial (financing !== 'undecided' OR budget < $500k), Energy (goal + grid), Technical (1+ tech)
- Optional: Land Details, Timeline

**Sidebar Footer Validation UI:**
- Shows checkmark icon (green) when valid, alert icon (amber) when incomplete
- "X of 5 sections complete" counter
- "Complete required fields" warning when !canProceed
- Button disabled with reduced opacity when !canProceed

#### ConstraintSection Component
*From Task 5.2*

Reusable collapsible section for constraint forms:

```tsx
import { ConstraintSection } from '@/components/constraints';

<ConstraintSection
  title="Budget & Financing"
  icon={<DollarSign className="h-4 w-4" />}
  description="Set your price range and terms"
  defaultOpen={true}
  isComplete={isFormComplete}
>
  {/* Form content */}
</ConstraintSection>
```

**Features:**
- Uses base-ui Collapsible with Framer Motion height animation
- Shows green checkmark badge when `isComplete=true`
- Chevron rotates on expand/collapse
- Border separator between sections

#### Financial Constraints Components
*From Task 5.2*

**BudgetSlider:**
- Dual-handle range slider ($10k-$500k+)
- Uses existing shadcn Slider (supports multiple thumbs)
- Formats as currency with tabular-nums for stable display
- Values above $500k display as "$500k+"

**FinancingOptions:**
- Card-based radio group with icons and descriptions
- Uses existing RadioGroup/RadioGroupItem
- Selected state: primary border + subtle background tint

**PaybackSlider:**
- Gradient track (blue→green) for visual cost/ROI spectrum
- Dynamic label: "Cost-focused" / "Balanced" / "ROI-focused"
- Custom CSS to style inner track: `[&_[data-slot=slider-track]]:bg-gradient-to-r`

---

### Map Components

#### React Leaflet Setup
*From Task 4.1*

**Tile Provider Used:**
- 

**Custom Styling Applied:**
- 

**Gotchas:**
- [ ] SSR issues with Leaflet
- [ ] CSS import requirements
- [ ] Window undefined handling

**Working Configuration:**
```tsx
// Document the working map configuration
```

---

#### Polygon Drawing
*From Task 4.4*

**Leaflet Draw Configuration:**
```tsx
// Document working draw configuration
```

**Event Handlers:**
```tsx
// Document the event handlers that work
```

**Gotchas:**
- 

---

#### Area Calculator
*From Task 4.5*

**Files Created:**
- `lib/geo.ts` - Geodesic area calculation utilities
- `components/map/area-indicator.tsx` - Floating/inline area display component

**Area Calculation:**
```tsx
import { calculateAreaWithUnits, formatArea } from '@/lib/geo';

// Calculate area from polygon coordinates
const area = calculateAreaWithUnits(coordinates);
// Returns: { squareMeters, acres, hectares, squareFeet, squareMiles }

// Format for display with smart unit selection
formatArea(area.acres); // "12.5 acres", "0.45 acres", "8,500 sq ft"
```

**AreaIndicator Component:**
```tsx
import { AreaIndicator } from '@/components/map/area-indicator';

// Floating variant (default) - for overlaying on map
<AreaIndicator coordinates={points} variant="floating" />

// Inline variant - for embedding in other UI
<AreaIndicator coordinates={points} variant="inline" showIcon={false} />
```

**Integration Notes:**
- Area updates in real-time as user draws (3+ points required)
- Uses geodesic (spherical) calculation for accuracy on Earth's surface
- Smart formatting: shows sq ft for small areas, acres for medium, sq mi for large
- ProspectMode shows area in bottom panel during drawing
- area-select page shows final area after polygon confirmation

---

## State Management

### Zustand Store Structure
*Updated as stores are created*

```tsx
// Document the store structure here
interface AppState {
  // ...
}
```

**Store Files:**
- `stores/plan-store.ts` - 
- `stores/map-store.ts` - 
- `stores/ui-store.ts` - 

---

## Animation Patterns

### Page Transitions
*From various tasks*

**Framer Motion Variants Used:**
```tsx
// Document reusable animation variants
const slideInFromRight = {
  initial: { },
  animate: { },
  exit: { },
};
```

---

### Micro-interactions
*Collected from various tasks*

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Button hover | | | |
| Card hover | | | |
| Sidebar open | | | |
| Sidebar close | | | |
| Map overlay fade | | | |

---

## API & Data

### Mock Data Structures
*From Task 1.5*

**Sample Plans Location:** `lib/mock-data.ts`

```tsx
import { getSamplePlans } from '@/lib/mock-data';

// Returns 3 sample plans with:
// - Realistic Colorado addresses
// - Complete financial projections
// - Various statuses (draft, complete)
const plans = getSamplePlans();
```

**Plan Store Initialization:**
```tsx
// In component, initialize sample data on mount
const { initializeSampleData } = usePlanStore();

useEffect(() => {
  initializeSampleData(); // Only loads if store is empty
}, [initializeSampleData]);
```

**Sample Equipment List:**
```json
{
  // TODO: Add when implementing billing section
}
```

---

## Styling Decisions

### Spacing System
- 

### Border Radius
- Cards: 
- Buttons: 
- Inputs: 

### Shadow Depths
- Card: 
- Elevated: 
- Modal: 

---

## Third-Party Library Notes

### shadcn/ui Customizations
*Document any customizations to shadcn components*

| Component | Customization | File Location |
|-----------|--------------|---------------|
| Button | | |
| Card | | |
| Input | | |
| Dialog | | |

---

### React Leaflet
*From Tasks 4.x*

**Version Used:** 

**Required Peer Dependencies:**
- 

**CSS Required:**
```tsx
// Document required CSS imports
```

**SSR Handling:**
```tsx
// Document dynamic import pattern
```

---

### Framer Motion
*From various tasks*

**AnimatePresence Setup:**
- 

**Common Patterns:**
- 

---

## Gotchas & Solutions

### Issue: [Title]
*Task: X.X | Date: [DATE]*

**Problem:**
> Describe the issue

**Solution:**
```tsx
// Code solution
```

**Prevention:**
> How to avoid this in the future

---

## Performance Notes

### Bundle Size Observations
*From Task 11.6*

| Library | Size | Notes |
|---------|------|-------|
| react-leaflet | | |
| framer-motion | | |
| recharts | | |

### Code Splitting Applied
- 

---

## Accessibility Notes
*From Task 11.5*

### Keyboard Navigation
- 

### Screen Reader Considerations
- 

### Focus Management
- 

---

## Testing Notes

### Manual Test Checklist
*Use for each major feature*

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile responsive (375px)
- [ ] Tablet responsive (768px)
- [ ] Desktop (1440px+)
- [ ] Animations smooth (60fps)
- [ ] No console errors
- [ ] Keyboard navigable

---

## Design Iterations

### Visual Changes Log
*Document any deviations from initial PRD design*

| Date | Change | Reason |
|------|--------|--------|
| | | |

---

## Open Questions

*Questions that need answers from stakeholders or future decisions*

1. 

---

## Future Improvements

*Ideas discovered during development that are out of scope but worth noting*

1. 

#### Map Overlay System
*From Task 6.3 - Date: Jan 24, 2026*

**Files Created:**
- `components/map/overlays/analysis-overlays.tsx` - All overlay components
- `components/map/overlays/index.ts` - Barrel exports

**Overlay Types:**
```tsx
type OverlayType = 'terrain' | 'solar' | 'wind' | 'exclusion' | 'optimal';

interface BaseOverlayProps {
  polygon: PolygonCoordinates[];  // Array of {lat, lng} coordinates
  visible: boolean;
  onAnimationComplete?: () => void;
}
```

**Overlay Colors:**
- Terrain: greens → yellows → reds (elevation heat map)
- Solar: `#fff7bc` → `#cc4c02` (yellow-orange gradient)
- Wind: `#deebf7` → `#084594` (blue gradient)
- Exclusion: `#e74c3c` (red with dashed border)
- Optimal: `#27ae60` (green highlight)

**Usage in area-select page:**
```tsx
import { TerrainOverlay, SolarOverlay, WindOverlay, ExclusionOverlay, OptimalOverlay, type OverlayType } from '@/components/map/overlays';

// State
const [visibleOverlays, setVisibleOverlays] = useState<Set<OverlayType>>(new Set());

// Helpers
const showOverlay = useCallback((overlay: OverlayType) => {
  setVisibleOverlays(prev => new Set(prev).add(overlay));
}, []);

const hideOverlay = useCallback((overlay: OverlayType) => {
  setVisibleOverlays(prev => {
    const next = new Set(prev);
    next.delete(overlay);
    return next;
  });
}, []);

const clearAllOverlays = useCallback(() => {
  setVisibleOverlays(new Set());
}, []);

// In JSX inside DynamicMap children:
{prospectedArea && (
  <>
    <TerrainOverlay polygon={prospectedArea} visible={visibleOverlays.has('terrain')} />
    <SolarOverlay polygon={prospectedArea} visible={visibleOverlays.has('solar')} />
    <WindOverlay polygon={prospectedArea} visible={visibleOverlays.has('wind')} />
    <ExclusionOverlay polygon={prospectedArea} visible={visibleOverlays.has('exclusion')} />
    <OptimalOverlay polygon={prospectedArea} visible={visibleOverlays.has('optimal')} />
  </>
)}
```

**Phase-to-Overlay Mapping:**
- Data Collection → `terrain`
- Constraint Integration → `exclusion`
- Technology Optimization → `solar`, `wind`
- System Design → clear clutter, show `optimal`

**Gotchas:**
- Overlays use `useMap()` hook from react-leaflet - must be rendered inside MapContainer
- `PolygonCoordinates` is interface `{lat, lng}`, array is `PolygonCoordinates[]`
- Use `L.LatLngTuple` type assertion: `polygon.map(p => [p.lat, p.lng] as L.LatLngTuple)`
- Clean up layers on unmount with `map.removeLayer(layer)`
- Stagger zone animations with `setTimeout(fn, index * 80)` for visual effect

---

#### AnalyticsSidebar Pattern
*From Task 8.1 - Date: Jan 24, 2026*

**Files Created:**
- `components/analytics/analytics-sidebar.tsx` - Main sidebar with tabs
- `components/analytics/tabs/production-tab.tsx` - Production metrics
- `components/analytics/tabs/financial-tab.tsx` - Financial projections
- `components/analytics/tabs/environmental-tab.tsx` - Environmental impact
- `components/analytics/tabs/comparison-tab.tsx` - Scenario comparisons
- `components/analytics/index.ts` - Barrel exports

**Tab Types:**
```tsx
type AnalyticsTab = 'production' | 'financial' | 'environmental' | 'comparison';
```

**Usage in Overview page:**
```tsx
import { AnalyticsSidebar } from '@/components/analytics';

const [showAnalytics, setShowAnalytics] = useState(false);

<SectionNavigation
  onAnalyticsClick={() => setShowAnalytics(true)}
  ...
/>

<AnalyticsSidebar
  isOpen={showAnalytics}
  onClose={() => setShowAnalytics(false)}
  plan={plan}
  defaultTab="production"
/>
```

**Animation Config:**
- Type: Spring
- Damping: 30
- Stiffness: 300
- Width: 100% (mobile), 480px (sm), 560px (lg)

**Features:**
- Backdrop overlay with blur
- Tab navigation with line variant from base-ui
- Tab content transitions with Framer Motion
- Escape key to close
- Metrics cards with gradient icons
- Placeholder charts for future implementation (Tasks 8.2-8.5)

**Gotchas:**
- **React Compiler strictness**: Avoid setting state in render phase or in effects. Use controlled state from parent when possible.
- **Tab state reset**: Using `defaultTab` prop directly in initial useState; parent controls when sidebar opens.
- **useMemo dependencies**: React Compiler requires explicit property access instead of object references. Extract properties before useMemo:
  ```tsx
  // Instead of: useMemo(() => { ... }, [plan?.financials])
  const planFinancials = plan?.financials;
  useMemo(() => { ... }, [planFinancials]);
  ```

---

#### Production Charts (Recharts)
*From Task 8.2 - Date: Jan 24, 2026*

**Files Created:**
- `components/analytics/charts/chart-components.tsx` - Reusable ChartContainer, ChartTooltip, ChartLegend
- `components/analytics/charts/production-data.ts` - Mock data generators for monthly/hourly production
- `components/analytics/charts/monthly-production-chart.tsx` - BarChart for monthly production
- `components/analytics/charts/daily-production-chart.tsx` - AreaChart for hourly profile
- `components/analytics/charts/index.ts` - Barrel exports

**Recharts Usage Pattern:**
```tsx
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// Always wrap in ResponsiveContainer for responsive sizing
<ResponsiveContainer width="100%" height="100%">
  <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
    <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="3 3" />
    <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#737373' }} />
    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
    <Tooltip content={<CustomTooltip />} />
    <Bar dataKey="production" fill="#4bba6f" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

**Custom Tooltip Pattern:**
```tsx
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-medium">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}: {entry.value}</span>
        </div>
      ))}
    </div>
  );
}
```

**Color Constants (hex required for SVG):**
```tsx
export const CHART_COLORS = {
  primary: '#2d8555',
  chart1: '#66c78a',
  chart2: '#4bba6f',
  amber: '#f59e0b',
  muted: '#737373',
  border: '#e5e5e5',
};
```

**Gotchas:**
- Recharts requires hex/rgb colors, not CSS variables (SVG rendering)
- Use `ResponsiveContainer` with explicit parent height (min-h-[Xpx])
- Negative left margin (-10) compensates for Y-axis label spacing
- `radius` prop on Bar creates rounded corners: `[topLeft, topRight, bottomRight, bottomLeft]`
- Use `type="monotone"` on Area for smooth curves

**Mock Data Generation:**
- Monthly: Uses seasonal factors (0.52 in Dec → 1.20 in June) with slight variance
- Hourly: Bell curve peaking at noon (factor 1.0), zero at night

---

#### Environmental Impact Tab Enhancement
*From Task 8.4 - Date: Jan 24, 2026*

**Files Modified:**
- `components/analytics/tabs/environmental-tab.tsx` - Complete redesign with animated counters

**AnimatedCounter Component Pattern:**
```tsx
function AnimatedCounter({ 
  value, 
  decimals = 0,
  suffix = '',
  prefix = '',
  className,
}: { 
  value: number; 
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => {
    const formatted = decimals > 0 
      ? current.toFixed(decimals) 
      : Math.round(current).toLocaleString();
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
```

**EPA Conversion Factors (for carbon equivalencies):**
- Trees: `co2OffsetTons * 16.5` - Urban trees absorbing CO2 for 10 years
- Cars: `co2OffsetTons / 4.6` - Average car emits 4.6 metric tons/year
- Homes: `annualProductionKwh / 10500` - Average US home uses 10,500 kWh/year
- Gasoline: `co2OffsetTons * 113` - 1 ton CO2 = ~113 gallons of gasoline

**Visual Components:**
- HeroStat: Large gradient cards with floating decorative icons and SVG dot patterns
- EquivalencyCard: Interactive cards with hover scale effects and glow
- MetricCard: Smaller secondary stats with gradient icon backgrounds

**Gotchas:**
- When using `useInView` with `useSpring`, the spring animation triggers on scroll into view
- `useTransform` requires a formatting function that returns a string for display
- `tabular-nums` class ensures consistent number widths during animation
- Keep EPA conversion factor comments as they document magic numbers from scientific sources

---

#### Section Navigation Restructure
*From Task 8.5 - Date: Jan 24, 2026*

**Architecture Change:**
Replaced overlay sidebar pattern with in-place content navigation. Sections (Production, Financial, Environmental) are now accessed via animated content transitions within the same panel, not as separate overlay drawers.

**Files Created:**
- `components/overview/plan-detail-panel.tsx` - Main container managing view state
- `components/overview/section-cards.tsx` - Hero-style gradient cards for section previews

**PlanDetailPanel Pattern:**
```tsx
type SectionType = 'production' | 'financial' | 'environmental';

const [activeSection, setActiveSection] = useState<SectionType | null>(null);

// Main view (null) shows MetricsGrid + SectionCards
// Section view shows back button + section content
```

**Animation Pattern (Main ↔ Section transitions):**
```tsx
const mainViewVariants = {
  enter: { opacity: 0, y: 40 },    // Enters from below
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },     // Exits downward
};

const sectionViewVariants = {
  enter: { opacity: 0, y: -40 },   // Enters from above
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },    // Exits upward
};
```

**SectionCards Component:**
- Uses animated counters (AnimatedNumber) for live value transitions
- Gradient backgrounds matching section themes:
  - Production: amber → orange → red
  - Financial: emerald → teal → cyan
  - Environmental: green → emerald → teal
- Decorative SVG patterns and floating icons
- Hover effects with scale and shadow

**Equipment Breakdown in Financial Tab:**
- Added `generateEquipmentData()` function in `financial-data.ts`
- Creates mock equipment list based on plan's technologies and system size
- Categories: Solar, Wind, Storage, BOS (Balance of System), Installation
- Collapsible category sections with line item details
- Uses `EquipmentCategory` and `EquipmentRow` sub-components

**Key Learnings:**
- `AnimatePresence mode="wait"` ensures exit animation completes before enter
- Spring animations (damping: 25, stiffness: 200) feel natural for content transitions
- Keep animation durations short (200-300ms) for responsive feel
- Use `useMemo` to group equipment by category for efficient rendering

---

*Last Updated: Jan 24, 2026*
*Last Task Completed: 8.5*
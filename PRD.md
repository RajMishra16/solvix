# Product Requirements Document: Solvix
## Rural Renewable Energy Planning Platform

---

## 1. Executive Summary

**Product Name:** Solvix  
**Version:** 1.0 MVP  
**Target Users:** Rural landowners and farmers with 5+ acres seeking to implement renewable energy systems  
**Core Value Proposition:** "From curious to installed in one platform. See what your land can power in 60 seconds."

Solvix is an end-to-end renewable energy planning platform that takes rural landowners from initial curiosity to a complete, actionable implementation plan—including optimized system layouts, detailed bills of materials, and permit/legal requirements.

---

## 2. Design Philosophy

### Visual Identity
- **Framework:** shadcn/ui with custom theme
- **Feel:** Snappy, minimal, data-driven, rich, clean, smooth, sleek, modern
- **Color Palette:** Earth tones meets tech (suggest: deep greens, warm neutrals, clean whites, accent gold/amber for energy)
- **Typography:** Clean sans-serif, high readability, generous whitespace
- **Animations:** Subtle, purposeful micro-interactions. Framer Motion for page transitions.
- **Maps:** Custom-styled Leaflet tiles that match the application aesthetic (consider Mapbox or custom tile styling)

### UX Principles
1. **Progressive Disclosure:** Only show what's needed at each step
2. **Immediate Feedback:** Every action has visual confirmation
3. **Spatial Consistency:** Map is the anchor; UI elements slide in/out around it
4. **Data Confidence:** Show sources, explain calculations, build trust

---

## 3. Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Maps | React Leaflet + Leaflet Draw |
| State | Zustand (lightweight, perfect for map state) |
| Animations | Framer Motion |
| Auth | NextAuth.js (Email + Google) |
| Database | PostgreSQL with Prisma (for plans storage) |
| AI/Agent | Vercel AI SDK (for streaming agent responses) |

---

## 4. Application Flow & Pages

```
Landing Page
    ↓
Login/Register ←→ (Google OAuth / Email+Password)
    ↓
Home (Dashboard - shows all saved plans)
    ↓
Area Select (Full-screen map with polygon drawing)
    ↓
Constraints Sidebar (slides in from right)
    ↓
Agent Analysis (sidebar transforms to show agent workflow)
    ↓
Save → Overview (plan dashboard)
    ↓
Sub-sections (Analytics | Billing | Implementation)
```

---

## 5. Detailed Page Specifications

### 5.1 Landing Page

**Purpose:** Convert visitors into users. Establish trust, communicate value.

**Layout:**
- Hero section with animated land visualization
- Value proposition: "See what your land can power"
- 3-step process visualization (Select → Analyze → Implement)
- Social proof section (testimonials, stats)
- CTA: "Start Planning" → Login/Register

**Components:**
- `HeroSection` - Full viewport, animated background
- `ProcessSteps` - Horizontal 3-step visual
- `StatsBar` - Key statistics (acres analyzed, projects planned, etc.)
- `TestimonialCarousel` - Farmer testimonials
- `CTASection` - Final conversion push

**Interactions:**
- Scroll-triggered animations
- Floating "Get Started" button that follows scroll
- Subtle parallax on hero elements

---

### 5.2 Login/Register Pages

**Purpose:** Frictionless authentication with trust signals.

**Layout:**
- Split screen: Left = branded visual, Right = auth form
- Toggle between Login and Register (animated transition)
- Social auth buttons prominently displayed

**Auth Methods:**
1. Google OAuth (primary - one click)
2. Email + Password (fallback)

**Components:**
- `AuthCard` - Container for forms
- `SocialAuthButtons` - Google button styled to match
- `EmailAuthForm` - Email/password fields
- `AuthToggle` - Switch between login/register
- `TrustIndicators` - Security badges, privacy note

**Form Fields (Register):**
- Full Name
- Email
- Password (with strength indicator)
- Checkbox: "I own or manage rural land"

**Form Fields (Login):**
- Email
- Password
- "Remember me" checkbox
- "Forgot password" link

**Validation:**
- Real-time field validation
- Clear error states
- Loading states on submit

---

### 5.3 Home (Dashboard)

**Purpose:** Central hub for managing all energy plans.

**Layout:**
- Top bar: Logo, user menu, "New Plan" button
- Grid of plan cards (or empty state if no plans)
- Each card shows: Plan name, location preview, date created, status

**Components:**
- `TopNavigation` - Minimal top bar
- `PlanCard` - Individual plan preview
- `EmptyState` - Illustrated prompt to create first plan
- `NewPlanButton` - Prominent CTA

**Plan Card Contents:**
- Mini map preview (static image)
- Plan name (editable)
- Location summary
- Created date
- Status badge (Draft, Analyzing, Complete)
- Quick actions (View, Delete, Duplicate)

**Interactions:**
- Click card → Overview page
- Hover card → Subtle elevation + action buttons appear
- "New Plan" → Area Select page

---

### 5.4 Area Select (Map View)

**Purpose:** Define the land area for analysis.

**Layout:**
- Full-screen map (100vw, 100vh minus minimal header)
- Floating search bar (top center)
- Floating tool palette (left side)
- Floating zoom controls (bottom left)
- Confirmation dialog (bottom right, appears after polygon drawn)

**Map Features:**
- Custom styled tiles (muted, matches app theme)
- Satellite/terrain toggle
- Drawing tools: Polygon, Rectangle
- Undo/redo for drawing
- Area calculation displayed in real-time

**Components:**
- `MapContainer` - React Leaflet wrapper with custom styling
- `SearchBar` - Address geocoding with autocomplete
- `DrawingTools` - Polygon/rectangle selection
- `AreaIndicator` - Shows selected area in acres/hectares
- `ConfirmationDialog` - "Analyze this area?" prompt
- `MapStyleToggle` - Satellite/Map view switch

**Address Search:**
- Autocomplete suggestions as user types
- On select: Map flies to location, centers and zooms appropriately
- Recent searches shown in dropdown

**Drawing Interaction:**
- Click to start polygon
- Click to add vertices
- Double-click or click first point to close
- Drag vertices to adjust
- Delete key to remove selection

**Confirmation Dialog:**
- Shows area size
- Shows approximate location
- "Proceed" button → Opens constraints sidebar
- "Redraw" button → Clears selection

---

### 5.5 Constraints Sidebar

**Purpose:** Gather user requirements and limitations.

**Layout:**
- Slides in from right (400px width)
- Map compresses/shifts left to accommodate
- Scrollable form sections
- Fixed footer with "Analyze" button

**Constraint Categories:**

#### Financial Constraints
- **Budget Range:** Slider or input ($10k - $500k+)
- **Financing Preference:** Radio (Cash / Loan / Lease / Undecided)
- **Payback Priority:** Slider (Faster ROI ↔ Lower Upfront)

#### Energy Goals
- **Primary Goal:** Select (Offset bills / Generate income / Energy independence / Environmental)
- **Target Production:** Optional input (kWh/month or % of current usage)
- **Grid Connection:** Toggle (Connected / Off-grid / Hybrid)

#### Land Constraints
- **Restricted Areas:** Option to draw exclusion zones on map
- **Existing Structures:** Checkboxes (Barns, Homes, Wells, etc.)
- **Land Use:** Multi-select (Active farming, Grazing, Unused, Forest)

#### Technical Preferences
- **Technology Openness:** Checkboxes (Solar ✓, Wind ✓, Battery Storage ✓, Micro-hydro)
- **Aesthetic Concerns:** Slider (Not concerned ↔ Very important)
- **Maintenance Capacity:** Radio (DIY capable / Need full service / Somewhere between)

#### Timeline
- **Urgency:** Radio (ASAP / This year / Next 1-2 years / Just exploring)

**Components:**
- `ConstraintsSidebar` - Main container with slide animation
- `ConstraintSection` - Collapsible section wrapper
- `BudgetSlider` - Custom styled range input
- `ExclusionDrawTool` - Integrates with map for no-go zones
- `AnalyzeButton` - Fixed at bottom, disabled until required fields complete

**Interactions:**
- Sections expand/collapse
- Validation indicators per section
- Map updates in real-time (e.g., exclusion zones appear)
- Smooth transition to agent phase when "Analyze" clicked

---

### 5.6 Agent Analysis Phase

**Purpose:** Show the AI analyzing the land and generating the optimal plan.

**Layout:**
- Sidebar transforms (same position, content changes)
- Map becomes the "canvas" where analysis visualizes
- Agent "thoughts" stream in sidebar like a chat log

**Agent Workflow Visualization:**

```
Phase 1: Data Collection (5-10 seconds)
├── "Fetching topographical data..."
├── "Analyzing elevation profiles..."
├── "Retrieving 10-year weather patterns..."
├── "Checking solar irradiance data..."
├── "Evaluating wind speed averages..."
└── [Map: Overlays appear - terrain, sun exposure heat map]

Phase 2: Constraint Integration (3-5 seconds)
├── "Applying budget constraints..."
├── "Marking exclusion zones..."
├── "Factoring land use restrictions..."
└── [Map: Exclusion zones highlighted, usable area emphasized]

Phase 3: Technology Optimization (5-10 seconds)
├── "Calculating optimal solar placement..."
├── "Evaluating wind turbine feasibility..."
├── "Analyzing hybrid configurations..."
├── "Running 1,247 layout simulations..."
└── [Map: Candidate zones appear with technology colors]

Phase 4: System Design (5-10 seconds)
├── "Selecting optimal panel configuration..."
├── "Sizing inverter requirements..."
├── "Planning cable routing..."
├── "Calculating storage needs..."
└── [Map: Final layout appears with equipment markers]

Phase 5: Financial Modeling (3-5 seconds)
├── "Estimating installation costs..."
├── "Projecting energy production..."
├── "Calculating ROI timeline..."
├── "Identifying applicable incentives..."
└── [Sidebar: Summary stats appear]
```

**Map Overlays (Progressive):**
1. Terrain/elevation heatmap
2. Solar irradiance overlay (yellow-orange gradient)
3. Wind potential overlay (blue gradient)
4. Exclusion zones (red hatching)
5. Optimal zones (green highlighting)
6. Final equipment placement (icons with info)

**Components:**
- `AgentSidebar` - Transformed sidebar with streaming content
- `AgentMessage` - Individual thought/action item
- `PhaseIndicator` - Progress through phases
- `MapOverlayManager` - Controls layer visibility/animation
- `EquipmentMarker` - Custom markers for panels, turbines, etc.
- `SummaryCard` - Appears at end with key metrics

**Interactions:**
- Messages stream in with typing animation
- Map overlays fade in as referenced
- Equipment markers animate onto map
- "Save Plan" button appears when complete
- User cannot interact with map during analysis (view only)

---

### 5.7 Overview Page

**Purpose:** Central dashboard for a saved plan with access to all details.

**Layout:**
- Full-width map showing the final plan (left 60%)
- Right panel with plan summary + navigation to sub-sections (right 40%)
- Top bar with back to Home, plan name, share/export options

**Right Panel Contents:**
- Plan name (editable inline)
- Location summary
- Key metrics grid:
  - Total System Size (kW)
  - Estimated Annual Production (kWh)
  - Total Investment
  - Payback Period
  - Annual Savings/Revenue
  - CO2 Offset (tons/year)
- Sub-section navigation buttons (3 large cards):
  - 📊 Analytics
  - 🧾 Billing (Bill of Materials)
  - 📋 Implementation

**Components:**
- `OverviewLayout` - Split view container
- `PlanMap` - Read-only map with final overlay
- `MetricsGrid` - Key stats display
- `SectionNavCard` - Large clickable cards for sub-sections
- `PlanHeader` - Name, actions, navigation

**Interactions:**
- Click section card → Sidebar slides in with that content
- Map remains visible but compressed when sidebar open
- Hover equipment on map → Tooltip with details
- Click equipment → Scrolls to it in relevant section

---

### 5.8 Analytics Section (Sidebar)

**Purpose:** Detailed performance projections and analysis.

**Layout:**
- Slides in from right over the overview
- Tabbed interface for different analytics views
- Charts and data tables
- Close button returns to overview

**Analytics Tabs:**

#### Production Tab
- **Daily Production Chart:** Line graph (seasonal variation)
- **Monthly Breakdown:** Bar chart (12 months)
- **Annual Projection:** Single stat with YoY growth
- **Hourly Profile:** Average production by hour
- **Weather Impact:** Production variance by weather conditions

#### Financial Tab
- **Cost Breakdown:** Pie chart (equipment, installation, permits, etc.)
- **Cash Flow Projection:** Line chart (cumulative over 25 years)
- **Payback Timeline:** Visual timeline with break-even marker
- **Incentive Analysis:** Table of applicable credits/grants
  - Federal ITC (30%)
  - State incentives
  - USDA REAP eligibility
  - Local utility rebates
- **Financing Scenarios:** Toggle between cash/loan/lease projections

#### Environmental Tab
- **Carbon Offset:** Annual and lifetime CO2 avoided
- **Equivalency Metrics:** "Equivalent to X trees" / "X cars off road"
- **Grid Impact:** Contribution to local renewable mix

#### Comparison Tab
- **Before/After Bills:** Side-by-side projection
- **Alternative Scenarios:** What if different budget / technology mix
- **Sensitivity Analysis:** How changes in energy prices affect ROI

**Components:**
- `AnalyticsSidebar` - Container with tabs
- `ProductionChart` - Recharts line/bar visualizations
- `FinancialTimeline` - Custom payback visualization
- `IncentiveTable` - Sortable table of incentives
- `MetricCard` - Reusable stat display
- `ComparisonToggle` - Before/after switcher

---

### 5.9 Billing Section (Bill of Materials)

**Purpose:** Complete, specific list of everything needed to build the system.

**Layout:**
- Slides in from right
- Grouped categories with expandable details
- Total cost summary at top
- Export options (PDF, CSV)

**BOM Categories:**

#### Solar Equipment
- Panels: Model, wattage, quantity, unit price, total
- Inverters: Type (string/micro), model, quantity, specs
- Mounting: Rack type, quantity, for ground/roof
- Wiring: Cable types, lengths, gauges

#### Wind Equipment (if applicable)
- Turbines: Model, capacity, hub height
- Towers: Type, height
- Controllers: Model, specs

#### Storage (if applicable)
- Batteries: Model, capacity (kWh), quantity
- Battery Inverter: If separate from solar
- Enclosure: Indoor/outdoor housing

#### Balance of System
- Combiner boxes
- Disconnects
- Monitoring system
- Grounding equipment
- Conduit and fittings

#### Installation Materials
- Concrete/foundations
- Trenching estimates
- Misc hardware

**Each Item Shows:**
- Product name/model
- Specifications summary
- Quantity needed
- Unit price (estimated)
- Line total
- "Why this?" info tooltip
- Link to example supplier (where applicable)

**Summary Section:**
- Equipment subtotal
- Installation estimate
- Permit fees estimate
- Contingency (10%)
- **Total Project Cost**
- Incentives applied
- **Net Cost After Incentives**

**Components:**
- `BillingSidebar` - Container
- `BOMCategory` - Collapsible category section
- `BOMLineItem` - Individual item row
- `PriceSummary` - Totals section
- `ExportButtons` - PDF/CSV download

---

### 5.10 Implementation Section

**Purpose:** Everything needed to actually build the project—permits, compliance, construction guidance.

**Layout:**
- Slides in from right
- Tabbed or accordion sections
- Checklists and documents
- Timeline visualization

**Implementation Sections:**

#### Permits & Approvals
- **Building Permit:** Requirements, typical timeline, cost estimate
- **Electrical Permit:** Requirements, inspection process
- **Utility Interconnection:** Application process, timeline, requirements
- **Zoning Compliance:** Any variances needed, setback requirements
- **HOA/Covenants:** If applicable, approval process
- **Environmental:** If any assessments required

Each permit shows:
- What it is
- Why it's needed
- Typical cost
- Typical timeline
- Status (Not started / In progress / Approved)
- Documents needed (checklist)

#### Construction Guide
- **Site Preparation:** What needs to happen first
- **Foundation Requirements:** If ground-mount, specs for posts/concrete
- **Equipment Installation Sequence:** Step-by-step overview
- **Wiring Diagram:** Simplified single-line diagram
- **Inspection Points:** What inspectors will check

#### Contractor Information
- **Recommended Contractor Types:** Electrician, general contractor, solar installer
- **Questions to Ask:** Vetting guide for contractors
- **Scope of Work Template:** Downloadable document
- **Timeline Estimate:** Typical project duration

#### Documentation Package
- **Site Plan:** Downloadable PDF with equipment locations
- **Equipment Specs:** Datasheets for selected equipment
- **Permit Application Drafts:** Pre-filled where possible
- **Interconnection Application:** Pre-filled template

**Components:**
- `ImplementationSidebar` - Container
- `PermitCard` - Individual permit status/info
- `ConstructionTimeline` - Visual timeline
- `DocumentDownload` - File download cards
- `ChecklistItem` - Interactive checkbox items

---

## 6. Task Breakdown

### Phase 1: Foundation (Tasks 1-5)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 1.1 | Project Setup | Initialize Next.js 14, configure Tailwind, install shadcn/ui, set up folder structure | 2 |
| 1.2 | Theme Configuration | Define color palette, typography, spacing tokens in Tailwind config. Create CSS variables for dynamic theming. | 3 |
| 1.3 | Base Layout Components | Create `AppShell`, `TopNav`, `Sidebar` base components with animation setup | 4 |
| 1.4 | Auth Setup | Configure NextAuth with Google + Credentials providers, create auth context | 4 |
| 1.5 | Database Schema | Design Prisma schema for users, plans, and plan data | 3 |

### Phase 2: Landing & Auth (Tasks 6-10)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 2.1 | Landing Hero | Build hero section with animated background, main CTA | 4 |
| 2.2 | Landing Sections | Process steps, stats bar, testimonials, footer | 5 |
| 2.3 | Auth Pages Layout | Split-screen layout with branded visual | 3 |
| 2.4 | Login Form | Email/password form with validation, Google button | 3 |
| 2.5 | Register Form | Registration form with field validation, terms checkbox | 3 |

### Phase 3: Home Dashboard (Tasks 11-13)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 3.1 | Home Layout | Dashboard grid layout with top navigation | 3 |
| 3.2 | Plan Cards | Card component with map preview, metadata, actions | 4 |
| 3.3 | Empty State | Illustrated empty state with CTA to create first plan | 2 |

### Phase 4: Map & Area Selection (Tasks 14-19)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 4.1 | Map Integration | Set up React Leaflet with custom styled tiles | 4 |
| 4.2 | Map Controls | Zoom, style toggle, fullscreen controls | 3 |
| 4.3 | Address Search | Geocoding search bar with autocomplete | 4 |
| 4.4 | Polygon Drawing | Leaflet Draw integration for area selection | 5 |
| 4.5 | Area Calculator | Real-time area calculation display | 2 |
| 4.6 | Confirmation Dialog | "Proceed with this area?" floating dialog | 2 |

### Phase 5: Constraints (Tasks 20-24)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 5.1 | Sidebar Animation | Slide-in sidebar with map compression | 3 |
| 5.2 | Financial Constraints | Budget slider, financing options, payback preference | 4 |
| 5.3 | Energy & Land Constraints | Goals, grid connection, land use, exclusions | 5 |
| 5.4 | Technical & Timeline | Technology preferences, aesthetics, timeline | 3 |
| 5.5 | Constraints Validation | Form validation, section completion indicators | 3 |

### Phase 6: Agent Analysis (Tasks 25-30)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 6.1 | Agent Sidebar UI | Transform sidebar to agent view with streaming messages | 4 |
| 6.2 | Phase Indicator | Progress visualization through analysis phases | 3 |
| 6.3 | Map Overlay System | Layer management for terrain, irradiance, wind overlays | 6 |
| 6.4 | Equipment Markers | Custom markers for solar panels, turbines, etc. | 4 |
| 6.5 | Analysis Simulation | Timed sequence of agent messages and map updates | 5 |
| 6.6 | Summary Generation | Final metrics card and save functionality | 3 |

### Phase 7: Overview (Tasks 31-35)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 7.1 | Overview Layout | Split view with map and info panel | 4 |
| 7.2 | Metrics Grid | Key statistics display with proper formatting | 3 |
| 7.3 | Section Navigation | Large clickable cards for sub-sections | 2 |
| 7.4 | Plan Header | Name editing, actions dropdown, navigation | 3 |
| 7.5 | Plan Persistence | Save/load plan data from database | 4 |

### Phase 8: Analytics Section (Tasks 36-40)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 8.1 | Analytics Sidebar | Tabbed sidebar container | 3 |
| 8.2 | Production Charts | Daily, monthly, annual production visualizations | 5 |
| 8.3 | Financial Analysis | Cost breakdown, cash flow, payback timeline | 5 |
| 8.4 | Environmental Impact | Carbon offset, equivalencies | 2 |
| 8.5 | Comparison Tools | Before/after, scenarios | 4 |

### Phase 9: Billing Section (Tasks 41-44)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 9.1 | BOM Sidebar | Sidebar with category sections | 3 |
| 9.2 | Line Item Component | Expandable item with specs, pricing | 4 |
| 9.3 | Price Summary | Totals, incentives, net cost | 3 |
| 9.4 | Export Functionality | PDF and CSV generation | 4 |

### Phase 10: Implementation Section (Tasks 45-49)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 10.1 | Implementation Sidebar | Tabbed/accordion container | 3 |
| 10.2 | Permits Section | Permit cards with status, requirements | 4 |
| 10.3 | Construction Guide | Timeline, steps, diagrams | 4 |
| 10.4 | Documentation Package | Downloadable documents UI | 3 |
| 10.5 | Contractor Info | Recommendations, scope template | 2 |

### Phase 11: Polish & Integration (Tasks 50-55)

| Task | Name | Description | Est. Hours |
|------|------|-------------|------------|
| 11.1 | Loading States | Skeleton loaders, spinners throughout | 3 |
| 11.2 | Error Handling | Error boundaries, toast notifications | 3 |
| 11.3 | Responsive Design | Mobile/tablet adaptations | 6 |
| 11.4 | Animation Polish | Page transitions, micro-interactions | 4 |
| 11.5 | Accessibility | Keyboard nav, screen reader support | 4 |
| 11.6 | Performance | Code splitting, image optimization | 3 |

---

## 7. Data Structures

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  plans: Plan[];
}
```

### Plan
```typescript
interface Plan {
  id: string;
  userId: string;
  name: string;
  status: 'draft' | 'analyzing' | 'complete';
  createdAt: Date;
  updatedAt: Date;
  
  // Area data
  area: {
    coordinates: [number, number][];  // Polygon vertices
    center: [number, number];
    areaAcres: number;
    address?: string;
  };
  
  // Constraints
  constraints: PlanConstraints;
  
  // Generated data
  analysis?: PlanAnalysis;
  equipment?: Equipment[];
  financials?: FinancialProjection;
  permits?: Permit[];
}
```

### Constraints
```typescript
interface PlanConstraints {
  budget: {
    min: number;
    max: number;
    financing: 'cash' | 'loan' | 'lease' | 'undecided';
    paybackPriority: number; // 0-100, higher = faster ROI preferred
  };
  
  energy: {
    primaryGoal: 'offset' | 'income' | 'independence' | 'environmental';
    targetProduction?: number; // kWh/month
    gridConnection: 'connected' | 'offgrid' | 'hybrid';
  };
  
  land: {
    exclusionZones: [number, number][][]; // Array of polygons
    existingStructures: string[];
    currentUse: string[];
  };
  
  technical: {
    technologies: ('solar' | 'wind' | 'storage' | 'hydro')[];
    aestheticConcern: number; // 0-100
    maintenanceCapacity: 'diy' | 'full-service' | 'mixed';
  };
  
  timeline: 'asap' | 'this-year' | '1-2-years' | 'exploring';
}
```

### Equipment
```typescript
interface Equipment {
  id: string;
  category: 'solar' | 'wind' | 'storage' | 'bos' | 'installation';
  type: string;
  model: string;
  manufacturer: string;
  specs: Record<string, any>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  position?: [number, number]; // If placed on map
  reasoning: string; // Why this was selected
}
```

---

## 8. API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth handlers |
| `/api/plans` | GET | List user's plans |
| `/api/plans` | POST | Create new plan |
| `/api/plans/[id]` | GET | Get plan details |
| `/api/plans/[id]` | PUT | Update plan |
| `/api/plans/[id]` | DELETE | Delete plan |
| `/api/geocode` | GET | Address search |
| `/api/analyze` | POST | Trigger analysis (returns streaming response) |

---

## 9. External Services

| Service | Purpose | API/Integration |
|---------|---------|-----------------|
| Google OAuth | Authentication | Auth0 provider |
| Mapbox/Leaflet | Map tiles | Tile server URL |
| Geocoding | Address search | Mapbox Geocoding API or Nominatim |
| Weather Data | Historical weather | Open-Meteo (free) or NREL |
| Solar Irradiance | Sun exposure data | NREL NSRDB |
| Elevation | Terrain data | Mapbox Terrain or OpenTopography |

---

## 10. Success Metrics

- **Completion Rate:** % of users who complete a plan after starting
- **Time to Plan:** Average time from start to saved plan
- **Return Rate:** % of users who create multiple plans
- **Engagement Depth:** % who view all three sub-sections

---

## 11. Future Considerations (Post-MVP)

- Real contractor marketplace integration
- Actual permit filing automation
- Equipment vendor partnerships
- Progress tracking for implementation
- Community features (share plans, see nearby projects)
- Voice agent integration for Q&A
- Weather alerts and monitoring integration
- Mobile native app

---

*Document Version: 1.0*  
*Last Updated: January 2025*
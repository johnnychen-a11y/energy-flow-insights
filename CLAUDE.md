# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Energy Flow Insights Dashboard** - a real-time simulation system for monitoring energy usage across multiple industrial sites. It displays solar power generation, battery storage, and machine power consumption, allowing users to switch between green energy (storage) and grid power sources.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on http://[::]:8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm preview
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5 with SWC plugin
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React hooks (no external state library)
- **Data Fetching**: TanStack Query
- **Charts**: Recharts

## Architecture

### Three-Layer Dashboard Design

The application is structured around a hierarchical three-layer architecture representing different levels of the energy system:

1. **Layer 1 (Field Layer)** - `src/components/dashboard/Layer1Field.tsx`
   - Solar panel and battery visualization
   - Individual machine controls (7 CNC machines per site)
   - Direct machine-to-power source switching

2. **Layer 2 (IPC Layer)** - `src/components/dashboard/Layer2IPC.tsx`
   - Industrial PC / edge computing visualization
   - Data aggregation display

3. **Layer 3 (Cloud Layer)** - `src/components/dashboard/Layer3Cloud.tsx`
   - Fleet-wide controls and analytics
   - Alert center with real-time notifications
   - Cross-site data visualization

### State Management

All energy simulation logic is centralized in `src/hooks/useEnergySimulation.ts`. This custom hook:

- Manages state for 3 sites (A, B, C) simultaneously
- Runs a 1-second interval simulation tick
- Handles battery charge/discharge calculations
- Generates alerts based on SOC (State of Charge) thresholds
- Prevents switching to storage when battery is critically low (≤5%)
- Implements cooldown periods (30s) to prevent alert spam

### Type System

Core types are defined in `src/types/energy.ts`:

- `SiteState`: Complete state for a single site (solar, battery, machines, alerts)
- `FleetState`: Global state managing all sites and active site selection
- `Machine`: Individual machine with status, load, and power source
- `Alert`: Notifications with severity levels (info, warning, critical)

### Alert System

The simulation automatically generates alerts for:

- **SOC_LOW**: Battery below 20% (warning)
- **SOC_LOW_PROTECT**: Battery ≤5% (critical) - auto-switches to grid
- **GREEN_SHORTAGE**: Solar output insufficient for demand
- **SOURCE_SWITCH**: Individual machine power source changed
- **FLEET_SWITCH**: All machines switched to single power source

### Component Structure

```
src/
├── components/
│   ├── dashboard/         # Main dashboard components
│   │   ├── EnergyDashboard.tsx    # Root dashboard container
│   │   ├── Header.tsx              # Top metrics display
│   │   ├── SiteTabs.tsx            # Site A/B/C switcher
│   │   ├── Layer1Field.tsx         # Field layer visualization
│   │   ├── Layer2IPC.tsx           # IPC layer visualization
│   │   ├── Layer3Cloud.tsx         # Cloud layer + controls
│   │   └── AlertCenter.tsx         # Alert notification panel
│   ├── ui/                # shadcn/ui components (do not modify directly)
│   └── NavLink.tsx        # Custom navigation component
├── hooks/
│   ├── useEnergySimulation.ts  # Main simulation logic
│   └── use-toast.ts            # Toast notifications
├── types/
│   └── energy.ts          # TypeScript type definitions
├── pages/
│   ├── Index.tsx          # Home page (renders EnergyDashboard)
│   └── NotFound.tsx       # 404 page
└── lib/
    └── utils.ts           # Utility functions (cn helper)
```

### Path Aliases

The project uses `@/` as an alias for `src/`:

```typescript
import { useEnergySimulation } from '@/hooks/useEnergySimulation';
import { Button } from '@/components/ui/button';
```

## Important Implementation Notes

### shadcn/ui Components

- Located in `src/components/ui/`
- These are generated components - prefer creating new components over modifying these
- Add new shadcn components using their CLI (not included in package.json scripts)

### Simulation Behavior

- Battery SOC changes based on solar input and green energy consumption
- Each machine consumes 5-8kW when running, 0.5-1kW when idle
- Solar output fluctuates between 50-100kW
- Critical protection: machines auto-switch to grid when battery ≤5%
- Users cannot manually switch to storage when battery is critically low

### Command Status Flow

When using fleet-wide power switching (Layer3Cloud):

1. `idle` → `sending` (500ms)
2. `sending` → `processing` (1000ms)
3. `processing` → `success` (1500ms)
4. `success` → `idle` (3000ms)

This prevents rapid successive commands and provides visual feedback.

### Styling

- Uses Tailwind CSS with custom color scheme
- Responsive breakpoints: mobile-first design with `md:` and `lg:` variants
- Dark mode is NOT implemented (uses light theme only)
- Maximum container width: 1920px

## Project Context

This appears to be a prototype built with Lovable.dev (formerly GPT Engineer). The README references Lovable project management, but the actual implementation is a standard Vite + React application that can be developed independently.

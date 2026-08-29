// TeraWatt Renewable Energy Placement Zones
// Location: Caldwell County, TX (29.6724, -97.9230) to (29.6477, -97.9049)
// Analysis Date: January 25, 2026

export type PlacementZone = {
    x1: number;       // top-left X coordinate (normalized -1 to 1)
    z1: number;       // top-left Z coordinate (normalized -1 to 1)
    x2: number;       // bottom-right X coordinate (normalized -1 to 1)
    z2: number;       // bottom-right Z coordinate (normalized -1 to 1)
    suitability: number;  // 0-100 score
    type: 'solar' | 'wind' | 'battery_storage' | 'agrivoltaic' | 'pollinator_habitat' | 'buffer';
  };
  
  export interface ExtendedPlacementZone extends PlacementZone {
    id: string;
    name: string;
    estimatedCapacityMW?: number;
    notes: string;
  }
  
  // ============================================================================
  // PLACEMENT ZONES FOR SITE: CALDWELL COUNTY, TX
  // ============================================================================
  // Climate Data:
  //   - Solar GHI: 4.8-5.2 kWh/m²/day (EXCELLENT)
  //   - Wind Speed: 6-8.8 mph avg (POOR - not recommended)
  //   - Peak Sun Hours: 5.0-5.5 hrs/day
  //   - Annual Rainfall: 25.8 inches
  //
  // Primary Recommendation: SOLAR + AGRIVOLTAICS
  // NOT Recommended: Wind (insufficient resource)
  // ============================================================================
  
  export const placementZones: ExtendedPlacementZone[] = [
    // -------------------------------------------------------------------------
    // HIGH PRIORITY - Prime Solar Zones (Suitability 85+)
    // -------------------------------------------------------------------------
    {
      id: "SOLAR-NW-01",
      name: "Northwest Agricultural Field - Prime Solar",
      x1: -0.95,
      z1: -0.95,
      x2: -0.35,
      z2: -0.45,
      suitability: 95,
      type: "solar",
      estimatedCapacityMW: 18,
      notes: "Cleared agricultural land, flat terrain, no obstructions. Highest priority zone."
    },
    {
      id: "SOLAR-SW-01", 
      name: "Southwest Agricultural Field",
      x1: -0.95,
      z1: 0.35,
      x2: -0.45,
      z2: 0.95,
      suitability: 88,
      type: "solar",
      estimatedCapacityMW: 14,
      notes: "Cleared farmland suitable for ground-mounted solar. Some tree line setbacks needed."
    },
    {
      id: "BESS-01",
      name: "Battery Energy Storage System",
      x1: 0.55,
      z1: -0.30,
      x2: 0.85,
      z2: 0.10,
      suitability: 85,
      type: "battery_storage",
      estimatedCapacityMW: 30, // MWh for storage
      notes: "Near eastern road for grid connection. 20-40 MWh Li-ion or LFP battery system."
    },
  
    // -------------------------------------------------------------------------
    // MEDIUM PRIORITY - Agrivoltaic Zones (Suitability 70-85)
    // -------------------------------------------------------------------------
    {
      id: "AGRIVOLTAIC-NC-01",
      name: "North-Central Agrivoltaic Zone",
      x1: -0.35,
      z1: -0.75,
      x2: 0.25,
      z2: -0.20,
      suitability: 78,
      type: "agrivoltaic",
      estimatedCapacityMW: 10,
      notes: "Elevated solar panels (8-10ft) with sheep grazing. Maintains agricultural use."
    },
    {
      id: "AGRIVOLTAIC-SE-01",
      name: "Southeast Pasture Agrivoltaic Zone",
      x1: 0.15,
      z1: 0.40,
      x2: 0.75,
      z2: 0.95,
      suitability: 72,
      type: "agrivoltaic",
      estimatedCapacityMW: 8,
      notes: "Current pasture land - ideal for solar + sheep grazing dual use."
    },
  
    // -------------------------------------------------------------------------
    // LOWER PRIORITY - Requires Clearing (Suitability 50-70)
    // -------------------------------------------------------------------------
    {
      id: "SOLAR-CENTRAL-01",
      name: "Central Development Zone",
      x1: -0.30,
      z1: -0.15,
      x2: 0.45,
      z2: 0.55,
      suitability: 55,
      type: "solar",
      estimatedCapacityMW: 12,
      notes: "Dense vegetation requiring clearing. Higher development costs. Phase 3 priority."
    },
  
    // -------------------------------------------------------------------------
    // ECOLOGICAL ZONES
    // -------------------------------------------------------------------------
    {
      id: "POLLINATOR-01",
      name: "Pollinator Habitat & Buffer Zone",
      x1: -0.60,
      z1: 0.10,
      x2: -0.35,
      z2: 0.35,
      suitability: 65,
      type: "pollinator_habitat",
      notes: "Native wildflowers near pond. Supports pollinators and biodiversity."
    },
  
    // -------------------------------------------------------------------------
    // BUFFER ZONES (No Development)
    // -------------------------------------------------------------------------
    {
      id: "BUFFER-ROAD-EAST",
      name: "Eastern Road Buffer",
      x1: 0.75,
      z1: -0.95,
      x2: 0.95,
      z2: 0.95,
      suitability: 0,
      type: "buffer",
      notes: "Road setback zone - no development allowed."
    },
    {
      id: "BUFFER-ROAD-NORTH",
      name: "FM 2623 Northern Buffer",
      x1: -0.95,
      z1: -0.98,
      x2: 0.95,
      z2: -0.90,
      suitability: 0,
      type: "buffer",
      notes: "Road setback along FM 2623."
    }
  ];
  
  // ============================================================================
  // SIMPLE ARRAY FORMAT (if you just need the basic PlacementZone type)
  // ============================================================================
  
  export const placementZonesSimple: PlacementZone[] = [
    // Prime Solar - NW Field
    { x1: -0.95, z1: -0.95, x2: -0.35, z2: -0.45, suitability: 95, type: "solar" },
    
    // Prime Solar - SW Field  
    { x1: -0.95, z1: 0.35, x2: -0.45, z2: 0.95, suitability: 88, type: "solar" },
    
    // Battery Storage - Near Grid
    { x1: 0.55, z1: -0.30, x2: 0.85, z2: 0.10, suitability: 85, type: "battery_storage" },
    
    // Agrivoltaic - North Central
    { x1: -0.35, z1: -0.75, x2: 0.25, z2: -0.20, suitability: 78, type: "agrivoltaic" },
    
    // Agrivoltaic - Southeast
    { x1: 0.15, z1: 0.40, x2: 0.75, z2: 0.95, suitability: 72, type: "agrivoltaic" },
    
    // Lower Priority Solar - Central (needs clearing)
    { x1: -0.30, z1: -0.15, x2: 0.45, z2: 0.55, suitability: 55, type: "solar" },
    
    // Pollinator Habitat
    { x1: -0.60, z1: 0.10, x2: -0.35, z2: 0.35, suitability: 65, type: "pollinator_habitat" },
    
    // Buffer - East Road (no development)
    { x1: 0.75, z1: -0.95, x2: 0.95, z2: 0.95, suitability: 0, type: "buffer" },
    
    // Buffer - North Road FM 2623 (no development)
    { x1: -0.95, z1: -0.98, x2: 0.95, z2: -0.90, suitability: 0, type: "buffer" }
  ];
  
  // ============================================================================
  // SITE METADATA
  // ============================================================================
  
  export const siteMetadata = {
    coordinates: {
      topLeft: { lat: 29.67240064991416, lng: -97.9229727055634 },
      bottomRight: { lat: 29.647741019671773, lng: -97.90489221345922 }
    },
    region: "Caldwell County, Texas",
    nearestCity: "Lockhart, TX",
    totalArea: {
      hectares: 480,
      acres: 1186
    },
    climate: {
      solarGHI: "4.8-5.2 kWh/m²/day",
      windSpeed: "6-8.8 mph (POOR)",
      peakSunHours: 5.2,
      annualRainfall: "25.8 inches"
    },
    estimatedCapacity: {
      totalSolarMW: 62,
      totalBatteryMWh: 30,
      windMW: 0 // NOT RECOMMENDED
    },
    recommendations: {
      primary: "Utility-scale Solar PV on cleared agricultural land",
      secondary: "Agrivoltaics (solar + sheep grazing) on pasture areas",
      tertiary: "Battery storage for grid stability and energy arbitrage",
      avoid: "Wind turbines - insufficient wind resource in this region"
    }
  };
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  /**
   * Convert normalized coordinates (-1 to 1) to geographic coordinates
   */
  export function normalizedToGeo(
    x: number, 
    z: number, 
    topLeft: { lat: number; lng: number },
    bottomRight: { lat: number; lng: number }
  ): { lat: number; lng: number } {
    const lat = topLeft.lat + ((z + 1) / 2) * (bottomRight.lat - topLeft.lat);
    const lng = topLeft.lng + ((x + 1) / 2) * (bottomRight.lng - topLeft.lng);
    return { lat, lng };
  }
  
  /**
   * Calculate approximate area of a placement zone in acres
   */
  export function calculateZoneArea(zone: PlacementZone, totalAcres: number = 1186): number {
    const width = Math.abs(zone.x2 - zone.x1) / 2;  // Normalize to 0-1
    const height = Math.abs(zone.z2 - zone.z1) / 2; // Normalize to 0-1
    return width * height * totalAcres;
  }
  
  /**
   * Filter zones by type
   */
  export function getZonesByType(
    zones: PlacementZone[], 
    type: PlacementZone['type']
  ): PlacementZone[] {
    return zones.filter(z => z.type === type);
  }
  
  /**
   * Get zones sorted by suitability (highest first)
   */
  export function getZonesBySuitability(zones: PlacementZone[]): PlacementZone[] {
    return [...zones].sort((a, b) => b.suitability - a.suitability);
  }
/**
 * Geodesic area calculation utilities
 * Uses the Shoelace formula with geodesic corrections for accurate area calculation
 */

export interface Coordinate {
  lat: number;
  lng: number;
}

// Earth's radius in meters (WGS84 mean radius)
const EARTH_RADIUS = 6371008.8;

// Conversion constants
const SQ_METERS_TO_ACRES = 0.000247105;
const SQ_METERS_TO_HECTARES = 0.0001;
const SQ_METERS_TO_SQ_FEET = 10.7639;
const SQ_METERS_TO_SQ_MILES = 3.861e-7;

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate geodesic area of a polygon using the Shoelace formula
 * adapted for spherical coordinates (Karney's method simplified)
 * 
 * @param coordinates - Array of lat/lng coordinates forming a closed polygon
 * @returns Area in square meters
 */
export function calculateGeodesicArea(coordinates: Coordinate[]): number {
  if (coordinates.length < 3) return 0;

  // Close the polygon if not already closed
  const ring = [...coordinates];
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first.lat !== last.lat || first.lng !== last.lng) {
    ring.push(first);
  }

  let area = 0;
  const n = ring.length;

  for (let i = 0; i < n - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];

    const lat1 = toRadians(p1.lat);
    const lat2 = toRadians(p2.lat);
    const lng1 = toRadians(p1.lng);
    const lng2 = toRadians(p2.lng);

    // Spherical excess formula
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs(area * EARTH_RADIUS * EARTH_RADIUS / 2);

  return area;
}

/**
 * Calculate area and return in multiple units
 */
export function calculateAreaWithUnits(coordinates: Coordinate[]): {
  squareMeters: number;
  acres: number;
  hectares: number;
  squareFeet: number;
  squareMiles: number;
} {
  const squareMeters = calculateGeodesicArea(coordinates);

  return {
    squareMeters,
    acres: squareMeters * SQ_METERS_TO_ACRES,
    hectares: squareMeters * SQ_METERS_TO_HECTARES,
    squareFeet: squareMeters * SQ_METERS_TO_SQ_FEET,
    squareMiles: squareMeters * SQ_METERS_TO_SQ_MILES,
  };
}

/**
 * Format area for display with appropriate precision
 * 
 * @param acres - Area in acres
 * @returns Formatted string with unit
 */
export function formatArea(acres: number): string {
  if (acres < 0.01) {
    const sqFt = acres / SQ_METERS_TO_ACRES * SQ_METERS_TO_SQ_FEET;
    return `${sqFt.toFixed(2)} sq ft`;
  }
  return `${acres.toFixed(2)} acres`;
}

/**
 * Calculate the centroid of a polygon
 */
export function calculateCentroid(coordinates: Coordinate[]): Coordinate {
  if (coordinates.length === 0) {
    return { lat: 0, lng: 0 };
  }

  let latSum = 0;
  let lngSum = 0;

  for (const coord of coordinates) {
    latSum += coord.lat;
    lngSum += coord.lng;
  }

  return {
    lat: latSum / coordinates.length,
    lng: lngSum / coordinates.length,
  };
}

/**
 * Calculate the bounding box of a polygon
 */
export function calculateBounds(coordinates: Coordinate[]): {
  north: number;
  south: number;
  east: number;
  west: number;
} | null {
  if (coordinates.length === 0) return null;

  let north = -Infinity;
  let south = Infinity;
  let east = -Infinity;
  let west = Infinity;

  for (const coord of coordinates) {
    north = Math.max(north, coord.lat);
    south = Math.min(south, coord.lat);
    east = Math.max(east, coord.lng);
    west = Math.min(west, coord.lng);
  }

  return { north, south, east, west };
}

/**
 * Fetch elevation data grid via our API route (proxies to Open-Meteo)
 * Covers polygon bounds with adaptive resolution (max 1000 points)
 */
export async function fetchElevationGrid(
  coordinates: Coordinate[]
): Promise<{
  data: Float32Array;
  gridSize: number;
  gridWidth: number;
  gridHeight: number;
  bounds: { north: number; south: number; east: number; west: number };
}> {
  try {
    const res = await fetch('/api/terrain/elevation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates }),
    });

    if (!res.ok) throw new Error('Failed to fetch elevation data');

    const data = await res.json();
    return {
      data: new Float32Array(data.elevation),
      gridSize: data.gridWidth * data.gridHeight,
      gridWidth: data.gridWidth,
      gridHeight: data.gridHeight,
      bounds: data.bounds,
    };
  } catch (error) {
    console.warn('Error fetching elevation data, falling back to flat terrain:', error);
    const bounds = calculateBounds(coordinates);
    if (!bounds) throw new Error('Invalid polygon coordinates');
    
    return {
      data: new Float32Array(100).fill(0),
      gridSize: 100,
      gridWidth: 10,
      gridHeight: 10,
      bounds,
    };
  }
}

/**
 * Calculate slope for each cell in an elevation grid
 * Uses finite difference method to compute rise over run
 * 
 * Formula: slope = arctan(√((dz/dx)² + (dz/dy)²)) * 180/π
 * 
 * @param elevationGrid - Elevation values in meters (row-major order)
 * @param gridWidth - Number of columns in the grid
 * @param gridHeight - Number of rows in the grid
 * @param cellSizeMeters - Size of each grid cell in meters
 * @returns Slope in degrees for each cell (0-90°)
 */
export function calculateSlope(
  elevationGrid: Float32Array,
  gridWidth: number,
  gridHeight: number,
  cellSizeMeters: number
): Float32Array {
  const slopeGrid = new Float32Array(gridWidth * gridHeight);

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const idx = y * gridWidth + x;

      // Calculate dz/dx using central difference (or forward/backward at edges)
      let dzDx = 0;
      if (x === 0) {
        // Forward difference at left edge
        dzDx = (elevationGrid[idx + 1] - elevationGrid[idx]) / cellSizeMeters;
      } else if (x === gridWidth - 1) {
        // Backward difference at right edge
        dzDx = (elevationGrid[idx] - elevationGrid[idx - 1]) / cellSizeMeters;
      } else {
        // Central difference
        dzDx = (elevationGrid[idx + 1] - elevationGrid[idx - 1]) / (2 * cellSizeMeters);
      }

      // Calculate dz/dy using central difference (or forward/backward at edges)
      let dzDy = 0;
      if (y === 0) {
        // Forward difference at top edge
        dzDy = (elevationGrid[idx + gridWidth] - elevationGrid[idx]) / cellSizeMeters;
      } else if (y === gridHeight - 1) {
        // Backward difference at bottom edge
        dzDy = (elevationGrid[idx] - elevationGrid[idx - gridWidth]) / cellSizeMeters;
      } else {
        // Central difference
        dzDy = (elevationGrid[idx + gridWidth] - elevationGrid[idx - gridWidth]) / (2 * cellSizeMeters);
      }

      // Calculate slope magnitude: arctan(√(dzDx² + dzDy²))
      const slopeRadians = Math.atan(Math.sqrt(dzDx * dzDx + dzDy * dzDy));
      slopeGrid[idx] = slopeRadians * (180 / Math.PI);
    }
  }

  return slopeGrid;
}

/**
 * Calculate aspect (compass direction of slope) for each cell in an elevation grid
 * Uses gradient direction to determine which way the slope faces
 * 
 * Formula: aspect = arctan2(dz/dy, dz/dx) * 180/π, normalized to 0-360°
 * where 0° = North, 90° = East, 180° = South, 270° = West
 * 
 * @param elevationGrid - Elevation values in meters (row-major order)
 * @param gridWidth - Number of columns in the grid
 * @param gridHeight - Number of rows in the grid
 * @returns Aspect in degrees for each cell (0-360°, -1 for flat areas)
 */
export function calculateAspect(
  elevationGrid: Float32Array,
  gridWidth: number,
  gridHeight: number
): Float32Array {
  const aspectGrid = new Float32Array(gridWidth * gridHeight);

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const idx = y * gridWidth + x;

      // Calculate dz/dx using central difference (or forward/backward at edges)
      let dzDx = 0;
      if (x === 0) {
        // Forward difference at left edge
        dzDx = elevationGrid[idx + 1] - elevationGrid[idx];
      } else if (x === gridWidth - 1) {
        // Backward difference at right edge
        dzDx = elevationGrid[idx] - elevationGrid[idx - 1];
      } else {
        // Central difference
        dzDx = (elevationGrid[idx + 1] - elevationGrid[idx - 1]) / 2;
      }

      // Calculate dz/dy using central difference (or forward/backward at edges)
      let dzDy = 0;
      if (y === 0) {
        // Forward difference at top edge
        dzDy = elevationGrid[idx + gridWidth] - elevationGrid[idx];
      } else if (y === gridHeight - 1) {
        // Backward difference at bottom edge
        dzDy = elevationGrid[idx] - elevationGrid[idx - gridWidth];
      } else {
        // Central difference
        dzDy = (elevationGrid[idx + gridWidth] - elevationGrid[idx - gridWidth]) / 2;
      }

      // Check for flat area (no slope)
      if (dzDx === 0 && dzDy === 0) {
        aspectGrid[idx] = -1; // Flat area indicator
        continue;
      }

      // Calculate aspect using arctan2
      // Note: atan2(y, x) gives angle from positive x-axis
      // We need to convert to compass bearing (0° = North, clockwise)
      let aspectRadians = Math.atan2(dzDy, -dzDx);
      let aspectDegrees = aspectRadians * (180 / Math.PI);

      // Convert from mathematical angle to compass bearing
      // Mathematical: 0° = East, 90° = North, counterclockwise
      // Compass: 0° = North, 90° = East, clockwise
      aspectDegrees = 90 - aspectDegrees;

      // Normalize to 0-360 range
      if (aspectDegrees < 0) {
        aspectDegrees += 360;
      } else if (aspectDegrees >= 360) {
        aspectDegrees -= 360;
      }

      aspectGrid[idx] = aspectDegrees;
    }
  }

  return aspectGrid;
}

// Scoring constants for solar suitability
const SOLAR_SLOPE_MAX_DEGREES = 10; // Slopes above this get 0 score
const SOLAR_OPTIMAL_ASPECT_DEGREES = 180; // South-facing (180°) is optimal
const SOLAR_ELEVATION_MIN_PERCENTILE = 0.4; // Prefer middle 40-70% elevation range
const SOLAR_ELEVATION_MAX_PERCENTILE = 0.7;

/**
 * Calculate solar panel suitability score for each cell in a terrain grid
 * 
 * Scoring methodology:
 * - Slope component (0-100): Linear decay from 100 at 0° to 0 at 10°
 *   Flat areas are ideal for solar panel installation
 * - Aspect component (0-100): Cosine-based scoring with peak at 180° (south-facing)
 *   South-facing slopes receive maximum sunlight in northern hemisphere
 * - Elevation component (0-100): Preference for middle elevation range (40-70th percentile)
 *   Avoids extreme elevations which may have harsh weather or accessibility issues
 * 
 * Final score is the average of all three components, normalized to 0-100 range
 * 
 * @param elevation - Elevation values in meters (row-major order)
 * @param slope - Slope values in degrees (0-90°)
 * @param aspect - Aspect values in degrees (0-360°, -1 for flat)
 * @param gridWidth - Number of columns in the grid
 * @param gridHeight - Number of rows in the grid
 * @returns Suitability scores (0-100) for each cell
 */
export function calculateSolarSuitability(
  elevation: Float32Array,
  slope: Float32Array,
  aspect: Float32Array,
  gridWidth: number,
  gridHeight: number
): Float32Array {
  const gridSize = gridWidth * gridHeight;
  const suitability = new Float32Array(gridSize);

  // Calculate elevation percentiles for scoring
  const sortedElevation = Array.from(elevation).sort((a, b) => a - b);
  const minElevationIdx = Math.floor(sortedElevation.length * SOLAR_ELEVATION_MIN_PERCENTILE);
  const maxElevationIdx = Math.floor(sortedElevation.length * SOLAR_ELEVATION_MAX_PERCENTILE);
  const minPreferredElevation = sortedElevation[minElevationIdx];
  const maxPreferredElevation = sortedElevation[maxElevationIdx];

  for (let i = 0; i < gridSize; i++) {
    // Slope score: 100 at 0°, linear decay to 0 at SOLAR_SLOPE_MAX_DEGREES
    const slopeScore = Math.max(0, 100 * (1 - slope[i] / SOLAR_SLOPE_MAX_DEGREES));

    // Aspect score: Cosine-based with peak at 180° (south)
    // Flat areas (aspect = -1) get neutral score of 50
    let aspectScore = 50;
    if (aspect[i] >= 0) {
      // Convert aspect difference to radians for cosine calculation
      // 0° difference (south-facing) = 100, 180° difference (north-facing) = 0
      const aspectDiff = Math.abs(aspect[i] - SOLAR_OPTIMAL_ASPECT_DEGREES);
      const normalizedDiff = Math.min(aspectDiff, 360 - aspectDiff); // Handle wrap-around
      aspectScore = 50 + 50 * Math.cos((normalizedDiff * Math.PI) / 180);
    }

    // Elevation score: 100 for middle range (40-70th percentile), decay outside
    let elevationScore = 0;
    if (elevation[i] >= minPreferredElevation && elevation[i] <= maxPreferredElevation) {
      elevationScore = 100;
    } else if (elevation[i] < minPreferredElevation) {
      // Below preferred range: linear from 0 at min elevation to 100 at minPreferred
      const minElevation = sortedElevation[0];
      const range = minPreferredElevation - minElevation;
      elevationScore = range > 0 ? 100 * (elevation[i] - minElevation) / range : 0;
    } else {
      // Above preferred range: linear from 100 at maxPreferred to 0 at max elevation
      const maxElevation = sortedElevation[sortedElevation.length - 1];
      const range = maxElevation - maxPreferredElevation;
      elevationScore = range > 0 ? 100 * (maxElevation - elevation[i]) / range : 0;
    }

    // Final score: average of all components
    suitability[i] = (slopeScore + aspectScore + elevationScore) / 3;
  }

  return suitability;
}

// Scoring constants for wind turbine suitability
const WIND_ELEVATION_TOP_PERCENTILE = 0.2; // Top 20% elevation gets max score
const WIND_ELEVATION_THRESHOLD_PERCENTILE = 0.5; // 50th percentile is minimum for scoring
const WIND_SLOPE_MAX_DEGREES = 20; // Slopes above this get penalty
const WIND_RIDGE_BONUS = 20; // Bonus points for ridge locations

/**
 * Calculate wind turbine suitability score for each cell in a terrain grid
 * 
 * Scoring methodology:
 * - Elevation component (0-100): Linear scaling from 50th percentile (0 points) to top 20% (100 points)
 *   Higher elevations have stronger, more consistent winds
 * - Ridge detection bonus (0-20): Cells higher than all 8 neighbors get bonus points
 *   Ridges and peaks are exposed to prevailing winds
 * - Slope penalty: Slopes above 20° receive reduced scores
 *   Extreme slopes make construction difficult and unstable
 * 
 * Final score combines elevation score with ridge bonus, then applies slope penalty
 * All scores normalized to 0-100 range
 * 
 * @param elevation - Elevation values in meters (row-major order)
 * @param slope - Slope values in degrees (0-90°)
 * @param gridWidth - Number of columns in the grid
 * @param gridHeight - Number of rows in the grid
 * @returns Suitability scores (0-100) for each cell
 */
export function calculateWindSuitability(
  elevation: Float32Array,
  slope: Float32Array,
  gridWidth: number,
  gridHeight: number
): Float32Array {
  const gridSize = gridWidth * gridHeight;
  const suitability = new Float32Array(gridSize);

  // Calculate elevation percentiles for scoring
  const sortedElevation = Array.from(elevation).sort((a, b) => a - b);
  const thresholdIdx = Math.floor(sortedElevation.length * WIND_ELEVATION_THRESHOLD_PERCENTILE);
  const topIdx = Math.floor(sortedElevation.length * (1 - WIND_ELEVATION_TOP_PERCENTILE));
  const thresholdElevation = sortedElevation[thresholdIdx];
  const topElevation = sortedElevation[topIdx];

  for (let i = 0; i < gridSize; i++) {
    const y = Math.floor(i / gridWidth);
    const x = i % gridWidth;

    // Elevation score: 0 below 50th percentile, linear to 100 at top 20%
    let elevationScore = 0;
    if (elevation[i] >= thresholdElevation) {
      const range = topElevation - thresholdElevation;
      if (range > 0) {
        elevationScore = Math.min(100, 100 * (elevation[i] - thresholdElevation) / range);
      } else {
        elevationScore = 100;
      }
    }

    // Ridge detection: Check if cell is higher than all 8 neighbors
    let isRidge = true;
    const currentElevation = elevation[i];
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue; // Skip self
        
        const ny = y + dy;
        const nx = x + dx;
        
        // Check bounds
        if (ny >= 0 && ny < gridHeight && nx >= 0 && nx < gridWidth) {
          const neighborIdx = ny * gridWidth + nx;
          if (elevation[neighborIdx] >= currentElevation) {
            isRidge = false;
            break;
          }
        }
      }
      if (!isRidge) break;
    }

    // Apply ridge bonus
    const ridgeBonus = isRidge ? WIND_RIDGE_BONUS : 0;

    // Slope penalty: Full score up to 20°, then linear decay
    let slopePenalty = 1.0;
    if (slope[i] > WIND_SLOPE_MAX_DEGREES) {
      // Reduce score for extreme slopes (>20°)
      // At 45°, penalty reduces score by 50%; at 90°, score goes to 0
      const excessSlope = slope[i] - WIND_SLOPE_MAX_DEGREES;
      slopePenalty = Math.max(0, 1 - excessSlope / 70); // 70° range from 20° to 90°
    }

    // Combine components: (elevation + ridge bonus) * slope penalty
    const rawScore = Math.min(100, elevationScore + ridgeBonus);
    suitability[i] = rawScore * slopePenalty;
  }

  return suitability;
}


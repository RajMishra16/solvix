'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type * as Leaflet from 'leaflet';
import type { PolygonCoordinates } from '../prospect-mode';

function getLeaflet() {
  if (typeof window === 'undefined') return null;
  return require('leaflet') as typeof import('leaflet');
}

export type OverlayType = 
  | 'terrain' 
  | 'solar' 
  | 'wind' 
  | 'exclusion' 
  | 'optimal';

export interface OverlayConfig {
  id: OverlayType;
  label: string;
  description: string;
  colors: string[];
  opacity: number;
}

export const OVERLAY_CONFIGS: Record<OverlayType, OverlayConfig> = {
  terrain: {
    id: 'terrain',
    label: 'Terrain & Elevation',
    description: 'Topography analysis',
    colors: ['#2d5a27', '#8fbc8f', '#f4e04d', '#e67e22', '#c0392b'],
    opacity: 0.5,
  },
  solar: {
    id: 'solar',
    label: 'Solar Irradiance',
    description: 'Sun exposure levels',
    colors: ['#fff7bc', '#fec44f', '#fe9929', '#ec7014', '#cc4c02'],
    opacity: 0.55,
  },
  wind: {
    id: 'wind',
    label: 'Wind Potential',
    description: 'Wind speed patterns',
    colors: ['#deebf7', '#9ecae1', '#4292c6', '#2171b5', '#084594'],
    opacity: 0.5,
  },
  exclusion: {
    id: 'exclusion',
    label: 'Exclusion Zones',
    description: 'Restricted areas',
    colors: ['#e74c3c'],
    opacity: 0.4,
  },
  optimal: {
    id: 'optimal',
    label: 'Optimal Zones',
    description: 'Best placement areas',
    colors: ['#27ae60'],
    opacity: 0.45,
  },
};

interface BaseOverlayProps {
  polygon: PolygonCoordinates[];
  visible: boolean;
  onAnimationComplete?: () => void;
}

// Generate random gradient zones within the polygon bounds
function generateGradientZones(
  polygon: PolygonCoordinates[],
  zoneCount: number = 8
): Leaflet.LatLngBounds[] {
  const Leaflet = getLeaflet();
  if (!Leaflet) return [];

  const bounds = Leaflet.latLngBounds(polygon.map((p: PolygonCoordinates) => [p.lat, p.lng] as Leaflet.LatLngTuple));
  const zones: Leaflet.LatLngBounds[] = [];
  
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const latRange = ne.lat - sw.lat;
  const lngRange = ne.lng - sw.lng;
  
  for (let i = 0; i < zoneCount; i++) {
    const centerLat = sw.lat + (Math.random() * latRange);
    const centerLng = sw.lng + (Math.random() * lngRange);
    const size = 0.15 + (Math.random() * 0.25);
    
    zones.push(Leaflet.latLngBounds(
      [centerLat - (latRange * size / 2), centerLng - (lngRange * size / 2)],
      [centerLat + (latRange * size / 2), centerLng + (lngRange * size / 2)]
    ));
  }
  
  return zones;
}

// Create an SVG pattern for hatching
function createHatchPattern(): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
      <line x1="0" y1="10" x2="10" y2="0" stroke="#c0392b" stroke-width="1.5"/>
    </svg>
  `;
}

// Terrain Overlay - Heat map style elevation visualization
export function TerrainOverlay({ polygon, visible, onAnimationComplete }: BaseOverlayProps) {
  const map = useMap();
  const layersRef = useRef<Leaflet.Layer[]>([]);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!visible || animatingRef.current) {
      // Clean up layers when not visible
      if (!visible) {
        layersRef.current.forEach(layer => map.removeLayer(layer));
        layersRef.current = [];
      }
      return;
    }

    animatingRef.current = true;
    const config = OVERLAY_CONFIGS.terrain;
    const zones = generateGradientZones(polygon, 12);
    
    // Create polygon mask
    const Leaflet = getLeaflet();
    if (!Leaflet) return;

    const polygonLayer = Leaflet.polygon(
      polygon.map((p: PolygonCoordinates) => [p.lat, p.lng] as Leaflet.LatLngTuple),
      {
        color: 'transparent',
        fillColor: config.colors[0],
        fillOpacity: 0,
        weight: 0,
      }
    ).addTo(map);
    layersRef.current.push(polygonLayer);

    // Create gradient zones with staggered animation
    zones.forEach((zoneBounds, index) => {
      const colorIndex = Math.floor(Math.random() * config.colors.length);
      
      setTimeout(() => {
        if (!visible) return;
        
        const rect = Leaflet.rectangle(zoneBounds, {
          color: 'transparent',
          fillColor: config.colors[colorIndex],
          fillOpacity: 0,
          weight: 0,
        }).addTo(map);
        
        layersRef.current.push(rect);
        
        // Animate opacity
        let opacity = 0;
        const targetOpacity = config.opacity * (0.6 + Math.random() * 0.4);
        const animate = () => {
          if (opacity < targetOpacity) {
            opacity += 0.05;
            rect.setStyle({ fillOpacity: Math.min(opacity, targetOpacity) });
            requestAnimationFrame(animate);
          } else if (index === zones.length - 1) {
            animatingRef.current = false;
            onAnimationComplete?.();
          }
        };
        animate();
      }, index * 80);
    });

    return () => {
      layersRef.current.forEach(layer => map.removeLayer(layer));
      layersRef.current = [];
      animatingRef.current = false;
    };
  }, [map, polygon, visible, onAnimationComplete]);

  return null;
}

// Solar Irradiance Overlay - Yellow-orange gradient
export function SolarOverlay({ polygon, visible, onAnimationComplete }: BaseOverlayProps) {
  const map = useMap();
  const layersRef = useRef<Leaflet.Layer[]>([]);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!visible || animatingRef.current) {
      if (!visible) {
        layersRef.current.forEach(layer => map.removeLayer(layer));
        layersRef.current = [];
      }
      return;
    }

    animatingRef.current = true;
    const config = OVERLAY_CONFIGS.solar;
    const zones = generateGradientZones(polygon, 10);
    
    const Leaflet = getLeaflet();
    if (!Leaflet) return;

    zones.forEach((zoneBounds, index) => {
      // Bias toward warmer colors (higher irradiance)
      const colorIndex = Math.min(
        config.colors.length - 1,
        Math.floor(Math.random() * config.colors.length * 1.3)
      );
      
      setTimeout(() => {
        if (!visible) return;
        
        const rect = Leaflet.rectangle(zoneBounds, {
          color: 'transparent',
          fillColor: config.colors[Math.min(colorIndex, config.colors.length - 1)],
          fillOpacity: 0,
          weight: 0,
        }).addTo(map);
        
        layersRef.current.push(rect);
        
        let opacity = 0;
        const targetOpacity = config.opacity * (0.7 + Math.random() * 0.3);
        const animate = () => {
          if (opacity < targetOpacity) {
            opacity += 0.04;
            rect.setStyle({ fillOpacity: Math.min(opacity, targetOpacity) });
            requestAnimationFrame(animate);
          } else if (index === zones.length - 1) {
            animatingRef.current = false;
            onAnimationComplete?.();
          }
        };
        animate();
      }, index * 100);
    });

    return () => {
      layersRef.current.forEach(layer => map.removeLayer(layer));
      layersRef.current = [];
      animatingRef.current = false;
    };
  }, [map, polygon, visible, onAnimationComplete]);

  return null;
}

// Wind Potential Overlay - Blue gradient
export function WindOverlay({ polygon, visible, onAnimationComplete }: BaseOverlayProps) {
  const map = useMap();
  const layersRef = useRef<Leaflet.Layer[]>([]);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!visible || animatingRef.current) {
      if (!visible) {
        layersRef.current.forEach(layer => map.removeLayer(layer));
        layersRef.current = [];
      }
      return;
    }

    animatingRef.current = true;
    const config = OVERLAY_CONFIGS.wind;
    const zones = generateGradientZones(polygon, 8);
    
    const Leaflet = getLeaflet();
    if (!Leaflet) return;

    zones.forEach((zoneBounds, index) => {
      const colorIndex = Math.floor(Math.random() * config.colors.length);
      
      setTimeout(() => {
        if (!visible) return;
        
        const rect = Leaflet.rectangle(zoneBounds, {
          color: 'transparent',
          fillColor: config.colors[colorIndex],
          fillOpacity: 0,
          weight: 0,
        }).addTo(map);
        
        layersRef.current.push(rect);
        
        let opacity = 0;
        const targetOpacity = config.opacity * (0.6 + Math.random() * 0.4);
        const animate = () => {
          if (opacity < targetOpacity) {
            opacity += 0.04;
            rect.setStyle({ fillOpacity: Math.min(opacity, targetOpacity) });
            requestAnimationFrame(animate);
          } else if (index === zones.length - 1) {
            animatingRef.current = false;
            onAnimationComplete?.();
          }
        };
        animate();
      }, index * 90);
    });

    return () => {
      layersRef.current.forEach(layer => map.removeLayer(layer));
      layersRef.current = [];
      animatingRef.current = false;
    };
  }, [map, polygon, visible, onAnimationComplete]);

  return null;
}

// Exclusion Zone Overlay - Red hatching pattern
export function ExclusionOverlay({ polygon, visible, onAnimationComplete }: BaseOverlayProps) {
  const map = useMap();
  const layersRef = useRef<Leaflet.Layer[]>([]);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!visible || animatingRef.current) {
      if (!visible) {
        layersRef.current.forEach(layer => map.removeLayer(layer));
        layersRef.current = [];
      }
      return;
    }

    animatingRef.current = true;
    const config = OVERLAY_CONFIGS.exclusion;
    const Leaflet = getLeaflet();
    if (!Leaflet) return;

    const bounds = Leaflet.latLngBounds(polygon.map((p: PolygonCoordinates) => [p.lat, p.lng] as Leaflet.LatLngTuple));
    
    // Create 1-2 exclusion zones (simulating setbacks, wetlands, etc.)
    const exclusionZones: Leaflet.LatLngBounds[] = [];
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const latRange = ne.lat - sw.lat;
    const lngRange = ne.lng - sw.lng;
    
    // Corner exclusion (setback)
    exclusionZones.push(Leaflet.latLngBounds(
      [sw.lat, sw.lng],
      [sw.lat + latRange * 0.15, sw.lng + lngRange * 0.2]
    ));
    
    // Random internal exclusion (wetland/creek)
    if (Math.random() > 0.3) {
      const centerLat = sw.lat + latRange * (0.4 + Math.random() * 0.3);
      const centerLng = sw.lng + lngRange * (0.3 + Math.random() * 0.4);
      exclusionZones.push(Leaflet.latLngBounds(
        [centerLat - latRange * 0.08, centerLng - lngRange * 0.15],
        [centerLat + latRange * 0.08, centerLng + lngRange * 0.15]
      ));
    }

    exclusionZones.forEach((zoneBounds, index) => {
      setTimeout(() => {
        if (!visible) return;
        
        const rect = Leaflet.rectangle(zoneBounds, {
          color: config.colors[0],
          fillColor: config.colors[0],
          fillOpacity: 0,
          weight: 2,
          dashArray: '5, 5',
        }).addTo(map);
        
        layersRef.current.push(rect);
        
        let opacity = 0;
        const targetOpacity = config.opacity;
        const animate = () => {
          if (opacity < targetOpacity) {
            opacity += 0.03;
            rect.setStyle({ fillOpacity: Math.min(opacity, targetOpacity) });
            requestAnimationFrame(animate);
          } else if (index === exclusionZones.length - 1) {
            animatingRef.current = false;
            onAnimationComplete?.();
          }
        };
        animate();
      }, index * 200);
    });

    return () => {
      layersRef.current.forEach(layer => map.removeLayer(layer));
      layersRef.current = [];
      animatingRef.current = false;
    };
  }, [map, polygon, visible, onAnimationComplete]);

  return null;
}

// Optimal Zone Overlay - Green highlighting for best placement
export function OptimalOverlay({ polygon, visible, onAnimationComplete }: BaseOverlayProps) {
  const map = useMap();
  const layersRef = useRef<Leaflet.Layer[]>([]);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!visible || animatingRef.current) {
      if (!visible) {
        layersRef.current.forEach(layer => map.removeLayer(layer));
        layersRef.current = [];
      }
      return;
    }

    animatingRef.current = true;
    const config = OVERLAY_CONFIGS.optimal;
    const Leaflet = getLeaflet();
    if (!Leaflet) return;

    const bounds = Leaflet.latLngBounds(polygon.map((p: PolygonCoordinates) => [p.lat, p.lng] as Leaflet.LatLngTuple));
    
    // Create 2-3 optimal zones (the best spots for installation)
    const optimalZones: Leaflet.LatLngBounds[] = [];
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const latRange = ne.lat - sw.lat;
    const lngRange = ne.lng - sw.lng;
    
    // Main optimal zone
    const mainLat = sw.lat + latRange * (0.3 + Math.random() * 0.2);
    const mainLng = sw.lng + lngRange * (0.4 + Math.random() * 0.2);
    optimalZones.push(Leaflet.latLngBounds(
      [mainLat, mainLng],
      [mainLat + latRange * 0.35, mainLng + lngRange * 0.4]
    ));
    
    // Secondary optimal zone
    const secLat = sw.lat + latRange * (0.55 + Math.random() * 0.2);
    const secLng = sw.lng + lngRange * (0.1 + Math.random() * 0.2);
    optimalZones.push(Leaflet.latLngBounds(
      [secLat, secLng],
      [secLat + latRange * 0.25, secLng + lngRange * 0.3]
    ));

    optimalZones.forEach((zoneBounds, index) => {
      setTimeout(() => {
        if (!visible) return;
        
        const rect = Leaflet.rectangle(zoneBounds, {
          color: config.colors[0],
          fillColor: config.colors[0],
          fillOpacity: 0,
          weight: 2,
        }).addTo(map);
        
        layersRef.current.push(rect);
        
        let opacity = 0;
        const targetOpacity = config.opacity;
        const animate = () => {
          if (opacity < targetOpacity) {
            opacity += 0.035;
            rect.setStyle({ fillOpacity: Math.min(opacity, targetOpacity) });
            requestAnimationFrame(animate);
          } else if (index === optimalZones.length - 1) {
            animatingRef.current = false;
            onAnimationComplete?.();
          }
        };
        animate();
      }, index * 300);
    });

    return () => {
      layersRef.current.forEach(layer => map.removeLayer(layer));
      layersRef.current = [];
      animatingRef.current = false;
    };
  }, [map, polygon, visible, onAnimationComplete]);

  return null;
}

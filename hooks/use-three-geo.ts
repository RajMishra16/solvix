'use client';

import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface ThreeGeoResult {
    terrainGroup: THREE.Group | null;
    isLoading: boolean;
    error: string | null;
}

export interface ThreeGeoOptions {
    center: [number, number]; // [lat, lng]
    radiusKm: number;
    zoom?: number; // 11-17, default 13
    enabled?: boolean;
}

/**
 * Hook to fetch real 3D terrain using three-geo + Mapbox
 * Falls back gracefully if Mapbox token is missing or fetch fails
 */
export function useThreeGeo(options: ThreeGeoOptions): ThreeGeoResult {
    const { center, radiusKm, zoom = 13, enabled = true } = options;
    const [terrainGroup, setTerrainGroup] = useState<THREE.Group | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const threeGeoRef = useRef<any>(null);

    useEffect(() => {
        if (!enabled || !center || radiusKm <= 0) {
            return;
        }

        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!mapboxToken) {
            setError('Mapbox token not configured');
            return;
        }

        let cancelled = false;
        setIsLoading(true);
        setError(null);

        async function fetchTerrain() {
            try {
                // Dynamically import three-geo (it's not SSR-compatible)
                const ThreeGeo = (await import('three-geo')).default;

                if (cancelled) return;

                // Create or reuse ThreeGeo instance
                if (!threeGeoRef.current) {
                    threeGeoRef.current = new ThreeGeo({
                        tokenMapbox: mapboxToken!,
                        unitsSide: 10.0, // Scale terrain to 10 WebGL units
                    });
                }

                const tgeo = threeGeoRef.current;

                // Fetch terrain with satellite textures
                const terrain = await tgeo.getTerrainRgb(
                    center,
                    radiusKm,
                    Math.min(Math.max(zoom, 11), 17) // Clamp zoom 11-17
                );

                if (cancelled) return;

                // Adjust terrain position to center it
                terrain.rotation.x = -Math.PI / 2; // Rotate to XZ plane
                terrain.position.set(0, -0.5, 0);

                setTerrainGroup(terrain);
                setIsLoading(false);

                console.info('[three-geo] Terrain loaded successfully', {
                    center,
                    radiusKm,
                    zoom,
                    meshCount: terrain.children.length,
                });
            } catch (err) {
                if (cancelled) return;

                const message = err instanceof Error ? err.message : 'Unknown error';
                console.error('[three-geo] Failed to load terrain:', message);
                setError(message);
                setIsLoading(false);
            }
        }

        fetchTerrain();

        return () => {
            cancelled = true;
        };
    }, [center?.[0], center?.[1], radiusKm, zoom, enabled]);

    return { terrainGroup, isLoading, error };
}

export default useThreeGeo;

'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const MapContainerComponent = dynamic(
  () => import('./map-container').then((mod) => mod.MapContainerComponent),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <span className="text-sm text-muted-foreground">Loading map...</span>
        </div>
      </div>
    ),
  }
);

interface DynamicMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  tileLayer?: 'positron' | 'satellite' | 'terrain';
  onMapReady?: (map: L.Map) => void;
  children?: React.ReactNode;
  autoLocate?: boolean;
}

export function DynamicMap({
  center,
  zoom,
  className,
  tileLayer = 'positron',
  onMapReady,
  children,
  autoLocate = false,
}: DynamicMapProps) {
  return (
    <div className={cn('h-full w-full', className)}>
      <MapContainerComponent
        center={center}
        zoom={zoom}
        tileLayer={tileLayer}
        onMapReady={onMapReady}
        autoLocate={autoLocate}
      >
        {children}
      </MapContainerComponent>
    </div>
  );
}

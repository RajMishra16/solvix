'use client';

import { useState, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  Locate,
  Maximize,
  Minimize,
  Map,
  Satellite,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TileLayerType } from './tile-layers';

interface MapControlsProps {
  onTileLayerChange?: (layer: TileLayerType) => void;
  currentTileLayer?: TileLayerType;
  className?: string;
}

function ZoomControls() {
  const map = useMap();

  const handleZoomIn = useCallback(() => {
    map.zoomIn();
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map.zoomOut();
  }, [map]);

  return (
    <div className="flex flex-col">
      <Button
        variant="secondary"
        size="icon"
        onClick={handleZoomIn}
        className="h-10 w-10 rounded-b-none border-b-0 bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={handleZoomOut}
        className="h-10 w-10 rounded-t-none bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function LocateControl() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      console.log('Geolocation not supported');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.flyTo(
          [position.coords.latitude, position.coords.longitude],
          15,
          { duration: 1.5 }
        );
        setIsLocating(false);
      },
      (error) => {
        console.log('Geolocation error:', error.message);
        setIsLocating(false);
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    );
  }, [map]);

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleLocate}
      disabled={isLocating}
      className="h-10 w-10 bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background"
      aria-label="Locate me"
    >
      <Locate className={cn('h-4 w-4', isLocating && 'animate-pulse')} />
    </Button>
  );
}

function FullscreenControl() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = useCallback(() => {
    const mapContainer = document.querySelector('.leaflet-container');
    if (!mapContainer) return;

    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleFullscreen}
      className="h-10 w-10 bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? (
        <Minimize className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
    </Button>
  );
}

interface LayerToggleProps {
  currentLayer: TileLayerType;
  onLayerChange: (layer: TileLayerType) => void;
}

function LayerToggle({ currentLayer, onLayerChange }: LayerToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const layers: { id: TileLayerType; label: string; icon: React.ReactNode }[] = [
    { id: 'positron', label: 'Map', icon: <Map className="h-4 w-4" /> },
    { id: 'satellite', label: 'Satellite', icon: <Satellite className="h-4 w-4" /> },
    { id: 'terrain', label: 'Terrain', icon: <Layers className="h-4 w-4" /> },
  ];

  const currentLayerData = layers.find((l) => l.id === currentLayer) || layers[0];

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background"
        aria-label="Change map style"
      >
        {currentLayerData.icon}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-12 bottom-0 flex gap-1 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-1 border border-border/50"
          >
            {layers.map((layer) => (
              <Button
                key={layer.id}
                variant={currentLayer === layer.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  onLayerChange(layer.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2 px-3',
                  currentLayer === layer.id && 'bg-primary text-primary-foreground'
                )}
              >
                {layer.icon}
                <span className="text-xs">{layer.label}</span>
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MapControls({
  onTileLayerChange,
  currentTileLayer = 'positron',
  className,
}: MapControlsProps) {
  const handleLayerChange = useCallback(
    (layer: TileLayerType) => {
      onTileLayerChange?.(layer);
    },
    [onTileLayerChange]
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className={cn(
        'absolute bottom-6 left-4 z-[1000] flex flex-col gap-2',
        className
      )}
    >
      <ZoomControls />
      <LocateControl />
      <FullscreenControl />
      <LayerToggle
        currentLayer={currentTileLayer}
        onLayerChange={handleLayerChange}
      />
    </motion.div>
  );
}

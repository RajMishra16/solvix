'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type L from 'leaflet';
import { Sun, Wind, Battery, Zap, Gauge } from 'lucide-react';
import { createEquipmentIcon, type EquipmentType } from './marker-icons';
import { cn } from '@/lib/utils';

export interface EquipmentPlacement {
  id: string;
  type: EquipmentType;
  position: { lat: number; lng: number };
  label: string;
  details?: {
    model?: string;
    capacity?: string;
    quantity?: number;
    orientation?: number;
  };
}

interface EquipmentMarkerProps {
  placement: EquipmentPlacement;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  animationDelay?: number;
}

const EQUIPMENT_META: Record<EquipmentType, { icon: typeof Sun; label: string; color: string }> = {
  'solar-panel': { icon: Sun, label: 'Solar Panel', color: 'text-amber-500' },
  'solar-array': { icon: Sun, label: 'Solar Array', color: 'text-amber-500' },
  'wind-turbine': { icon: Wind, label: 'Wind Turbine', color: 'text-blue-500' },
  'battery': { icon: Battery, label: 'Battery Storage', color: 'text-emerald-500' },
  'inverter': { icon: Zap, label: 'Inverter', color: 'text-gray-500' },
  'meter': { icon: Gauge, label: 'Smart Meter', color: 'text-gray-500' },
};

export function EquipmentMarker({
  placement,
  isSelected = false,
  onSelect,
  animationDelay = 0,
}: EquipmentMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const icon = useMemo(() => createEquipmentIcon(placement.type), [placement.type]);
  const meta = EQUIPMENT_META[placement.type];
  const IconComponent = meta.icon;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const element = marker.getElement();
    if (!element) return;

    const wrapper = element.querySelector('.equipment-marker-wrapper') as HTMLElement;
    if (!wrapper) return;

    if (isSelected || isHovered) {
      wrapper.style.transform = 'scale(1.15)';
      wrapper.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))';
      wrapper.style.zIndex = '1000';
    } else {
      wrapper.style.transform = 'scale(1)';
      wrapper.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))';
      wrapper.style.zIndex = '';
    }
  }, [isSelected, isHovered]);

  const handleClick = () => {
    onSelect?.(placement.id);
  };

  if (!isVisible) return null;

  return (
    <Marker
      ref={markerRef}
      position={[placement.position.lat, placement.position.lng]}
      icon={icon}
      eventHandlers={{
        click: handleClick,
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
      }}
    >
      <Popup
        className="equipment-popup"
        closeButton={false}
        autoPan={true}
        offset={[0, -8]}
      >
        <div className="min-w-[200px] p-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              placement.type.includes('solar') && 'bg-amber-100',
              placement.type === 'wind-turbine' && 'bg-blue-100',
              placement.type === 'battery' && 'bg-emerald-100',
              (placement.type === 'inverter' || placement.type === 'meter') && 'bg-gray-100'
            )}>
              <IconComponent className={cn('w-4 h-4', meta.color)} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">{placement.label}</h4>
              <p className="text-xs text-muted-foreground">{meta.label}</p>
            </div>
          </div>

          {placement.details && (
            <div className="space-y-1.5 pt-2 border-t border-border">
              {placement.details.model && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-medium">{placement.details.model}</span>
                </div>
              )}
              {placement.details.capacity && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{placement.details.capacity}</span>
                </div>
              )}
              {placement.details.quantity && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{placement.details.quantity} units</span>
                </div>
              )}
              {placement.details.orientation !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Orientation</span>
                  <span className="font-medium">{placement.details.orientation}°</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

interface EquipmentMarkerGroupProps {
  placements: EquipmentPlacement[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  staggerDelay?: number;
}

export function EquipmentMarkerGroup({
  placements,
  selectedId,
  onSelect,
  staggerDelay = 100,
}: EquipmentMarkerGroupProps) {
  return (
    <>
      {placements.map((placement, index) => (
        <EquipmentMarker
          key={placement.id}
          placement={placement}
          isSelected={selectedId === placement.id}
          onSelect={onSelect}
          animationDelay={index * staggerDelay}
        />
      ))}
    </>
  );
}

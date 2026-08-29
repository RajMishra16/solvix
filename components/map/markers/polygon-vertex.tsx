'use client';

import { useState, useMemo } from 'react';
import { CircleMarker } from 'react-leaflet';

interface PolygonVertexMarkerProps {
  position: { lat: number; lng: number };
  isFirst?: boolean;
  isActive?: boolean;
}

const VERTEX_STYLES = {
  default: {
    radius: 7,
    color: 'oklch(0.60 0.13 163)',
    fillColor: 'white',
    fillOpacity: 1,
    weight: 2.5,
  },
  first: {
    radius: 9,
    color: 'oklch(0.55 0.15 163)',
    fillColor: 'oklch(0.90 0.05 163)',
    fillOpacity: 1,
    weight: 3,
  },
  active: {
    radius: 8,
    color: 'oklch(0.50 0.16 163)',
    fillColor: 'oklch(0.85 0.08 163)',
    fillOpacity: 1,
    weight: 3,
  },
  hover: {
    radius: 9,
    color: 'oklch(0.50 0.16 163)',
    fillColor: 'oklch(0.95 0.03 163)',
    fillOpacity: 1,
    weight: 3,
  },
};

export function PolygonVertexMarker({
  position,
  isFirst = false,
  isActive = false,
}: PolygonVertexMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const style = useMemo(() => {
    if (isHovered) return VERTEX_STYLES.hover;
    if (isActive) return VERTEX_STYLES.active;
    if (isFirst) return VERTEX_STYLES.first;
    return VERTEX_STYLES.default;
  }, [isHovered, isActive, isFirst]);

  return (
    <CircleMarker
      center={[position.lat, position.lng]}
      radius={style.radius}
      pathOptions={{
        color: style.color,
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity,
        weight: style.weight,
      }}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
      }}
    />
  );
}

interface PolygonVertexGroupProps {
  points: { lat: number; lng: number }[];
  activeIndex?: number;
}

export function PolygonVertexGroup({
  points,
  activeIndex,
}: PolygonVertexGroupProps) {
  return (
    <>
      {points.map((point, index) => (
        <PolygonVertexMarker
          key={`vertex-${index}`}
          position={point}
          isFirst={index === 0}
          isActive={activeIndex === index}
        />
      ))}
    </>
  );
}

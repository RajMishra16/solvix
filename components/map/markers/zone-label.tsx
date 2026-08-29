'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type L from 'leaflet';

export type ZoneType = 'optimal' | 'exclusion' | 'solar' | 'wind' | 'terrain';

interface ZoneLabelProps {
  position: { lat: number; lng: number };
  type: ZoneType;
  label: string;
  sublabel?: string;
  visible?: boolean;
  animationDelay?: number;
}

const ZONE_STYLES: Record<ZoneType, { bg: string; text: string; border: string; icon: string }> = {
  optimal: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'text-emerald-500',
  },
  exclusion: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'text-red-500',
  },
  solar: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'text-amber-500',
  },
  wind: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'text-blue-500',
  },
  terrain: {
    bg: 'bg-stone-50',
    text: 'text-stone-700',
    border: 'border-stone-200',
    icon: 'text-stone-500',
  },
};

const ZONE_ICONS: Record<ZoneType, string> = {
  optimal: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  exclusion: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  solar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  wind: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  terrain: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`,
};

export function ZoneLabel({
  position,
  type,
  label,
  sublabel,
  visible = true,
  animationDelay = 0,
}: ZoneLabelProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  const style = ZONE_STYLES[type];
  const iconSvg = ZONE_ICONS[type];

  useEffect(() => {
    if (!visible) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      const Leaflet = require('leaflet');
      const icon = Leaflet.divIcon({
        html: `
          <div class="zone-label-wrapper" style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            backdrop-filter: blur(4px);
            opacity: 0;
            transform: translateY(-4px);
            animation: zoneLabelIn 0.3s ease forwards;
          " class="${style.bg} ${style.text} border ${style.border}">
            <span class="${style.icon}">${iconSvg}</span>
            <span>${label}</span>
            ${sublabel ? `<span style="opacity: 0.7; font-size: 11px;">${sublabel}</span>` : ''}
          </div>
          <style>
            @keyframes zoneLabelIn {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          </style>
        `,
        className: 'zone-label-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = Leaflet.marker([position.lat, position.lng], { icon, interactive: false });
      marker.addTo(map);
      markerRef.current = marker;
    }, animationDelay);

    return () => {
      clearTimeout(timer);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [map, position, type, label, sublabel, visible, animationDelay, style, iconSvg]);

  return null;
}

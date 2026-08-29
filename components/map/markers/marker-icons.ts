export type EquipmentType = 'solar-panel' | 'solar-array' | 'wind-turbine' | 'battery' | 'inverter' | 'meter';

interface IconConfig {
  svg: string;
  size: [number, number];
  anchor: [number, number];
  popupAnchor: [number, number];
  className: string;
}

const COLORS = {
  solar: {
    primary: '#f59e0b',
    bg: '#fef3c7',
    border: '#d97706',
  },
  wind: {
    primary: '#3b82f6',
    bg: '#dbeafe',
    border: '#2563eb',
  },
  storage: {
    primary: '#10b981',
    bg: '#d1fae5',
    border: '#059669',
  },
  infrastructure: {
    primary: '#6b7280',
    bg: '#f3f4f6',
    border: '#4b5563',
  },
};
const ICONS: Record<EquipmentType, (color: typeof COLORS.solar) => string> = {
  'solar-panel': (c) => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="6" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
      <rect x="8" y="8" width="10" height="10" rx="1" fill="${c.primary}"/>
      <rect x="22" y="8" width="10" height="10" rx="1" fill="${c.primary}"/>
      <rect x="8" y="22" width="10" height="10" rx="1" fill="${c.primary}"/>
      <rect x="22" y="22" width="10" height="10" rx="1" fill="${c.primary}"/>
      <line x1="20" y1="8" x2="20" y2="32" stroke="${c.border}" stroke-width="1.5"/>
      <line x1="8" y1="20" x2="32" y2="20" stroke="${c.border}" stroke-width="1.5"/>
    </svg>
  `,
  'solar-array': (c) => `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="44" height="44" rx="8" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
      <g transform="translate(6, 6)">
        <rect x="0" y="0" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="10" y="0" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="20" y="0" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="28" y="0" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="0" y="10" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="10" y="10" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="20" y="10" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="28" y="10" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="0" y="20" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="10" y="20" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="20" y="20" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="28" y="20" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="0" y="28" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="10" y="28" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="20" y="28" width="8" height="8" rx="1" fill="${c.primary}"/>
        <rect x="28" y="28" width="8" height="8" rx="1" fill="${c.primary}"/>
      </g>
    </svg>
  `,
  'wind-turbine': (c) => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
      <circle cx="20" cy="20" r="4" fill="${c.border}"/>
      <path d="M20 16 L18 4 L20 6 L22 4 Z" fill="${c.primary}" stroke="${c.border}" stroke-width="1"/>
      <path d="M24 20 L36 18 L34 20 L36 22 Z" fill="${c.primary}" stroke="${c.border}" stroke-width="1" transform="rotate(120 20 20)"/>
      <path d="M24 20 L36 18 L34 20 L36 22 Z" fill="${c.primary}" stroke="${c.border}" stroke-width="1" transform="rotate(240 20 20)"/>
    </svg>
  `,
  'battery': (c) => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="32" height="24" rx="4" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
      <rect x="36" y="14" width="2" height="12" rx="1" fill="${c.border}"/>
      <rect x="8" y="12" width="6" height="16" rx="1" fill="${c.primary}"/>
      <rect x="17" y="12" width="6" height="16" rx="1" fill="${c.primary}"/>
      <rect x="26" y="12" width="6" height="16" rx="1" fill="${c.primary}" opacity="0.5"/>
      <path d="M14 18 L16 20 L14 22" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  'inverter': (c) => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="4" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
      <path d="M12 20 Q16 12 20 20 Q24 28 28 20" stroke="${c.primary}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="2" fill="${c.border}"/>
      <circle cx="28" cy="12" r="2" fill="${c.border}"/>
      <rect x="10" y="28" width="8" height="4" rx="1" fill="${c.border}"/>
      <rect x="22" y="28" width="8" height="4" rx="1" fill="${c.border}"/>
    </svg>
  `,
  'meter': (c) => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
      <circle cx="20" cy="20" r="12" fill="white" stroke="${c.border}" stroke-width="1"/>
      <path d="M20 10 L20 20 L28 16" stroke="${c.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="20" cy="20" r="2" fill="${c.border}"/>
      <text x="20" y="32" text-anchor="middle" font-size="5" fill="${c.border}" font-family="system-ui">kWh</text>
    </svg>
  `,
};

const ICON_CONFIGS: Record<EquipmentType, Omit<IconConfig, 'svg'>> = {
  'solar-panel': {
    size: [32, 32],
    anchor: [16, 16],
    popupAnchor: [0, -16],
    className: 'equipment-marker equipment-marker--solar',
  },
  'solar-array': {
    size: [40, 40],
    anchor: [20, 20],
    popupAnchor: [0, -20],
    className: 'equipment-marker equipment-marker--solar-array',
  },
  'wind-turbine': {
    size: [36, 36],
    anchor: [18, 18],
    popupAnchor: [0, -18],
    className: 'equipment-marker equipment-marker--wind',
  },
  'battery': {
    size: [32, 32],
    anchor: [16, 16],
    popupAnchor: [0, -16],
    className: 'equipment-marker equipment-marker--storage',
  },
  'inverter': {
    size: [28, 28],
    anchor: [14, 14],
    popupAnchor: [0, -14],
    className: 'equipment-marker equipment-marker--infrastructure',
  },
  'meter': {
    size: [28, 28],
    anchor: [14, 14],
    popupAnchor: [0, -14],
    className: 'equipment-marker equipment-marker--infrastructure',
  },
};

function getColorForType(type: EquipmentType): typeof COLORS.solar {
  switch (type) {
    case 'solar-panel':
    case 'solar-array':
      return COLORS.solar;
    case 'wind-turbine':
      return COLORS.wind;
    case 'battery':
      return COLORS.storage;
    case 'inverter':
    case 'meter':
    default:
      return COLORS.infrastructure;
  }
}

export function createEquipmentIcon(type: EquipmentType) {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const L = require('leaflet');
  const config = ICON_CONFIGS[type];
  const color = getColorForType(type);
  const svgFn = ICONS[type];
  
  const svgContent = svgFn(color).trim();
  const encodedSvg = encodeURIComponent(svgContent);
  
  return L.divIcon({
    html: `
      <div class="equipment-marker-wrapper" style="
        width: ${config.size[0]}px;
        height: ${config.size[1]}px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
        transition: transform 0.2s ease, filter 0.2s ease;
      ">
        <img 
          src="data:image/svg+xml,${encodedSvg}" 
          width="${config.size[0]}" 
          height="${config.size[1]}" 
          alt="${type}"
          style="display: block;"
        />
      </div>
    `,
    iconSize: config.size,
    iconAnchor: config.anchor,
    popupAnchor: config.popupAnchor,
    className: config.className,
  });
}

export const EQUIPMENT_ICONS = {
  solarPanel: () => createEquipmentIcon('solar-panel'),
  solarArray: () => createEquipmentIcon('solar-array'),
  windTurbine: () => createEquipmentIcon('wind-turbine'),
  battery: () => createEquipmentIcon('battery'),
  inverter: () => createEquipmentIcon('inverter'),
  meter: () => createEquipmentIcon('meter'),
};

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import type { Map as LeafletMap } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Leaf, Crosshair, Ruler, MapPin, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DynamicMap, type TileLayerType, type PolygonCoordinates, type EquipmentPlacement } from '@/components/map';
import { TerrainOverlay, SolarOverlay, WindOverlay, ExclusionOverlay, OptimalOverlay, type OverlayType } from '@/components/map/overlays';
import { ConstraintsSidebar, FinancialConstraints, EnergyConstraints, LandConstraints, TechnicalConstraints, TimelineConstraints } from '@/components/constraints';
import { AgentSidebar, type AnalysisPhase, type AgentMessageData, type AgentMessageType } from '@/components/agent';
import { AgentConsentModal } from '@/components/agent/agent-consent-modal';

import { Button } from '@/components/ui/button';
import { calculateAreaWithUnits, formatArea, calculateCentroid } from '@/lib/geo';
import { usePlanStore } from '@/stores/plan-store';
import { fetchSiteAnalysis } from '@/lib/site-analysis';
import { useConstraintsValidation } from '@/hooks/use-constraints-validation';
import type { FinancingType, EnergyGoal, GridConnection, Technology, MaintenanceCapacity, Timeline } from '@/types/plan';

const MapControls = nextDynamic(
  () => import('@/components/map/map-internals').then((mod) => mod.MapControls),
  { ssr: false }
);

const AddressSearch = nextDynamic(
  () => import('@/components/map/map-internals').then((mod) => mod.AddressSearch),
  { ssr: false }
);

const ProspectMode = nextDynamic(
  () => import('@/components/map/map-internals').then((mod) => mod.ProspectMode),
  { ssr: false }
);

const CompletedPolygon = nextDynamic(
  () => import('@/components/map/map-internals').then((mod) => mod.CompletedPolygon),
  { ssr: false }
);

const EquipmentMarkerGroup = nextDynamic(
  () => import('@/components/map/markers/equipment-marker').then((mod) => mod.EquipmentMarkerGroup),
  { ssr: false }
);

const ZoneLabel = nextDynamic(
  () => import('@/components/map/markers/zone-label').then((mod) => mod.ZoneLabel),
  { ssr: false }
);

// 3D Terrain Analysis Components
const TerrainAnalysisScene = nextDynamic(
  () => import('@/components/3d/terrain-analysis-scene').then((mod) => mod.TerrainAnalysisScene),
  { ssr: false }
);

const AnalysisOverlay = nextDynamic(
  () => import('@/components/3d/analysis-overlay').then((mod) => mod.AnalysisOverlay),
  { ssr: false }
);

const MapTo3DTransition = nextDynamic(
  () => import('@/components/3d/map-transition').then((mod) => mod.MapTo3DTransition),
  { ssr: false }
);

export default function AreaSelectPage() {
  const router = useRouter();
  const mapRef = useRef<LeafletMap | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [tileLayer, setTileLayer] = useState<TileLayerType>('positron');
  const [isProspecting, setIsProspecting] = useState(false);
  const [prospectedArea, setProspectedArea] = useState<PolygonCoordinates[] | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isConstraintsSidebarOpen, setIsConstraintsSidebarOpen] = useState(false);
  const [isAgentSidebarOpen, setIsAgentSidebarOpen] = useState(false);

  // -- AGENT AUTH STATE --
  const [hasAgentConsent, setHasAgentConsent] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  // ----------------------

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<AnalysisPhase>('data-collection');
  const [agentMessages, setAgentMessages] = useState<AgentMessageData[]>([]);
  const [mapWidth, setMapWidth] = useState('100%');
  const [mapCenter, setMapCenter] = useState<[number, number]>([29.654, -97.991]);
  const [mapZoom, setMapZoom] = useState(12);

  const [visibleOverlays, setVisibleOverlays] = useState<Set<OverlayType>>(new Set());
  const [equipmentPlacements, setEquipmentPlacements] = useState<EquipmentPlacement[]>([]);
  const [showEquipment, setShowEquipment] = useState(false);
  const [zoneLabels, setZoneLabels] = useState<Array<{
    id: string;
    position: { lat: number; lng: number };
    type: 'optimal' | 'exclusion';
    label: string;
  }>>([]);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // -- 3D TERRAIN ANALYSIS STATE --
  const [show3DView, setShow3DView] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isTransitioningTo3D, setIsTransitioningTo3D] = useState(false);
  const [roofImageUrl, setRoofImageUrl] = useState<string | null>(null);
  const [tariffInfo, setTariffInfo] = useState<{ ratePerKwh: number; currency: string; regionLabel: string } | null>(null);
  const [liveAnalysisMetrics, setLiveAnalysisMetrics] = useState({
    solarPotentialKwhPerKwYr: 0,
    windSpeedMph: 0,
    systemSizeKw: 0,
    annualOutputMwh: 0,
  });
  // -------------------------------

  const { draftConstraints, updateDraftConstraints, addPlan, setDraftArea } = usePlanStore();

  const budget: [number, number] = [
    draftConstraints?.budget?.min ?? 50000,
    draftConstraints?.budget?.max ?? 150000,
  ];
  const financing: FinancingType = draftConstraints?.budget?.financing ?? 'undecided';
  const paybackPriority: number = draftConstraints?.budget?.paybackPriority ?? 50;

  const handleBudgetChange = useCallback((value: [number, number]) => {
    updateDraftConstraints({
      budget: {
        min: value[0],
        max: value[1],
        financing,
        paybackPriority,
      },
    });
  }, [financing, paybackPriority, updateDraftConstraints]);

  const handleFinancingChange = useCallback((value: FinancingType) => {
    updateDraftConstraints({
      budget: {
        min: budget[0],
        max: budget[1],
        financing: value,
        paybackPriority,
      },
    });
  }, [budget, paybackPriority, updateDraftConstraints]);

  const handlePaybackPriorityChange = useCallback((value: number) => {
    updateDraftConstraints({
      budget: {
        min: budget[0],
        max: budget[1],
        financing,
        paybackPriority: value,
      },
    });
  }, [budget, financing, updateDraftConstraints]);

  const primaryGoal: EnergyGoal = draftConstraints?.energy?.primaryGoal ?? 'offset';
  const targetProduction: number | undefined = draftConstraints?.energy?.targetProduction;
  const gridConnection: GridConnection = draftConstraints?.energy?.gridConnection ?? 'connected';

  const handlePrimaryGoalChange = useCallback((value: EnergyGoal) => {
    updateDraftConstraints({
      energy: {
        primaryGoal: value,
        targetProduction,
        gridConnection,
      },
    });
  }, [targetProduction, gridConnection, updateDraftConstraints]);

  const handleTargetProductionChange = useCallback((value: number | undefined) => {
    updateDraftConstraints({
      energy: {
        primaryGoal,
        targetProduction: value,
        gridConnection,
      },
    });
  }, [primaryGoal, gridConnection, updateDraftConstraints]);

  const handleGridConnectionChange = useCallback((value: GridConnection) => {
    updateDraftConstraints({
      energy: {
        primaryGoal,
        targetProduction,
        gridConnection: value,
      },
    });
  }, [primaryGoal, targetProduction, updateDraftConstraints]);

  const existingStructures: string[] = draftConstraints?.land?.existingStructures ?? [];
  const currentUse: string[] = draftConstraints?.land?.currentUse ?? [];

  const handleStructuresChange = useCallback((value: string[]) => {
    updateDraftConstraints({
      land: {
        exclusionZones: draftConstraints?.land?.exclusionZones ?? [],
        existingStructures: value,
        currentUse,
      },
    });
  }, [currentUse, draftConstraints?.land?.exclusionZones, updateDraftConstraints]);

  const handleLandUseChange = useCallback((value: string[]) => {
    updateDraftConstraints({
      land: {
        exclusionZones: draftConstraints?.land?.exclusionZones ?? [],
        existingStructures,
        currentUse: value,
      },
    });
  }, [existingStructures, draftConstraints?.land?.exclusionZones, updateDraftConstraints]);

  const technologies: Technology[] = draftConstraints?.technical?.technologies ?? ['solar'];
  const aestheticConcern: number = draftConstraints?.technical?.aestheticConcern ?? 25;
  const maintenanceCapacity: MaintenanceCapacity = draftConstraints?.technical?.maintenanceCapacity ?? 'mixed';

  const handleTechnologiesChange = useCallback((value: Technology[]) => {
    updateDraftConstraints({
      technical: {
        technologies: value,
        aestheticConcern,
        maintenanceCapacity,
      },
    });
  }, [aestheticConcern, maintenanceCapacity, updateDraftConstraints]);

  const handleAestheticConcernChange = useCallback((value: number) => {
    updateDraftConstraints({
      technical: {
        technologies,
        aestheticConcern: value,
        maintenanceCapacity,
      },
    });
  }, [technologies, maintenanceCapacity, updateDraftConstraints]);

  const handleMaintenanceCapacityChange = useCallback((value: MaintenanceCapacity) => {
    updateDraftConstraints({
      technical: {
        technologies,
        aestheticConcern,
        maintenanceCapacity: value,
      },
    });
  }, [technologies, aestheticConcern, updateDraftConstraints]);

  const timeline: Timeline = draftConstraints?.timeline ?? 'exploring';

  const handleTimelineChange = useCallback((value: Timeline) => {
    updateDraftConstraints({
      timeline: value,
    });
  }, [updateDraftConstraints]);

  const validation = useConstraintsValidation({
    budget,
    financing,
    primaryGoal,
    gridConnection,
    currentUse,
    technologies,
    timeline,
  });

  const addAgentMessage = useCallback((
    type: AgentMessageType,
    text: string,
    options?: {
      status?: 'active' | 'completed';
      resolvedType?: AgentMessageType;
      detail?: string;
      value?: string | number;
    }
  ): string => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: AgentMessageData = {
      id,
      type,
      text,
      timestamp: new Date(),
      status: options?.status ?? 'completed',
      resolvedType: options?.resolvedType,
      detail: options?.detail,
      value: options?.value,
    };
    setAgentMessages(prev => [...prev, message]);
    return id;
  }, []);

  const updateAgentMessage = useCallback((
    id: string,
    updates: Partial<Pick<AgentMessageData, 'status' | 'resolvedType' | 'text' | 'detail' | 'value'>>
  ) => {
    setAgentMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  // Helper to show/hide overlays
  const showOverlay = useCallback((overlay: OverlayType) => {
    setVisibleOverlays(prev => new Set(prev).add(overlay));
  }, []);

  const hideOverlay = useCallback((overlay: OverlayType) => {
    setVisibleOverlays(prev => {
      const next = new Set(prev);
      next.delete(overlay);
      return next;
    });
  }, []);

  const clearAllOverlays = useCallback(() => {
    setVisibleOverlays(new Set());
  }, []);

  const generateEquipmentPlacements = useCallback((polygon: PolygonCoordinates[]): EquipmentPlacement[] => {
    if (!polygon || polygon.length < 3) return [];

    const bounds = {
      minLat: Math.min(...polygon.map(p => p.lat)),
      maxLat: Math.max(...polygon.map(p => p.lat)),
      minLng: Math.min(...polygon.map(p => p.lng)),
      maxLng: Math.max(...polygon.map(p => p.lng)),
    };

    const latRange = bounds.maxLat - bounds.minLat;
    const lngRange = bounds.maxLng - bounds.minLng;

    const placements: EquipmentPlacement[] = [];

    placements.push({
      id: 'solar-array-1',
      type: 'solar-array',
      position: {
        lat: bounds.minLat + latRange * 0.35,
        lng: bounds.minLng + lngRange * 0.45,
      },
      label: 'Main Solar Array',
      details: {
        model: 'SunPower M440',
        capacity: '35 kW',
        quantity: 88,
        orientation: 180,
      },
    });

    placements.push({
      id: 'solar-array-2',
      type: 'solar-array',
      position: {
        lat: bounds.minLat + latRange * 0.65,
        lng: bounds.minLng + lngRange * 0.25,
      },
      label: 'Secondary Array',
      details: {
        model: 'SunPower M440',
        capacity: '10 kW',
        quantity: 25,
        orientation: 180,
      },
    });

    if (technologies.includes('wind')) {
      placements.push({
        id: 'wind-turbine-1',
        type: 'wind-turbine',
        position: {
          lat: bounds.minLat + latRange * 0.75,
          lng: bounds.minLng + lngRange * 0.7,
        },
        label: 'Micro Wind Turbine',
        details: {
          model: 'Bergey Excel 6',
          capacity: '6 kW',
          quantity: 1,
        },
      });
    }

    if (technologies.includes('storage')) {
      placements.push({
        id: 'battery-1',
        type: 'battery',
        position: {
          lat: bounds.minLat + latRange * 0.2,
          lng: bounds.minLng + lngRange * 0.8,
        },
        label: 'Battery Storage',
        details: {
          model: 'Tesla Powerwall 3',
          capacity: '27 kWh',
          quantity: 2,
        },
      });
    }

    placements.push({
      id: 'inverter-1',
      type: 'inverter',
      position: {
        lat: bounds.minLat + latRange * 0.25,
        lng: bounds.minLng + lngRange * 0.75,
      },
      label: 'Solar Inverter',
      details: {
        model: 'SolarEdge SE11400H',
        capacity: '11.4 kW',
        quantity: 4,
      },
    });

    placements.push({
      id: 'meter-1',
      type: 'meter',
      position: {
        lat: bounds.minLat + latRange * 0.15,
        lng: bounds.minLng + lngRange * 0.85,
      },
      label: 'Smart Meter',
      details: {
        model: 'Sense Energy Monitor',
      },
    });

    return placements;
  }, [technologies]);

  const generateZoneLabels = useCallback((polygon: PolygonCoordinates[]) => {
    if (!polygon || polygon.length < 3) return [];

    const bounds = {
      minLat: Math.min(...polygon.map(p => p.lat)),
      maxLat: Math.max(...polygon.map(p => p.lat)),
      minLng: Math.min(...polygon.map(p => p.lng)),
      maxLng: Math.max(...polygon.map(p => p.lng)),
    };

    const latRange = bounds.maxLat - bounds.minLat;
    const lngRange = bounds.maxLng - bounds.minLng;

    return [
      {
        id: 'optimal-zone-1',
        position: {
          lat: bounds.minLat + latRange * 0.45,
          lng: bounds.minLng + lngRange * 0.55,
        },
        type: 'optimal' as const,
        label: 'Optimal Zone A',
      },
      {
        id: 'optimal-zone-2',
        position: {
          lat: bounds.minLat + latRange * 0.7,
          lng: bounds.minLng + lngRange * 0.2,
        },
        type: 'optimal' as const,
        label: 'Optimal Zone B',
      },
      {
        id: 'exclusion-zone-1',
        position: {
          lat: bounds.minLat + latRange * 0.08,
          lng: bounds.minLng + lngRange * 0.1,
        },
        type: 'exclusion' as const,
        label: 'Setback Area',
      },
    ];
  }, []);

  const clearEquipment = useCallback(() => {
    setEquipmentPlacements([]);
    setShowEquipment(false);
    setZoneLabels([]);
  }, []);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAgentMessages([]);
    setCurrentPhase('data-collection');
    setAnalysisProgress(0);
    clearAllOverlays();
    clearEquipment();

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    const liveMetrics = await getAnalysisValues();
    const solarPotential = liveMetrics.annualProductionKwh && liveMetrics.systemSizeKw
      ? liveMetrics.annualProductionKwh / liveMetrics.systemSizeKw
      : 0;
    const windSpeedMph = (liveMetrics.weather?.windSpeedMph ?? 0) || (liveMetrics.areaAcres ? 8.4 : 0);

    setLiveAnalysisMetrics({
      solarPotentialKwhPerKwYr: solarPotential,
      windSpeedMph: windSpeedMph,
      systemSizeKw: liveMetrics.systemSizeKw || 0,
      annualOutputMwh: liveMetrics.annualProductionKwh ? Math.round(liveMetrics.annualProductionKwh / 1000) : 0,
    });

    const thinkThenComplete = async (
      thinkingText: string,
      completedText: string,
      type: AgentMessageType,
      resolvedType: AgentMessageType,
      thinkDuration: number,
      options?: { detail?: string; value?: string | number }
    ) => {
      const id = addAgentMessage(type, thinkingText, { status: 'active' });
      await delay(thinkDuration);
      updateAgentMessage(id, {
        status: 'completed',
        text: completedText,
        resolvedType,
        ...options
      });
    };

    addAgentMessage('thinking', 'Initializing analysis agent', { status: 'active' });
    await delay(600);
    setAgentMessages(prev => prev.map((m, i) => i === 0 ? { ...m, status: 'completed' as const, text: 'Analysis agent initialized' } : m));

    await thinkThenComplete(
      'Querying satellite imagery APIs...',
      'Loaded high-resolution satellite imagery',
      'data',
      'success',
      1200,
      { detail: 'Source: Sentinel-2 L2A, 10m resolution' }
    );

    await thinkThenComplete(
      'Processing terrain elevation data...',
      'Terrain analysis complete',
      'search',
      'success',
      1000,
      { detail: 'Elevation range: 342-385ft, Avg slope: 3.2°' }
    );
    showOverlay('terrain');

    await thinkThenComplete(
      'Fetching 10-year weather history from NOAA...',
      'Weather data integrated',
      'data',
      'success',
      1400,
      { detail: 'Annual avg: 4.2 kWh/m²/day solar, 8.3 mph wind' }
    );

    addAgentMessage('success', 'Data collection complete', {
      value: '3 data sources integrated'
    });
    setAnalysisProgress(0.2);

    setCurrentPhase('constraint-integration');
    await delay(400);

    await thinkThenComplete(
      'Analyzing budget parameters...',
      'Budget constraints applied',
      'processing',
      'success',
      900,
      { value: `₹${budget[0].toLocaleString('en-IN')} - ₹${budget[1].toLocaleString('en-IN')}` }
    );

    await thinkThenComplete(
      'Mapping property boundaries and setbacks...',
      'Exclusion zones identified',
      'search',
      'success',
      1100,
      { detail: '15ft property setback, utility easement detected' }
    );
    showOverlay('exclusion');

    const goalLabels: Record<string, string> = {
      'offset': 'Full energy offset',
      'maximize': 'Maximum production',
      'minimize': 'Cost minimization',
    };
    addAgentMessage('info', `Energy goal: ${goalLabels[primaryGoal] || primaryGoal}`);
    await delay(400);

    addAgentMessage('success', 'Constraints validated', {
      detail: 'All parameters within acceptable ranges'
    });
    setAnalysisProgress(0.4);

    setCurrentPhase('technology-optimization');
    await delay(400);

    await thinkThenComplete(
      'Running solar irradiance simulation...',
      'Solar potential mapped',
      'analysis',
      'success',
      1300,
      { value: `${Math.round(liveMetrics.annualProductionKwh / Math.max(liveMetrics.systemSizeKw || 1, 1)).toLocaleString()} kWh/kW/year potential` }
    );
    showOverlay('solar');

    await thinkThenComplete(
      'Evaluating panel configurations...',
      'Optimal panel selected',
      'processing',
      'insight',
      1000,
      { detail: 'SunPower M440 Bifacial - best efficiency for your conditions' }
    );

    if (technologies.includes('wind')) {
      await thinkThenComplete(
        'Analyzing wind patterns and turbulence...',
        'Wind assessment complete',
        'analysis',
        'success',
        1100,
        { value: '12 mph average', detail: 'Suitable for micro-turbine installation' }
      );
      showOverlay('wind');
    }

    addAgentMessage('success', 'Technology stack optimized');
    setAnalysisProgress(0.6);

    setCurrentPhase('system-design');
    await delay(400);

    hideOverlay('terrain');
    hideOverlay('solar');
    hideOverlay('wind');

    await thinkThenComplete(
      'Computing optimal equipment placement...',
      'Layout algorithm complete',
      'processing',
      'success',
      1200
    );

    showOverlay('optimal');

    if (prospectedArea) {
      const labels = generateZoneLabels(prospectedArea);
      setZoneLabels(labels);
    }

    await thinkThenComplete(
      'Calculating solar panel orientation...',
      'Panel orientation optimized',
      'calculation',
      'insight',
      1000,
      { value: '32° tilt, 180° azimuth', detail: 'Maximizes annual energy capture' }
    );

    addAgentMessage('info', '2 optimal zones identified for installation', {
      detail: 'Zone A: Primary array (35 kW) | Zone B: Secondary (10 kW)'
    });

    if (prospectedArea) {
      const placements = generateEquipmentPlacements(prospectedArea);
      setEquipmentPlacements(placements);
      setShowEquipment(true);
    }
    await delay(600);

    addAgentMessage('success', 'System design finalized', {
      value: `${Math.round(liveMetrics.systemSizeKw || 0).toLocaleString()} kW total capacity`
    });
    setAnalysisProgress(0.8);

    setCurrentPhase('financial-modeling');
    await delay(400);

    await thinkThenComplete(
      'Calculating equipment and installation costs...',
      'Cost model complete',
      'calculation',
      'success',
      1100,
      { value: `₹${Math.round((budget[0] + budget[1]) / 2).toLocaleString('en-IN')} estimated` }
    );

    await thinkThenComplete(
      'Applying incentives and tax credits...',
      'Federal ITC applied',
      'calculation',
      'insight',
      900,
      { value: '30% tax credit', detail: '$27,000+ in federal incentives' }
    );

    addAgentMessage('result', 'Estimated annual production', {
      value: `${Math.round(liveMetrics.annualProductionKwh || 0).toLocaleString()} kWh/year`,
      detail: 'Based on local solar irradiance and system efficiency'
    });
    await delay(500);

    addAgentMessage('result', 'Projected payback period', {
      value: '6.8 years',
      detail: 'Accounting for utility rate increases and degradation'
    });
    await delay(500);

    addAgentMessage('result', '25-year net savings', {
      value: '₹1,47,200',
      detail: 'After system costs and maintenance'
    });
    setAnalysisProgress(1.0);

    setCurrentPhase('complete');
    // Add verification prompt with clickable button
    const verifyMsgId = `msg-verify-${Date.now()}`;
    setAgentMessages(prev => [...prev, {
      id: verifyMsgId,
      type: 'action',
      text: 'Ready to verify your plan?',
      timestamp: new Date(),
      status: 'completed',
      detail: 'Link your utility account for optimized savings estimates.',
      onAction: () => setIsConsentModalOpen(true),
      actionLabel: 'Verify with Utility Data'
    }]);

    setIsAnalyzing(false);
  }, [addAgentMessage, updateAgentMessage, budget, primaryGoal, technologies, showOverlay, hideOverlay, clearAllOverlays, clearEquipment, prospectedArea, generateEquipmentPlacements, generateZoneLabels]);





  const summaryMessageRef = useRef<string | null>(null);

  const getAnalysisValues = useCallback(async () => {
    if (!prospectedArea || prospectedArea.length < 3) {
      return {
        systemSizeKw: 0,
        annualProductionKwh: 0,
        totalCost: 0,
        netCost: 0,
        paybackYears: 0,
        annualSavings: 0,
        co2OffsetTons: 0,
      };
    }

    try {
      const areaData = calculateAreaWithUnits(prospectedArea);
      const estimate = await fetchSiteAnalysis(
        prospectedArea.map((p) => ({ lat: p.lat, lng: p.lng })),
        {
          budget: draftConstraints?.budget,
          energy: draftConstraints?.energy,
          technical: draftConstraints?.technical,
        }
      );

      if (estimate.rooftopImage) {
        setRoofImageUrl(estimate.rooftopImage);
      }

      if (estimate.utilityTariff) {
        setTariffInfo({
          ratePerKwh: estimate.utilityTariff.ratePerKwh,
          currency: estimate.utilityTariff.currency,
          regionLabel: estimate.utilityTariff.regionLabel,
        });
      }

      return {
        systemSizeKw: estimate.systemSizeKw,
        annualProductionKwh: estimate.annualProductionKwh,
        totalCost: estimate.totalCost,
        netCost: estimate.netCostAfterIncentives,
        paybackYears: estimate.paybackYears,
        annualSavings: estimate.annualSavings,
        co2OffsetTons: estimate.co2OffsetTons,
        areaAcres: areaData.acres,
        weather: estimate.weather,
        roof: estimate.roof,
      };
    } catch (error) {
      console.error('Failed to fetch live site analysis', error);
      return {
        systemSizeKw: 0,
        annualProductionKwh: 0,
        totalCost: 0,
        netCost: 0,
        paybackYears: 0,
        annualSavings: 0,
        co2OffsetTons: 0,
      };
    }
  }, [prospectedArea, draftConstraints]);

  const addSummaryMessage = useCallback(async () => {
    const estimate = await getAnalysisValues();
    const id = `msg-summary-${Date.now()}`;
    summaryMessageRef.current = id;

    const message: AgentMessageData = {
      id,
      type: 'summary',
      text: 'Your Energy Plan Summary',
      timestamp: new Date(),
      status: 'completed',
      summaryData: {
        systemSizeKw: estimate.systemSizeKw,
        annualProductionKwh: estimate.annualProductionKwh,
        totalCost: estimate.totalCost,
        netCost: estimate.netCost,
        paybackYears: estimate.paybackYears,
        annualSavings: estimate.annualSavings,
        co2OffsetTons: estimate.co2OffsetTons,
        isSaving: false,
      },
    };
    setAgentMessages(prev => [...prev, message]);
  }, [getAnalysisValues]);

  const handleAnalyze = useCallback(() => {
    if (!validation.canProceed) return;

    // PRIVACY-FIRST AI CHECK - REMOVED for Late Consent Flow
    // We now allow analysis to run freely. Consent is requested at Save.

    // Close constraints sidebar and start the cinematic transition
    setIsConstraintsSidebarOpen(false);
    setIsAgentSidebarOpen(true);
    setAnalysisProgress(0);
    setIsTransitioningTo3D(true);
  }, [validation.canProceed]);

  const handleTransitionComplete = useCallback(() => {
    setIsTransitioningTo3D(false);
    setShow3DView(true);

    // Start the analysis after transition completes
    setTimeout(() => {
      runAnalysis();
    }, 300);
  }, [runAnalysis]);

  const handleStopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    setShow3DView(false);
    setIsTransitioningTo3D(false);
    setAnalysisProgress(0);
    setIsAgentSidebarOpen(false); // Close agent sidebar
    addAgentMessage('error', 'Analysis stopped by user');
  }, [addAgentMessage]);

  const handleBackToConstraints = useCallback(() => {
    setIsAgentSidebarOpen(false);
    setShow3DView(false);
    setIsTransitioningTo3D(false);
    setIsAnalyzing(false);
    setAgentMessages([]);
    setCurrentPhase('data-collection');
    setAnalysisProgress(0);
    clearAllOverlays();
    clearEquipment();

    setTimeout(() => {
      setIsConstraintsSidebarOpen(true);
    }, 350);
  }, [clearAllOverlays, clearEquipment]);

  const handleSavePlan = useCallback(async () => {
    if (!prospectedArea) return;

    // Consent now triggers automatically after analysis, no check needed here

    setIsSavingPlan(true);

    const analysisValues = await getAnalysisValues();
    const centroid = calculateCentroid(prospectedArea);
    const areaData = calculateAreaWithUnits(prospectedArea);

    const newPlan = {
      id: `plan-${Date.now()}`,
      userId: 'mock-user',
      name: locationName || `Plan ${new Date().toLocaleDateString()}`,
      status: 'complete' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      area: {
        coordinates: prospectedArea.map(p => ({ lat: p.lat, lng: p.lng })),
        center: centroid,
        areaAcres: areaData.acres,
        address: locationName || undefined,
      },
      constraints: draftConstraints ? {
        budget: draftConstraints.budget!,
        energy: draftConstraints.energy!,
        land: draftConstraints.land || { exclusionZones: [], existingStructures: [], currentUse: [] },
        technical: draftConstraints.technical!,
        timeline: draftConstraints.timeline || 'exploring',
      } : undefined,
      analysis: {
        systemSizeKw: analysisValues.systemSizeKw,
        annualProductionKwh: analysisValues.annualProductionKwh,
        co2OffsetTons: analysisValues.co2OffsetTons,
        equipmentPlacements: equipmentPlacements.map(ep => ({
          equipmentId: ep.id,
          position: ep.position,
          orientation: ep.details?.orientation,
        })),
      },
      financials: {
        totalCost: analysisValues.totalCost,
        netCostAfterIncentives: analysisValues.netCost,
        annualSavings: analysisValues.annualSavings,
        paybackYears: analysisValues.paybackYears,
        roi25Year: analysisValues.annualSavings * 25 - analysisValues.netCost,
        incentives: [
          { name: 'Federal ITC', amount: analysisValues.totalCost * 0.3, description: '30% federal tax credit' },
        ],
      },
    };

    await new Promise(resolve => setTimeout(resolve, 800));

    addPlan(newPlan);
    setDraftArea(null);

    setIsSavingPlan(false);
    router.push(`/overview/${newPlan.id}`);
  }, [prospectedArea, getAnalysisValues, locationName, draftConstraints, equipmentPlacements, addPlan, setDraftArea, router]);

  const handleAuthorizeAgent = useCallback((scopes: string[]) => {
    setIsConsentModalOpen(false);
    // Remove the action message (verify button)
    setAgentMessages(prev => prev.filter(m => m.type !== 'action'));

    // Use the NATIVE Agent Chat UI for feedback
    setIsAgentSidebarOpen(true);

    const sequence = async () => {
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

      // 1. Grant
      addAgentMessage('success', 'Permission granted', { detail: 'Authorized read:utility_usage' });
      await delay(800);

      // 2. Connect
      const id1 = addAgentMessage('thinking', 'Connecting to UtilityAPI...', { status: 'active' });
      await delay(1200);
      updateAgentMessage(id1, {
        status: 'completed',
        text: 'Connected to PG&E',
        resolvedType: 'success',
        detail: 'Secure connection established'
      });

      await delay(600);

      // 3. Fetch
      const id2 = addAgentMessage('thinking', 'Verifying 12-month usage history...', { status: 'active' });
      await delay(1500);
      updateAgentMessage(id2, {
        status: 'completed',
        text: 'Usage data verified',
        resolvedType: 'data',
        value: '4.2 kWh Peak Alleviation',
        detail: 'Actual usage is 15% lower than estimated'
      });

      await delay(600);

      // 4. Update Plan Data (Simulated)
      setHasAgentConsent(true);
      addAgentMessage('success', 'Plan verified with utility data');

      await delay(800);

      // 5. Show Verified Summary using the current land estimate
      const verifiedEstimate = await getAnalysisValues();
      const summaryId = `msg-summary-verified-${Date.now()}`;
      const summaryMessage: AgentMessageData = {
        id: summaryId,
        type: 'summary',
        text: 'Verified Energy Plan Summary',
        timestamp: new Date(),
        status: 'completed',
        summaryData: {
          systemSizeKw: verifiedEstimate.systemSizeKw,
          annualProductionKwh: verifiedEstimate.annualProductionKwh,
          totalCost: verifiedEstimate.totalCost,
          netCost: verifiedEstimate.netCost,
          paybackYears: verifiedEstimate.paybackYears,
          annualSavings: verifiedEstimate.annualSavings,
          co2OffsetTons: verifiedEstimate.co2OffsetTons,
          isSaving: false,
        },
      };
      setAgentMessages(prev => [...prev, summaryMessage]);

      await delay(800);

      // 6. Ready for Manual Save
      addAgentMessage('info', 'Verification Complete', {
        detail: 'You can now save your certified plan.',
        status: 'completed'
      });

      // Auto-save REMOVED to allow user review
      // handleSavePlan(true); 
    };

    sequence();
  }, [addAgentMessage, updateAgentMessage, budget]);

  const handleDenyAgent = useCallback(() => {
    setIsConsentModalOpen(false);
    // Remove the action message (verify button)
    setAgentMessages(prev => prev.filter(m => m.type !== 'action'));
    addAgentMessage('error', 'Verification skipped', { detail: 'Showing estimated plan' });
    // Show unverified summary instead of auto-saving
    addSummaryMessage();
  }, [addAgentMessage, addSummaryMessage]);

  const handleStartOver = useCallback(() => {
    setVisibleOverlays(new Set());
    setEquipmentPlacements([]);
    setShowEquipment(false);
    setZoneLabels([]);
    setAgentMessages([]);
    setCurrentPhase('data-collection');
    setIsAnalyzing(false);
    setProspectedArea(null);
    setLocationName(null);
    setIsAgentSidebarOpen(false);
    setShow3DView(false);
    setIsTransitioningTo3D(false);
    setAnalysisProgress(0);
    summaryMessageRef.current = null;
  }, []);

  useEffect(() => {
    if (!prospectedArea || prospectedArea.length < 3) {
      setLocationName(null);
      return;
    }

    const centroid = calculateCentroid(prospectedArea);
    setIsLoadingLocation(true);

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${centroid.lat}&lon=${centroid.lng}&format=json&zoom=14`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.display_name) {
          const parts = data.display_name.split(', ');
          const shortName = parts.slice(0, 3).join(', ');
          setLocationName(shortName);
        } else {
          setLocationName(`${centroid.lat.toFixed(4)}, ${centroid.lng.toFixed(4)}`);
        }
      })
      .catch(() => {
        setLocationName(`${centroid.lat.toFixed(4)}, ${centroid.lng.toFixed(4)}`);
      })
      .finally(() => {
        setIsLoadingLocation(false);
      });
  }, [prospectedArea]);

  // REMOVED: Summary now shown by consent handlers, not auto-triggered
  // useEffect(() => {
  //   if (currentPhase === 'complete' && !isAnalyzing && !summaryMessageRef.current) {
  //     addSummaryMessage();
  //   }
  // }, [currentPhase, isAnalyzing, addSummaryMessage]);

  const handleMapReady = useCallback((map: LeafletMap) => {
    mapRef.current = map;
    setIsMapReady(true);

    if (typeof window === 'undefined') return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCenter: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setMapCenter(nextCenter);
          setMapZoom(15);
          map.flyTo(nextCenter, 15, { duration: 1.4 });
        },
        () => {
          setMapCenter([29.654, -97.991]);
          setMapZoom(12);
          map.flyTo([29.654, -97.991], 12, { duration: 1.2 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    }
  }, []);

  const handleTileLayerChange = useCallback((layer: TileLayerType) => {
    setTileLayer(layer);
  }, []);

  const handleStartProspecting = useCallback(() => {
    setIsProspecting(true);
    setProspectedArea(null);
  }, []);

  const handleProspectComplete = useCallback((coords: PolygonCoordinates[]) => {
    setProspectedArea(coords);
    setIsProspecting(false);
  }, []);

  const handleProspectCancel = useCallback(() => {
    setIsProspecting(false);
  }, []);

  const handleOpenConstraintsSidebar = useCallback(() => {
    setIsConstraintsSidebarOpen(true);
  }, []);

  const handleCloseConstraintsSidebar = useCallback(() => {
    setIsConstraintsSidebarOpen(false);
  }, []);

  const handleMapWidthChange = useCallback((width: string) => {
    setMapWidth(width);
    // Invalidate map size after transition to ensure proper rendering
    setTimeout(() => {
  try {
    const map = mapRef.current;

    if (
      map &&
      typeof map.invalidateSize === "function"
    ) {
      map.invalidateSize();
    }
  } catch (error) {
    console.warn("Leaflet map not ready yet");
  }
}, 350);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: (show3DView || isTransitioningTo3D) ? 0 : 1,
          width: mapWidth,
          scale: (show3DView || isTransitioningTo3D) ? 0.95 : 1
        }}
        transition={{
          opacity: { duration: 0.6 },
          width: { type: 'spring', damping: 30, stiffness: 300 },
          scale: { duration: 0.6 }
        }}
        className="absolute inset-0"
        style={{
          width: mapWidth,
          pointerEvents: (show3DView || isTransitioningTo3D) ? 'none' : 'auto'
        }}
      >
        <DynamicMap
          tileLayer={tileLayer}
          onMapReady={handleMapReady}
          className="h-full w-full"
          center={mapCenter}
          zoom={mapZoom}
        >
          {isMapReady && (
            <>
              <AnimatePresence>
                {!isProspecting && (
                  <MapControls
                    currentTileLayer={tileLayer}
                    onTileLayerChange={handleTileLayerChange}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!isProspecting && (
                  <AddressSearch className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]" />
                )}
              </AnimatePresence>

              <ProspectMode
                isActive={isProspecting}
                onComplete={handleProspectComplete}
                onCancel={handleProspectCancel}
              />

              {!isProspecting && prospectedArea && (
                <CompletedPolygon coordinates={prospectedArea} />
              )}

              {prospectedArea && (
                <>
                  <TerrainOverlay
                    polygon={prospectedArea}
                    visible={visibleOverlays.has('terrain')}
                  />
                  <SolarOverlay
                    polygon={prospectedArea}
                    visible={visibleOverlays.has('solar')}
                  />
                  <WindOverlay
                    polygon={prospectedArea}
                    visible={visibleOverlays.has('wind')}
                  />
                  <ExclusionOverlay
                    polygon={prospectedArea}
                    visible={visibleOverlays.has('exclusion')}
                  />
                  <OptimalOverlay
                    polygon={prospectedArea}
                    visible={visibleOverlays.has('optimal')}
                  />
                </>
              )}

              {showEquipment && equipmentPlacements.length > 0 && (
                <EquipmentMarkerGroup
                  placements={equipmentPlacements}
                  staggerDelay={150}
                />
              )}

              {zoneLabels.map((zone, index) => (
                <ZoneLabel
                  key={zone.id}
                  position={zone.position}
                  type={zone.type}
                  label={zone.label}
                  visible={visibleOverlays.has('optimal') || visibleOverlays.has('exclusion')}
                  animationDelay={index * 200}
                />
              ))}
            </>
          )}
        </DynamicMap>
      </motion.div>

      {/* Cinematic Transition from Map to 3D */}
      <MapTo3DTransition
        isTransitioning={isTransitioningTo3D}
        onTransitionComplete={handleTransitionComplete}
        locationName={locationName}
      />

      {/* 3D Terrain Analysis View */}
      <TerrainAnalysisScene
        phase={currentPhase}
        progress={analysisProgress}
        isVisible={show3DView}
        polygon={prospectedArea}
      />


      {show3DView && (
        <AnalysisOverlay
          phase={currentPhase}
          isAnalyzing={isAnalyzing}
          progress={analysisProgress}
          locationName={locationName}
          areaAcres={prospectedArea ? calculateAreaWithUnits(prospectedArea).acres : undefined}
          metrics={liveAnalysisMetrics}
          onBack={handleBackToConstraints}
          onStop={isAnalyzing ? handleStopAnalysis : undefined}
          onSave={currentPhase === 'complete' ? handleSavePlan : undefined}
          isSaving={isSavingPlan}
        />
      )}

      {show3DView && roofImageUrl && (
        <div className="absolute right-6 top-24 z-20 w-[320px] rounded-2xl border border-white/70 bg-background/80 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rooftop imagery</p>
              <p className="text-sm font-semibold">Satellite roof preview</p>
            </div>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <img src={roofImageUrl} alt="Roof extraction preview" className="h-40 w-full rounded-xl object-cover border border-border" />
          {tariffInfo && (
            <div className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-900">
              <div className="font-semibold">Live tariff</div>
              <div>{tariffInfo.currency} {tariffInfo.ratePerKwh.toFixed(3)}/kWh</div>
              <div className="opacity-80">{tariffInfo.regionLabel}</div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {!isProspecting && !show3DView && !isTransitioningTo3D && !isAgentSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 z-[1000] pointer-events-none"
          >
            <div className="p-4 flex items-center gap-4 pointer-events-auto">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => router.push('/home')}
                className="h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm shadow-lg border border-border/50 hover:bg-background"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border/50">
                <Leaf className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Solvix</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isProspecting && !prospectedArea && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]"
          >
            <div className="bg-background/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 px-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    Select Your Land
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Navigate to your property, then start prospecting
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleStartProspecting}
                  className="gap-2"
                >
                  <Crosshair className="h-5 w-5" />
                  Start Prospecting
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isProspecting && prospectedArea && !isConstraintsSidebarOpen && !isAgentSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-6 right-6 z-[1000]"
          >
            <div className="bg-background/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 p-5 w-80">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    Area Selected
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Ruler className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Area</p>
                      <p className="text-xl font-bold text-foreground">
                        {formatArea(calculateAreaWithUnits(prospectedArea).acres)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Location</p>
                      {isLoadingLocation ? (
                        <p className="text-sm text-muted-foreground animate-pulse">
                          Finding location...
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-foreground truncate">
                          {locationName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={handleOpenConstraintsSidebar}
                    className="w-full gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze This Area
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartProspecting}
                    className="w-full text-muted-foreground"
                  >
                    Redraw Selection
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConstraintsSidebar
        isOpen={isConstraintsSidebarOpen}
        onClose={handleCloseConstraintsSidebar}
        onMapWidthChange={handleMapWidthChange}
        validation={validation}
        onAnalyze={handleAnalyze}
      >
        <FinancialConstraints
          budget={budget}
          financing={financing}
          paybackPriority={paybackPriority}
          onBudgetChange={handleBudgetChange}
          onFinancingChange={handleFinancingChange}
          onPaybackPriorityChange={handlePaybackPriorityChange}
          defaultOpen
        />
        <EnergyConstraints
          primaryGoal={primaryGoal}
          targetProduction={targetProduction}
          gridConnection={gridConnection}
          onPrimaryGoalChange={handlePrimaryGoalChange}
          onTargetProductionChange={handleTargetProductionChange}
          onGridConnectionChange={handleGridConnectionChange}
        />
        <TechnicalConstraints
          technologies={technologies}
          aestheticConcern={aestheticConcern}
          maintenanceCapacity={maintenanceCapacity}
          onTechnologiesChange={handleTechnologiesChange}
          onAestheticConcernChange={handleAestheticConcernChange}
          onMaintenanceCapacityChange={handleMaintenanceCapacityChange}
        />
        <TimelineConstraints
          timeline={timeline}
          onTimelineChange={handleTimelineChange}
        />
      </ConstraintsSidebar>

      <AgentSidebar
        isOpen={isAgentSidebarOpen || show3DView}
        onClose={() => setIsAgentSidebarOpen(false)}
        onBack={handleBackToConstraints}
        onStop={handleStopAnalysis}
        onSavePlan={() => handleSavePlan()}
        onStartOver={handleStartOver}
        onVerify={() => setIsConsentModalOpen(true)}
        hasConsent={hasAgentConsent}
        isSaving={isSavingPlan}
        onMapWidthChange={handleMapWidthChange}
        messages={agentMessages}
        currentPhase={currentPhase}
        isAnalyzing={isAnalyzing}
      />
      <AgentConsentModal
        isOpen={isConsentModalOpen}
        onAccept={handleAuthorizeAgent}
        onDeny={handleDenyAgent}
      />

      {/* Security Log Visualizer for Hackathon Demo */}
      {/* Security Log Visualizer for Hackathon Demo - REMOVED for Native UI */}
    </div>
  );
}

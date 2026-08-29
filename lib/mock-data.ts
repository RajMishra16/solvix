import type { Plan } from '@/types/plan';

export const SAMPLE_PLANS: Plan[] = [
  {
    id: 'plan_sample_001',
    userId: 'user_demo_001',
    name: 'Johnson Family Farm',
    status: 'complete',
    createdAt: new Date('2025-12-15'),
    updatedAt: new Date('2025-12-20'),
    area: {
      coordinates: [
        { lat: 39.7392, lng: -104.9903 },
        { lat: 39.7492, lng: -104.9903 },
        { lat: 39.7492, lng: -104.9803 },
        { lat: 39.7392, lng: -104.9803 },
      ],
      center: { lat: 39.7442, lng: -104.9853 },
      areaAcres: 12.5,
      address: '4521 Rural Route 7, Brighton, CO 80601',
    },
    constraints: {
      budget: {
        min: 50000,
        max: 150000,
        financing: 'loan',
        paybackPriority: 60,
      },
      energy: {
        primaryGoal: 'offset',
        targetProduction: 2500,
        gridConnection: 'connected',
      },
      land: {
        exclusionZones: [],
        existingStructures: ['barn', 'home', 'well'],
        currentUse: ['grazing', 'unused'],
      },
      technical: {
        technologies: ['solar', 'storage'],
        aestheticConcern: 30,
        maintenanceCapacity: 'mixed',
      },
      timeline: 'this-year',
    },
    analysis: {
      systemSizeKw: 45,
      annualProductionKwh: 67500,
      co2OffsetTons: 47.8,
      equipmentPlacements: [],
    },
    financials: {
      totalCost: 98500,
      netCostAfterIncentives: 68950,
      annualSavings: 8100,
      paybackYears: 8.5,
      roi25Year: 285,
      incentives: [
        { name: 'Federal ITC (30%)', amount: 29550, description: 'Investment Tax Credit' },
      ],
    },
  },
  {
    id: 'plan_sample_002',
    userId: 'user_demo_001',
    name: 'Meadow Creek Ranch',
    status: 'complete',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-10'),
    area: {
      coordinates: [
        { lat: 40.0150, lng: -105.2705 },
        { lat: 40.0250, lng: -105.2705 },
        { lat: 40.0250, lng: -105.2605 },
        { lat: 40.0150, lng: -105.2605 },
      ],
      center: { lat: 40.0200, lng: -105.2655 },
      areaAcres: 28.3,
      address: '8901 Mountain View Rd, Longmont, CO 80503',
    },
    constraints: {
      budget: {
        min: 100000,
        max: 300000,
        financing: 'cash',
        paybackPriority: 40,
      },
      energy: {
        primaryGoal: 'independence',
        gridConnection: 'hybrid',
      },
      land: {
        exclusionZones: [],
        existingStructures: ['home', 'barn', 'pond'],
        currentUse: ['active-farming'],
      },
      technical: {
        technologies: ['solar', 'wind', 'storage'],
        aestheticConcern: 20,
        maintenanceCapacity: 'diy',
      },
      timeline: 'asap',
    },
    analysis: {
      systemSizeKw: 85,
      annualProductionKwh: 127500,
      co2OffsetTons: 90.3,
      equipmentPlacements: [],
    },
    financials: {
      totalCost: 245000,
      netCostAfterIncentives: 171500,
      annualSavings: 15300,
      paybackYears: 11.2,
      roi25Year: 312,
      incentives: [
        { name: 'Federal ITC (30%)', amount: 73500, description: 'Investment Tax Credit' },
      ],
    },
  },
  {
    id: 'plan_sample_003',
    userId: 'user_demo_001',
    name: 'Sunset Acres',
    status: 'draft',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
    area: {
      coordinates: [
        { lat: 39.5501, lng: -105.7821 },
        { lat: 39.5551, lng: -105.7821 },
        { lat: 39.5551, lng: -105.7771 },
        { lat: 39.5501, lng: -105.7771 },
      ],
      center: { lat: 39.5526, lng: -105.7796 },
      areaAcres: 7.8,
      address: '2234 County Road 45, Evergreen, CO 80439',
    },
  },
];

export function getSamplePlans(): Plan[] {
  return SAMPLE_PLANS.map(plan => ({
    ...plan,
    createdAt: new Date(plan.createdAt),
    updatedAt: new Date(plan.updatedAt),
  }));
}

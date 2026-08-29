import type { Plan } from '@/types/plan';

export interface CostBreakdownData {
  name: string;
  value: number;
  color: string;
}

export interface CashFlowData {
  year: number;
  cumulative: number;
  annual: number;
  breakeven: boolean;
}

export interface IncentiveData {
  name: string;
  amount: number;
  description: string;
  type: 'federal' | 'state' | 'utility' | 'other';
}

export interface EquipmentLineItem {
  id: string;
  category: 'solar' | 'wind' | 'storage' | 'bos' | 'installation';
  name: string;
  model: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const COST_COLORS = {
  equipment: '#3b82f6',
  installation: '#22c55e', 
  permits: '#f59e0b',
  electrical: '#8b5cf6',
  contingency: '#6b7280',
};

export function generateCostBreakdownData(plan: Plan | null): CostBreakdownData[] {
  const totalCost = plan?.financials?.totalCost ?? 98500;
  
  const equipmentPct = 0.55;
  const installationPct = 0.25;
  const electricalPct = 0.10;
  const permitsPct = 0.05;
  const contingencyPct = 0.05;

  return [
    { name: 'Equipment', value: Math.round(totalCost * equipmentPct), color: COST_COLORS.equipment },
    { name: 'Installation', value: Math.round(totalCost * installationPct), color: COST_COLORS.installation },
    { name: 'Electrical', value: Math.round(totalCost * electricalPct), color: COST_COLORS.electrical },
    { name: 'Permits & Fees', value: Math.round(totalCost * permitsPct), color: COST_COLORS.permits },
    { name: 'Contingency', value: Math.round(totalCost * contingencyPct), color: COST_COLORS.contingency },
  ];
}

export function generateCashFlowData(plan: Plan | null): CashFlowData[] {
  const netCost = plan?.financials?.netCostAfterIncentives ?? 68950;
  const annualSavings = plan?.financials?.annualSavings ?? 8100;
  const paybackYears = plan?.financials?.paybackYears ?? 8.5;
  
  const data: CashFlowData[] = [];
  
  for (let year = 0; year <= 25; year++) {
    const degradation = 1 - (year * 0.005);
    const adjustedSavings = year === 0 ? 0 : annualSavings * degradation;
    const previousCumulative = year === 0 ? -netCost : data[year - 1].cumulative;
    const cumulative = previousCumulative + adjustedSavings;
    
    data.push({
      year,
      cumulative: Math.round(cumulative),
      annual: Math.round(adjustedSavings),
      breakeven: year > 0 && data[year - 1]?.cumulative < 0 && cumulative >= 0,
    });
  }
  
  return data;
}

export function generateIncentivesData(plan: Plan | null): IncentiveData[] {
  const totalCost = plan?.financials?.totalCost ?? 98500;
  const existingIncentives = plan?.financials?.incentives ?? [];
  
  const baseIncentives: IncentiveData[] = [
    {
      name: 'Federal ITC (30%)',
      amount: Math.round(totalCost * 0.30),
      description: 'Investment Tax Credit for solar installations',
      type: 'federal',
    },
    {
      name: 'State Tax Credit',
      amount: Math.round(totalCost * 0.05),
      description: 'Colorado renewable energy tax credit',
      type: 'state',
    },
    {
      name: 'Utility Rebate',
      amount: 2500,
      description: 'Xcel Energy solar rebate program',
      type: 'utility',
    },
  ];

  if (totalCost > 150000) {
    baseIncentives.push({
      name: 'USDA REAP Grant',
      amount: Math.round(totalCost * 0.25),
      description: 'Rural Energy for America Program (if eligible)',
      type: 'federal',
    });
  }

  return baseIncentives;
}

export function generateEquipmentData(plan: Plan | null): EquipmentLineItem[] {
  const systemSize = plan?.analysis?.systemSizeKw ?? 45;
  const technologies = plan?.constraints?.technical?.technologies ?? ['solar'];
  const totalCost = plan?.financials?.totalCost ?? 98500;
  
  const items: EquipmentLineItem[] = [];
  
  if (technologies.includes('solar')) {
    const panelCount = Math.ceil(systemSize / 0.4);
    const panelPrice = 280;
    items.push({
      id: 'solar-panels',
      category: 'solar',
      name: 'Solar Panels',
      model: 'LONGi Hi-MO 6 Explorer',
      quantity: panelCount,
      unitPrice: panelPrice,
      totalPrice: panelCount * panelPrice,
    });
    
    const inverterCount = Math.ceil(systemSize / 12);
    const inverterPrice = 1800;
    items.push({
      id: 'inverters',
      category: 'solar',
      name: 'String Inverters',
      model: 'SolarEdge SE11400H',
      quantity: inverterCount,
      unitPrice: inverterPrice,
      totalPrice: inverterCount * inverterPrice,
    });
    
    items.push({
      id: 'racking',
      category: 'solar',
      name: 'Mounting System',
      model: 'IronRidge XR100 Ground Mount',
      quantity: 1,
      unitPrice: Math.round(systemSize * 150),
      totalPrice: Math.round(systemSize * 150),
    });
  }
  
  if (technologies.includes('wind')) {
    const turbineCount = Math.max(1, Math.floor(systemSize / 30));
    const turbinePrice = 18500;
    items.push({
      id: 'wind-turbine',
      category: 'wind',
      name: 'Wind Turbine',
      model: 'Bergey Excel 15',
      quantity: turbineCount,
      unitPrice: turbinePrice,
      totalPrice: turbineCount * turbinePrice,
    });
    
    items.push({
      id: 'wind-tower',
      category: 'wind',
      name: 'Turbine Tower',
      model: '100ft Guyed Lattice',
      quantity: turbineCount,
      unitPrice: 8500,
      totalPrice: turbineCount * 8500,
    });
  }
  
  if (technologies.includes('storage')) {
    const batteryCount = Math.max(1, Math.ceil(systemSize / 15));
    const batteryPrice = 8500;
    items.push({
      id: 'battery',
      category: 'storage',
      name: 'Battery System',
      model: 'Tesla Powerwall 3',
      quantity: batteryCount,
      unitPrice: batteryPrice,
      totalPrice: batteryCount * batteryPrice,
    });
  }
  
  items.push({
    id: 'electrical-bos',
    category: 'bos',
    name: 'Electrical BOS',
    model: 'Wiring, Conduit, Disconnects',
    quantity: 1,
    unitPrice: Math.round(totalCost * 0.08),
    totalPrice: Math.round(totalCost * 0.08),
  });
  
  items.push({
    id: 'monitoring',
    category: 'bos',
    name: 'Monitoring System',
    model: 'SolarEdge SetApp + CT Meters',
    quantity: 1,
    unitPrice: 450,
    totalPrice: 450,
  });
  
  items.push({
    id: 'installation-labor',
    category: 'installation',
    name: 'Installation Labor',
    model: 'Licensed contractor',
    quantity: 1,
    unitPrice: Math.round(totalCost * 0.18),
    totalPrice: Math.round(totalCost * 0.18),
  });
  
  items.push({
    id: 'permits',
    category: 'installation',
    name: 'Permits & Inspections',
    model: 'Building, electrical, utility',
    quantity: 1,
    unitPrice: Math.round(totalCost * 0.03),
    totalPrice: Math.round(totalCost * 0.03),
  });
  
  return items;
}

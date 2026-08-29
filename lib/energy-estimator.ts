import type { Plan, PlanConstraints } from '@/types/plan';

export interface EnergyEstimate {
  systemSizeKw: number;
  annualProductionKwh: number;
  co2OffsetTons: number;
  totalCost: number;
  netCostAfterIncentives: number;
  annualSavings: number;
  paybackYears: number;
  roi25Year: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function getAreaAcresFromPlan(plan?: Partial<Plan>): number {
  if (!plan?.area?.coordinates?.length) return 5;

  const coords = plan.area.coordinates;
  const latValues = coords.map((p) => p.lat);
  const lngValues = coords.map((p) => p.lng);
  const width = Math.max(...lngValues) - Math.min(...lngValues);
  const height = Math.max(...latValues) - Math.min(...latValues);
  const approxSquareDegrees = Math.abs(width * height);
  const acres = approxSquareDegrees * 250000;
  return clamp(acres, 1, 5000);
}

function getSolarFactor(latitude: number) {
  const absLat = Math.abs(latitude);
  if (absLat < 10) return 1.22;
  if (absLat < 20) return 1.12;
  if (absLat < 30) return 1.0;
  if (absLat < 40) return 0.9;
  return 0.78;
}

function getTechFactor(technologies: string[] = []) {
  let factor = 1;
  if (technologies.includes('wind')) factor += 0.12;
  if (technologies.includes('storage')) factor += 0.15;
  if (technologies.includes('hydro')) factor += 0.08;
  return factor;
}

function getGoalFactor(goal?: string) {
  switch (goal) {
    case 'income': return 1.22;
    case 'independence': return 1.18;
    case 'environmental': return 1.1;
    default: return 1;
  }
}

function getTariffRupeesPerKwh(latitude: number) {
  const absLat = Math.abs(latitude);
  if (absLat <= 10) return 8.5;
  if (absLat <= 20) return 8.1;
  if (absLat <= 30) return 7.6;
  return 7.1;
}

export function calculateEnergyEstimate(
  areaAcres: number,
  latitude: number,
  constraints?: Partial<PlanConstraints>
): EnergyEstimate {
  const technologies = constraints?.technical?.technologies ?? ['solar'];
  const primaryGoal = constraints?.energy?.primaryGoal ?? 'offset';
  const targetProduction = constraints?.energy?.targetProduction ?? 0;
  const budgetMin = constraints?.budget?.min ?? 50000;
  const budgetMax = constraints?.budget?.max ?? 150000;

  const normalizedArea = clamp(areaAcres, 1, 2500);
  const baseSystemKw = normalizedArea * 2.8;
  const targetBoost = targetProduction > 0 ? Math.max(0.7, targetProduction / 4500) : 1;
  const budgetBoost = ((budgetMin + budgetMax) / 200000) * 0.7 + 1;

  const systemSizeKw = clamp(
    baseSystemKw * getSolarFactor(latitude) * getTechFactor(technologies) * getGoalFactor(primaryGoal) * targetBoost * budgetBoost,
    4,
    1000
  );

  const annualProductionKwh = clamp(
    systemSizeKw * (1700 + (35 - Math.abs(latitude)) * 15) * 0.78,
    15000,
    5000000
  );

  const co2OffsetTons = clamp(annualProductionKwh / 2600, 15, 20000);
  const totalCost = clamp(systemSizeKw * 65000 + (technologies.includes('storage') ? 500000 : 0) + (technologies.includes('wind') ? 350000 : 0), 120000, 90000000);
  const incentivesRate = 0.26 + (technologies.includes('storage') ? 0.04 : 0);
  const netCostAfterIncentives = clamp(totalCost * (1 - incentivesRate), 60000, 70000000);
  const annualSavings = clamp(annualProductionKwh * getTariffRupeesPerKwh(latitude), 20000, 15000000);
  const paybackYears = clamp(netCostAfterIncentives / Math.max(annualSavings, 1), 2.5, 18);
  const roi25Year = clamp(((annualSavings * 25) - netCostAfterIncentives) / Math.max(netCostAfterIncentives, 1) * 100, 10, 800);

  return {
    systemSizeKw: Number(systemSizeKw.toFixed(1)),
    annualProductionKwh: Math.round(annualProductionKwh),
    co2OffsetTons: Number(co2OffsetTons.toFixed(1)),
    totalCost: Math.round(totalCost),
    netCostAfterIncentives: Math.round(netCostAfterIncentives),
    annualSavings: Math.round(annualSavings),
    paybackYears: Number(paybackYears.toFixed(2)),
    roi25Year: Number(roi25Year.toFixed(1)),
  };
}

export interface EstimatePlanInput {
  area?: Partial<Plan['area']>;
  constraints?: Partial<PlanConstraints>;
}

export function getPlanEstimate(plan?: EstimatePlanInput): EnergyEstimate {
  const areaAcres = plan?.area?.areaAcres ?? getAreaAcresFromPlan(plan as Partial<Plan> | undefined);
  const latitude = plan?.area?.center?.lat ?? plan?.area?.coordinates?.[0]?.lat ?? 22.5;
  return calculateEnergyEstimate(areaAcres, latitude, plan?.constraints);
}

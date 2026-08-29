/**
 * Core type definitions for Solvix plans
 */

export type PlanStatus = 'draft' | 'analyzing' | 'complete';
export type FinancingType = 'cash' | 'loan' | 'lease' | 'undecided';
export type EnergyGoal = 'offset' | 'income' | 'independence' | 'environmental';
export type GridConnection = 'connected' | 'offgrid' | 'hybrid';
export type Technology = 'solar' | 'wind' | 'storage' | 'hydro';
export type MaintenanceCapacity = 'diy' | 'full-service' | 'mixed';
export type Timeline = 'asap' | 'this-year' | '1-2-years' | 'exploring';
export type EquipmentCategory = 'solar' | 'wind' | 'storage' | 'bos' | 'installation';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlanArea {
  coordinates: Coordinates[];
  center: Coordinates;
  areaAcres: number;
  address?: string;
}

export interface BudgetConstraints {
  min: number;
  max: number;
  financing: FinancingType;
  paybackPriority: number; // 0-100, higher = faster ROI preferred
}

export interface EnergyConstraints {
  primaryGoal: EnergyGoal;
  targetProduction?: number; // kWh/month
  gridConnection: GridConnection;
}

export interface LandConstraints {
  exclusionZones: Coordinates[][];
  existingStructures: string[];
  currentUse: string[];
}

export interface TechnicalConstraints {
  technologies: Technology[];
  aestheticConcern: number; // 0-100
  maintenanceCapacity: MaintenanceCapacity;
}

export interface PlanConstraints {
  budget: BudgetConstraints;
  energy: EnergyConstraints;
  land: LandConstraints;
  technical: TechnicalConstraints;
  timeline: Timeline;
}

export interface Equipment {
  id: string;
  category: EquipmentCategory;
  type: string;
  model: string;
  manufacturer: string;
  specs: Record<string, unknown>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  position?: Coordinates;
  reasoning: string;
}

export interface FinancialProjection {
  totalCost: number;
  netCostAfterIncentives: number;
  annualSavings: number;
  paybackYears: number;
  roi25Year: number;
  incentives: {
    name: string;
    amount: number;
    description: string;
  }[];
}

export interface PlanAnalysis {
  systemSizeKw: number;
  annualProductionKwh: number;
  co2OffsetTons: number;
  equipmentPlacements: {
    equipmentId: string;
    position: Coordinates;
    orientation?: number;
  }[];
}

export interface Plan {
  id: string;
  userId: string;
  name: string;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
  area: PlanArea;
  constraints?: PlanConstraints;
  analysis?: PlanAnalysis;
  equipment?: Equipment[];
  financials?: FinancialProjection;
}

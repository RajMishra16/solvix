export interface LiveSiteAnalysis {
  systemSizeKw: number;
  annualProductionKwh: number;
  co2OffsetTons: number;
  totalCost: number;
  netCostAfterIncentives: number;
  annualSavings: number;
  paybackYears: number;
  roi25Year: number;
  weather: {
    dailySolar: number;
    avgTemperature: number;
    avgCloudCover: number;
    precipitation: number;
    windSpeedMph: number;
    source: string;
  };
  irradiance: {
    ghi: number;
    dni: number;
    peakSunHours: number;
    source: string;
  };
  utilityTariff: {
    ratePerKwh: number;
    currency: string;
    source: string;
    regionLabel: string;
  };
  satellite: {
    source: string;
    imageUrl?: string;
    zoom: number;
  };
  rooftopImage?: string;
  roof: {
    suitability: number;
    roofPotentialKw: number;
    panelCount: number;
    extractionSource?: string;
  };
}

export async function fetchSiteAnalysis(
  coordinates: Array<{ lat: number; lng: number }>,
  constraints?: Record<string, unknown>
): Promise<LiveSiteAnalysis> {
  const response = await fetch('/api/site-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates, constraints }),
  });

  if (!response.ok) {
    throw new Error('Unable to fetch live solar analysis');
  }

  return response.json();
}

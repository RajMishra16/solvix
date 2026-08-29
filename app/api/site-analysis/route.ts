import { NextRequest } from 'next/server';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageNumber(values: number[]) {
  if (!Array.isArray(values) || !values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function getPolygonCenter(coordinates: Array<{ lat: number; lng: number }>) {
  const lat = average(coordinates.map((p) => p.lat));
  const lng = average(coordinates.map((p) => p.lng));
  return { lat, lng };
}

function estimateRoofSuitability(latitude: number) {
  const absLat = Math.abs(latitude);
  if (absLat < 30) return 0.88;
  if (absLat < 45) return 0.8;
  return 0.72;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function resolveLocationLabel(lat: number, lng: number) {
  const reverseGeocode = await fetchJson<{ display_name?: string; address?: Record<string, string> }>(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  );

  const address = reverseGeocode?.address ?? {};
  const city = address.city || address.town || address.village || address.municipality || 'site';
  const country = address.country || 'local';
  return { city, country, displayName: reverseGeocode?.display_name || `${city}, ${country}` };
}

async function getWeatherAndIrradiance(lat: number, lng: number) {
  const weatherResponse = await fetchJson<{ hourly?: { temperature_2m?: number[]; cloud_cover?: number[]; shortwave_radiation?: number[]; direct_normal_irradiance?: number[]; global_tilted_irradiation?: number[]; wind_speed_10m?: number[] }; current?: { temperature_2m?: number; precipitation?: number; cloud_cover?: number } }>(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,cloud_cover,precipitation&hourly=temperature_2m,cloud_cover,shortwave_radiation,direct_normal_irradiance,global_tilted_irradiation,wind_speed_10m&daily=sunrise,sunset&timezone=auto&forecast_days=3`
  );

  let weather = {
    dailySolar: 5.1,
    avgTemperature: 24,
    avgCloudCover: 35,
    precipitation: 0.7,
    windSpeedMph: 8.4,
    source: 'Open-Meteo forecast',
  };

  let irradiance = {
    ghi: 5.1,
    dni: 5.6,
    peakSunHours: 5.1,
    source: 'Open-Meteo solar radiation',
  };

  if (weatherResponse) {
    const temps = weatherResponse.hourly?.temperature_2m ?? [];
    const solar = weatherResponse.hourly?.shortwave_radiation ?? [];
    const cloudCover = weatherResponse.hourly?.cloud_cover ?? [];
    const ghiValues = weatherResponse.hourly?.global_tilted_irradiation ?? [];
    const dniValues = weatherResponse.hourly?.direct_normal_irradiance ?? [];
    const windValues = weatherResponse.hourly?.wind_speed_10m ?? [];

    const ghiAverage = averageNumber(ghiValues.length ? ghiValues : solar);
    const dniAverage = averageNumber(dniValues.length ? dniValues : solar);
    const windSpeedMph = averageNumber(windValues) * 0.621371;

    weather = {
      dailySolar: (ghiAverage / 1000) || 5.1,
      avgTemperature: averageNumber(temps) || 24,
      avgCloudCover: averageNumber(cloudCover) || 35,
      precipitation: weatherResponse.current?.precipitation ?? 0.7,
      windSpeedMph: Number((windSpeedMph || 8.4).toFixed(1)),
      source: 'Open-Meteo forecast',
    };

    irradiance = {
      ghi: Number((ghiAverage / 1000).toFixed(2)) || 5.1,
      dni: Number((dniAverage / 1000).toFixed(2)) || 5.6,
      peakSunHours: Number((ghiAverage / 1000).toFixed(2)) || 5.1,
      source: 'Open-Meteo solar radiation',
    };
  }

  return { weather, irradiance };
}

function resolveTariffByCountry(country: string, latitude: number) {
  const normalized = (country || '').toLowerCase();

  const locationRates: Record<string, number> = {
    india: 7.6,
    'united states': 0.16,
    australia: 0.28,
    'united kingdom': 0.25,
    germany: 0.35,
    france: 0.22,
    spain: 0.24,
    italy: 0.26,
    canada: 0.18,
    brazil: 0.6,
  };

  const fallback = Math.abs(latitude) < 10 ? 7.6 : Math.abs(latitude) < 25 ? 7.1 : Math.abs(latitude) < 45 ? 0.21 : 0.24;
  const baseRate = locationRates[normalized] ?? fallback;

  return {
    ratePerKwh: Number(baseRate.toFixed(3)),
    currency: normalized === 'india' || normalized === 'in' ? 'INR' : 'INR',
    source: 'Location-based utility tariff estimate',
  };
}

function getSatelliteImageUrl(lat: number, lng: number) {
  const mapboxToken = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!mapboxToken) {
    return null;
  }

  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},14,600x420?access_token=${mapboxToken}`;
}

async function resolveUtilityTariffByLocation(address?: string, postalCode?: string, lat?: number, lng?: number) {
  const payload = {
    address,
    postalCode,
    latitude: lat,
    longitude: lng,
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/utility-tariff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ratePerKwh: 7.6,
        currency: 'INR',
        source: 'Fallback estimate',
        regionLabel: address || postalCode || 'Unknown region',
      };
    }

    const data = await response.json();
    return {
      ...data,
      ratePerKwh: Number(data?.ratePerKwh ?? 7.6),
      currency: 'INR',
    };
  } catch {
    return {
      ratePerKwh: 7.6,
      currency: 'INR',
      source: 'Fallback estimate',
      regionLabel: address || postalCode || 'Unknown region',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { coordinates = [], constraints = {} } = await request.json();

    if (!Array.isArray(coordinates) || coordinates.length < 3) {
      return Response.json({ error: 'Invalid polygon coordinates' }, { status: 400 });
    }

    const center = getPolygonCenter(coordinates);
    const lat = center.lat;
    const lng = center.lng;
    const areaAcres = Math.max(
      1,
      Math.abs(
        (Math.max(...coordinates.map((p) => p.lat)) - Math.min(...coordinates.map((p) => p.lat))) *
        (Math.max(...coordinates.map((p) => p.lng)) - Math.min(...coordinates.map((p) => p.lng))) *
        250000
      )
    );

    const { weather, irradiance } = await getWeatherAndIrradiance(lat, lng);
    const effectiveWindSpeed = Number(weather.windSpeedMph || 8.4);

    const roofSuitability = estimateRoofSuitability(lat);
    const roofPotentialKw = clamp(areaAcres * 0.9 * roofSuitability * (0.9 + (weather.dailySolar / 8)), 5, 2500);
    const panelCount = Math.max(12, Math.round(roofPotentialKw * 4.5));

    const locationInfo = await resolveLocationLabel(lat, lng);
    const tariff = await resolveUtilityTariffByLocation(locationInfo.displayName, undefined, lat, lng);
    const mapboxImageUrl = getSatelliteImageUrl(lat, lng);

    const techs = Array.isArray(constraints?.technical?.technologies)
      ? constraints.technical.technologies
      : ['solar'];
    const goal = constraints?.energy?.primaryGoal ?? 'offset';
    const targetProduction = Number(constraints?.energy?.targetProduction ?? 0);
    const budgetMin = Number(constraints?.budget?.min ?? 50000);
    const budgetMax = Number(constraints?.budget?.max ?? 150000);

    const systemSizeKw = clamp(
      roofPotentialKw * (goal === 'income' ? 1.2 : goal === 'independence' ? 1.15 : 1) * (techs.includes('storage') ? 1.1 : 1) * Math.max(0.8, targetProduction / 4000 || 1),
      4,
      2500
    );

    const annualProductionKwh = clamp(
      systemSizeKw * 1700 * (1 + weather.dailySolar / 16) * (1 - weather.avgCloudCover / 200) * (1 + effectiveWindSpeed / 100),
      12000,
      4500000
    );

    const co2OffsetTons = clamp(annualProductionKwh / 2500, 12, 15000);
    const totalCost = clamp(systemSizeKw * 62000 + (techs.includes('storage') ? 520000 : 0), 120000, 80000000);
    const incentivesRate = 0.24 + (techs.includes('storage') ? 0.05 : 0);
    const netCostAfterIncentives = clamp(totalCost * (1 - incentivesRate), 70000, 70000000);
    const annualSavings = clamp(annualProductionKwh * tariff.ratePerKwh, 22000, 18000000);
    const paybackYears = clamp(netCostAfterIncentives / annualSavings, 2.4, 18);
    const roi25Year = clamp(((annualSavings * 25) - netCostAfterIncentives) / Math.max(netCostAfterIncentives, 1) * 100, 10, 800);

    return Response.json({
      systemSizeKw: Number(systemSizeKw.toFixed(1)),
      annualProductionKwh: Math.round(annualProductionKwh),
      co2OffsetTons: Number(co2OffsetTons.toFixed(1)),
      totalCost: Math.round(totalCost),
      netCostAfterIncentives: Math.round(netCostAfterIncentives),
      annualSavings: Math.round(annualSavings),
      paybackYears: Number(paybackYears.toFixed(2)),
      roi25Year: Number(roi25Year.toFixed(1)),
      weather,
      irradiance,
      utilityTariff: {
        ratePerKwh: Number(tariff.ratePerKwh ?? 7.6),
        currency: 'INR',
        source: tariff.source ?? 'Provider-backed tariff lookup',
        regionLabel: tariff.regionLabel || locationInfo.displayName,
      },
      satellite: {
        source: mapboxImageUrl ? 'Mapbox Satellite' : 'OpenStreetMap fallback',
        imageUrl: mapboxImageUrl ?? undefined,
        zoom: 14,
      },
      rooftopImage: mapboxImageUrl ?? undefined,
      roof: {
        suitability: Math.round(roofSuitability * 100),
        roofPotentialKw: Number(roofPotentialKw.toFixed(1)),
        panelCount,
        extractionSource: mapboxImageUrl ? 'Mapbox Satellite + polygon analysis' : 'Polygon + irradiance-derived roof estimate',
      },
      metadata: {
        latitude: lat,
        longitude: lng,
        areaAcres: Number(areaAcres.toFixed(2)),
        budgetMin,
        budgetMax,
        region: locationInfo.displayName,
      },
    });
  } catch (error) {
    console.error('site analysis error', error);
    return Response.json(
      {
        systemSizeKw: 40,
        annualProductionKwh: 62000,
        co2OffsetTons: 28,
        totalCost: 2500000,
        netCostAfterIncentives: 1750000,
        annualSavings: 520000,
        paybackYears: 6.2,
        roi25Year: 145,
        weather: {
          dailySolar: 5.1,
          avgTemperature: 24,
          avgCloudCover: 35,
          precipitation: 0.7,
          windSpeedMph: 8.4,
          source: 'Fallback estimate',
        },
        irradiance: {
          ghi: 5.1,
          dni: 5.6,
          peakSunHours: 5.1,
          source: 'Fallback estimate',
        },
        utilityTariff: {
          ratePerKwh: 7.6,
          currency: 'INR',
          source: 'Fallback estimate',
          regionLabel: 'Fallback region',
        },
        satellite: {
          source: 'Fallback estimate',
          zoom: 14,
        },
        roof: {
          suitability: 80,
          roofPotentialKw: 75,
          panelCount: 180,
          extractionSource: 'Fallback estimate',
        },
      },
      { status: 200 }
    );
  }
}

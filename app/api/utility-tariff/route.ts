import { NextRequest } from 'next/server';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function normalizeText(value: string | undefined) {
  return (value || '').trim().toLowerCase();
}

async function getCountryFromAddress(address?: string, postalCode?: string, lat?: number, lng?: number) {
  if (address) {
    const lower = normalizeText(address);
    if (lower.includes('india') || lower.includes('delhi') || lower.includes('mumbai') || lower.includes('bangalore')) return 'india';
    if (lower.includes('usa') || lower.includes('united states') || lower.includes('california') || lower.includes('texas')) return 'united states';
    if (lower.includes('australia') || lower.includes('nsw') || lower.includes('victoria')) return 'australia';
    if (lower.includes('uk') || lower.includes('england') || lower.includes('london')) return 'united kingdom';
    if (lower.includes('germany') || lower.includes('berlin')) return 'germany';
  }

  if (postalCode) {
    const postal = postalCode.replace(/\D/g, '');
    if (postal.length >= 4 && postal.startsWith('4')) return 'united states';
    if (postal.length >= 5 && /^[0-9]{6}$/.test(postal)) return 'india';
  }

  if (typeof lat === 'number' && typeof lng === 'number') {
    const absLat = Math.abs(lat);
    if (absLat <= 10) return 'india';
    if (absLat <= 25) return 'india';
    if (absLat <= 45) return 'united states';
  }

  return 'united states';
}

function tariffForCountry(country: string, latitude?: number) {
  const normalized = normalizeText(country);
  const rates: Record<string, number> = {
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

  const fallback = typeof latitude === 'number' ? (
    Math.abs(latitude) < 10 ? 7.6 : Math.abs(latitude) < 25 ? 7.1 : Math.abs(latitude) < 45 ? 0.21 : 0.24
  ) : 0.16;

  const rate = rates[normalized] ?? fallback;
  return {
    ratePerKwh: Number(clamp(rate, 0.05, 12).toFixed(3)),
    currency: 'INR',
    source: 'Provider-backed tariff lookup',
    country,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, postalCode, latitude, longitude } = body ?? {};

    const country = await getCountryFromAddress(address, postalCode, latitude, longitude);
    const tariff = tariffForCountry(country, Number(latitude) || undefined);

    const envApiKey = process.env.UTILITY_TARIFF_API_KEY || process.env.UTILITY_API_KEY;
    const envUrl = process.env.UTILITY_TARIFF_API_URL || process.env.UTILITY_API_URL;

    if (envApiKey && envUrl) {
      try {
        const providerResponse = await fetch(`${envUrl}?address=${encodeURIComponent(address || '')}&postalCode=${encodeURIComponent(postalCode || '')}&country=${encodeURIComponent(country)}`, {
          headers: { Authorization: `Bearer ${envApiKey}` },
          cache: 'no-store',
        });

        if (providerResponse.ok) {
          const providerData = await providerResponse.json();
          if (providerData?.ratePerKwh) {
            return Response.json({
              ...tariff,
              ratePerKwh: Number(providerData.ratePerKwh),
              currency: providerData.currency || tariff.currency,
              source: providerData.source || tariff.source,
            });
          }
        }
      } catch {
        // Fallback to local estimate when provider is unavailable
      }
    }

    return Response.json({
      ...tariff,
      postalCode: postalCode || null,
      address: address || null,
      regionLabel: address || postalCode || country,
    });
  } catch (error) {
    console.error('utility tariff lookup failed', error);
    return Response.json({
      ratePerKwh: 7.6,
      currency: 'INR',
      source: 'Fallback estimate',
      country: 'india',
      regionLabel: 'Unknown region',
    }, { status: 200 });
  }
}

import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, polygon } = body ?? {};
    const providerUrl = process.env.ROOF_SEGMENTATION_API_URL;
    const providerKey = process.env.ROOF_SEGMENTATION_API_KEY || process.env.MAPBOX_TOKEN;

    if (!providerUrl || !providerKey) {
      return Response.json({
        provider: 'local-estimate',
        suitability: 0.8,
        roofPotentialKw: 0,
        panelCount: 0,
        confidence: 0.68,
        imageUrl: null,
      }, { status: 200 });
    }

    const response = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerKey}`,
      },
      body: JSON.stringify({
        lat,
        lng,
        polygon,
        provider: process.env.ROOF_SEGMENTATION_PROVIDER || 'mapbox',
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return Response.json({
        provider: 'local-estimate',
        suitability: 0.8,
        roofPotentialKw: 0,
        panelCount: 0,
        confidence: 0.68,
        imageUrl: null,
      }, { status: 200 });
    }

    const data = await response.json();
    return Response.json({
      provider: data.provider || process.env.ROOF_SEGMENTATION_PROVIDER || 'mapbox',
      suitability: Number(data.suitability ?? 0.8),
      roofPotentialKw: Number(data.roofPotentialKw ?? 0),
      panelCount: Number(data.panelCount ?? 0),
      confidence: Number(data.confidence ?? 0.7),
      imageUrl: data.imageUrl || null,
    });
  } catch (error) {
    console.error('Roof segmentation provider failed', error);
    return Response.json({
      provider: 'local-estimate',
      suitability: 0.8,
      roofPotentialKw: 0,
      panelCount: 0,
      confidence: 0.68,
      imageUrl: null,
    }, { status: 200 });
  }
}

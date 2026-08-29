import { placementZones } from '@/lib/placements';

export async function POST() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('{"zones":['));
      
      for (let i = 0; i < placementZones.length; i++) {
        const zone = placementZones[i];
        const zoneJson = JSON.stringify(zone);
        
        if (i > 0) {
          controller.enqueue(encoder.encode(','));
        }
        controller.enqueue(encoder.encode(zoneJson));
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      controller.enqueue(encoder.encode(']}'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

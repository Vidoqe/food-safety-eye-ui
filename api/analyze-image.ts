// /api/analyze-image.ts
export const config = { runtime: 'edge' }; // Use Edge runtime (pure ESM, no CommonJS)

export default async function handler(req: Request): Promise<Response> {
  // Only POST for our tests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    // Safely read JSON body
    const body = await req.json().catch(() => ({} as any));

    return new Response(
      JSON.stringify({
        ok: true,
        echo: body, // just echo back so we know the route works
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

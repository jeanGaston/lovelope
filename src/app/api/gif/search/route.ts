import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ data: [] });

  const key = process.env.GIPHY_API_KEY;
  if (!key) return NextResponse.json({ error: 'Giphy not configured' }, { status: 503 });

  const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&limit=12&rating=g&lang=en`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return NextResponse.json({ error: 'Giphy API error' }, { status: 502 });

  const json = await res.json() as { data: Record<string, unknown>[] };
  const data = (json.data ?? []).map((g) => {
    const images = g.images as Record<string, { url: string }>;
    return {
      id: g.id,
      title: g.title,
      url: images.original.url,
      preview: (images.fixed_width_small ?? images.fixed_width).url,
    };
  });

  return NextResponse.json({ data });
}

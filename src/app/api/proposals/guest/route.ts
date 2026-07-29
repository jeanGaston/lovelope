import { NextRequest, NextResponse } from 'next/server';
import { proposalBodySchema } from '@/lib/proposal-schema';
import { createProposal } from '@/lib/proposal-create';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const { allowed } = checkRateLimit(`guest-create:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = proposalBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const proposal = await createProposal(parsed.data, { publish: true });
  const baseUrl = process.env.APP_URL ?? 'http://localhost:3000';

  return NextResponse.json(
    {
      id: proposal.id,
      slug: proposal.slug,
      manageToken: proposal.manageToken,
      publicUrl: `${baseUrl}/p/${proposal.slug}`,
      manageUrl: `${baseUrl}/manage/${proposal.manageToken}`,
    },
    { status: 201 }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { cipherMax } from '@/lib/proposal-schema';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { slug },
    include: {
      activities: { include: { slots: true }, orderBy: { order: 'asc' } },
      response: { select: { answer: true, respondedAt: true } },
    },
  });

  if (!proposal || proposal.status === 'draft') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (proposal.expiresAt && proposal.expiresAt < new Date()) {
    await prisma.proposal.update({ where: { slug }, data: { status: 'expired' } });
    return NextResponse.json({ error: 'Expired' }, { status: 410 });
  }

  return NextResponse.json(proposal);
}

// answer & note arrive as AES-GCM ciphertext; the server can no longer
// validate 'yes'/'maybe'/'no' or sanitize the note text, since it can't
// read either. Only the ciphertext blob size is bounded here.
const responseSchema = z.object({
  answer: z.string().min(1).max(cipherMax(10)),
  selectedActivityId: z.string().optional(),
  selectedTimeSlotId: z.string().optional(),
  note: z.string().max(cipherMax(500)).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const { allowed } = checkRateLimit(`respond:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const proposal = await prisma.proposal.findUnique({ where: { slug } });

  if (!proposal || proposal.status === 'draft') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (proposal.status === 'answered') {
    return NextResponse.json({ error: 'Already answered' }, { status: 409 });
  }
  if (proposal.expiresAt && proposal.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Expired' }, { status: 410 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;

  const response = await prisma.response.create({
    data: {
      proposalId: proposal.id,
      answer: data.answer,
      selectedActivityId: data.selectedActivityId ?? null,
      selectedTimeSlotId: data.selectedTimeSlotId ?? null,
      note: data.note ?? null,
    },
    include: { selectedActivity: true },
  });

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: 'answered' },
  });

  return NextResponse.json(response, { status: 201 });
}

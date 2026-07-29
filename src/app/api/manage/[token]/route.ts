import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function findByToken(token: string) {
  return prisma.proposal.findUnique({
    where: { manageToken: token },
    include: {
      activities: { include: { slots: true }, orderBy: { order: 'asc' } },
      response: { include: { selectedActivity: true, selectedTimeSlot: true } },
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const proposal = await findByToken(token);
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(proposal);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const proposal = await findByToken(token);
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.proposal.delete({ where: { manageToken: token } });
  return NextResponse.json({ ok: true });
}

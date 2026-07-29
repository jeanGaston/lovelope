import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const proposal = await prisma.proposal.findUnique({ where: { manageToken: token } });
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (proposal.status !== 'draft') {
    return NextResponse.json({ error: 'Only drafts can be published' }, { status: 400 });
  }

  const updated = await prisma.proposal.update({
    where: { manageToken: token },
    data: { status: 'sent' },
  });
  return NextResponse.json(updated);
}

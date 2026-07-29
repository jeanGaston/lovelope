import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ManageClient from './ManageClient';

export const metadata: Metadata = { title: 'Manage proposal' };

export default async function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { manageToken: token },
    include: {
      activities: { include: { slots: true }, orderBy: { order: 'asc' } },
      response: { include: { selectedActivity: true, selectedTimeSlot: true } },
    },
  });

  if (!proposal) notFound();

  const baseUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const publicUrl = `${baseUrl}/p/${proposal.slug}`;
  const manageUrl = `${baseUrl}/manage/${token}`;

  return <ManageClient proposal={proposal} token={token} publicUrl={publicUrl} manageUrl={manageUrl} />;
}

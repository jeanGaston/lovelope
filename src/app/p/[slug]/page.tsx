import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProposalPageClient from './ProposalPageClient';

// Proposal content is end-to-end encrypted; the decryption key lives only in
// the URL fragment, which the server (and this metadata generator) never
// sees. Link previews stay generic on purpose so nothing personal leaks
// through a share-card crawler.
export const metadata: Metadata = {
  title: 'You have a message 💌',
  description: 'Someone has something to ask you on lovelope.app.',
};

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { slug },
    include: {
      activities: { include: { slots: true }, orderBy: { order: 'asc' } },
      response: { select: { answer: true } },
    },
  });

  if (!proposal || proposal.status === 'draft') notFound();

  const isExpired =
    proposal.status === 'expired' ||
    (proposal.expiresAt != null && proposal.expiresAt < new Date());

  const isAnswered = proposal.status === 'answered';

  return (
    <ProposalPageClient
      proposal={proposal}
      slug={slug}
      isExpired={isExpired}
      isAnswered={isAnswered}
      existingAnswer={proposal.response?.answer ?? null}
    />
  );
}

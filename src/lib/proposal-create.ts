import { nanoid } from 'nanoid';
import { prisma } from '@/lib/db';
import type { ProposalBody } from '@/lib/proposal-schema';

export async function createProposal(
  data: ProposalBody,
  options?: { publish?: boolean }
) {
  return prisma.proposal.create({
    data: {
      slug: nanoid(10),
      manageToken: nanoid(20),
      // senderName, recipientName, title, message, gifUrl, and every activity/slot
      // field below arrive already end-to-end encrypted by the client; the server
      // stores the ciphertext as-is and never sanitizes or reads its content.
      senderName: data.senderName,
      recipientName: data.recipientName,
      title: data.title,
      message: data.message,
      theme: data.theme,
      gradientFrom: data.gradientFrom ?? null,
      gradientVia: data.gradientVia ?? null,
      gradientTo: data.gradientTo ?? null,
      gifUrl: data.gifUrl ?? null,
      evasiveNo: data.evasiveNo ?? false,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      status: options?.publish ? 'sent' : 'draft',
      activities: {
        create: data.activities.map((a, i) => ({
          title: a.title,
          description: a.description ?? null,
          emoji: a.emoji ?? '🎉',
          order: i,
          slots: a.slots?.length
            ? {
                create: a.slots.map((s) => ({
                  label: s.label,
                  startsAt: s.startsAt ?? null,
                })),
              }
            : undefined,
        })),
      },
    },
    include: {
      activities: { include: { slots: true }, orderBy: { order: 'asc' } },
    },
  });
}

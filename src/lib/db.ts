import { PrismaClient } from '@prisma/client';

const g = globalThis as unknown as {
  prisma: PrismaClient;
  _cleanupScheduled: boolean;
};

export const prisma =
  g.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') g.prisma = prisma;

// Auto-delete proposals older than 30 days (runs once per process, every hour)
if (!g._cleanupScheduled) {
  g._cleanupScheduled = true;
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  const purgeOldProposals = async () => {
    try {
      const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);
      const { count } = await prisma.proposal.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      if (count > 0) console.log(`[cleanup] Deleted ${count} proposal(s) older than 30 days`);
    } catch (err) {
      console.error('[cleanup] Error purging old proposals:', err);
    }
  };

  purgeOldProposals();
  setInterval(purgeOldProposals, 60 * 60 * 1000);
}

import { z } from 'zod';

// senderName, recipientName, title, message, gifUrl, activity title/description,
// and slot label/startsAt arrive as AES-GCM ciphertext (IV + auth tag + data,
// base64url-encoded), the server never sees the plaintext, so it can only
// bound the size of the blob, not validate its real content.
export function cipherMax(plainMax: number): number {
  return Math.ceil((plainMax + 28) * 4 / 3) + 16;
}

const cipherText = (plainMax: number) => z.string().min(1).max(cipherMax(plainMax));
const cipherTextOptional = (plainMax: number) => z.string().max(cipherMax(plainMax)).optional();

export const slotSchema = z.object({
  label: cipherText(100),
  startsAt: cipherTextOptional(40),
});

export const activitySchema = z.object({
  title: cipherText(100),
  description: cipherTextOptional(300),
  location: cipherTextOptional(200),
  emoji: z.string().max(8).optional(),
  slots: z.array(slotSchema).optional(),
});

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/).optional();

export const proposalBodySchema = z.object({
  senderName: cipherText(60),
  recipientName: cipherText(60),
  title: cipherText(120),
  message: cipherText(2000),
  theme: z.enum(['sunset', 'neon', 'pastel', 'cherry', 'ocean', 'midnight']).default('sunset'),
  gradientFrom: hexColor,
  gradientVia: hexColor,
  gradientTo: hexColor,
  gifUrl: cipherTextOptional(500),
  evasiveNo: z.boolean().optional().default(false),
  expiresAt: z.string().datetime().optional(),
  activities: z.array(activitySchema).min(1).max(5),
});

export type ProposalBody = z.infer<typeof proposalBodySchema>;

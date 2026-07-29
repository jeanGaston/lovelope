import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  const proposal = await prisma.proposal.create({
    data: {
      slug: nanoid(10),
      manageToken: nanoid(20),
      senderName: 'Jordan',
      recipientName: 'Alex',
      title: 'Want to go on an adventure with me?',
      message: "Hey Alex! I've been thinking... life's too short not to do something spontaneous. I'd love to take you out, pick something below and let's make it happen!",
      theme: 'sunset',
      status: 'sent',
      activities: {
        create: [
          {
            title: 'Rooftop Dinner',
            description: 'A candlelit dinner with the city skyline as our backdrop.',
            emoji: '🍷',
            order: 0,
            slots: { create: [{ label: 'Saturday 7pm' }, { label: 'Sunday 7pm' }] },
          },
          {
            title: 'Beach Sunset Walk',
            description: 'Sand between our toes, waves crashing, and the perfect golden hour.',
            emoji: '🌅',
            order: 1,
            slots: { create: [{ label: 'Saturday afternoon' }] },
          },
          {
            title: 'Art Museum + Brunch',
            description: 'Coffee, pastries, and pretending we understand modern art.',
            emoji: '🎨',
            order: 2,
          },
        ],
      },
    },
  });

  console.log(`Seeded demo proposal: /p/${proposal.slug}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

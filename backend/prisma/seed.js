import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // First, find or create a user
    let user = await prisma.user.findFirst();
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          firstName: 'Test',
          lastName: 'User'
        }
      });
    }

    // Add sample rehabilitation plans
    const exercises = [
      { name: 'Shoulder Press', progress: 75, painLevel: 2 },
      { name: 'Knee Extension', progress: 85, painLevel: 1 },
      { name: 'Back Stretch', progress: 90, painLevel: 0 },
      { name: 'Hip Flexor', progress: 70, painLevel: 3 },
      { name: 'Ankle Mobility', progress: 95, painLevel: 1 }
    ];

    // Clear existing data
    await prisma.rehabilitationPlan.deleteMany({
      where: { userId: user.id }
    });

    // Add new exercises
    for (const exercise of exercises) {
      await prisma.rehabilitationPlan.create({
        data: {
          userId: user.id,
          exercise: exercise.name,
          progress: exercise.progress,
          painLevel: exercise.painLevel,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
        }
      });
    }

    console.log('Added sample rehabilitation data for user:', user.id);
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
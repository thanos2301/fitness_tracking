import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetDb() {
  try {
    // Clear existing data
    await prisma.rehabilitationPlan.deleteMany();
    
    // Get the first user (or create one if none exists)
    let user = await prisma.user.findFirst();
    if (!user) {
      throw new Error('No user found in database');
    }

    // Add sample data
    const exercises = [
      { name: 'Shoulder Press', progress: 75, painLevel: 2 },
      { name: 'Knee Extension', progress: 85, painLevel: 1 },
      { name: 'Back Stretch', progress: 90, painLevel: 0 },
      { name: 'Hip Flexor', progress: 70, painLevel: 3 },
      { name: 'Ankle Mobility', progress: 95, painLevel: 1 }
    ];

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

    console.log('Database reset and seeded successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDb(); 
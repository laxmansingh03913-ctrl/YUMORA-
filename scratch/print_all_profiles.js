const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const profiles = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true
      }
    });

    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach(p => {
      console.log(`ID: ${p.id}`);
      console.log(`Name: ${p.name}`);
      console.log(`Username: ${p.username}`);
      console.log(`Email: ${p.email}`);
      console.log('----------------------------------------------------');
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

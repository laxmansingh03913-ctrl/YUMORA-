const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const novels = await prisma.novel.findMany({
      include: {
        _count: {
          select: { chapters: true }
        }
      }
    });

    console.log(`Found ${novels.length} novels:`);
    novels.forEach(n => {
      console.log(`ID: ${n.id}`);
      console.log(`Title: ${n.title}`);
      console.log(`Slug: ${n.slug}`);
      console.log(`Creator ID: ${n.creatorId}`);
      console.log(`Chapters Count: ${n._count.chapters}`);
      console.log('----------------------------------------------------');
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

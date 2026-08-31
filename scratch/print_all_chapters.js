const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const chapters = await prisma.chapter.findMany({
      include: {
        novel: {
          select: { title: true, slug: true }
        }
      },
      orderBy: { chapterNumber: 'asc' }
    });

    console.log(`Found ${chapters.length} chapters:`);
    chapters.forEach(ch => {
      console.log(`Novel: ${ch.novel?.title} (Slug: ${ch.novel?.slug})`);
      console.log(`Ch #${ch.chapterNumber}: "${ch.title}"`);
      console.log(`Content (first 100 chars): ${ch.content.slice(0, 100)}`);
      console.log('----------------------------------------------------');
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

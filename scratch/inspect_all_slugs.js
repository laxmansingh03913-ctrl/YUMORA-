const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectAllIceQueenNovels() {
  console.log("=== ALL NOVELS WITH 'ICE QUEEN' OR SIMILAR IN DB ===");
  const novels = await prisma.novel.findMany({
    include: {
      chapters: {
        orderBy: { chapterNumber: 'asc' }
      }
    }
  });

  novels.forEach(n => {
    console.log(`\nNOVEL ID: "${n.id}"`);
    console.log(`TITLE: "${n.title}"`);
    console.log(`SLUG: "${n.slug}"`);
    console.log(`Chapters Count in DB (${n.chapters.length}):`);
    n.chapters.forEach(c => {
      console.log(`  - Ch #${c.chapterNumber} (ID: ${c.id}): "${c.title}" | Words: ${c.wordCount}`);
    });
  });

  await prisma.$disconnect();
}

inspectAllIceQueenNovels();

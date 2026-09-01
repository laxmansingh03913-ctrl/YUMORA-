const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFinal() {
  const novels = await prisma.novel.findMany({
    include: { chapters: { orderBy: { chapterNumber: 'asc' } } }
  });

  console.log("=== CURRENT NOVELS IN DB ===");
  novels.forEach(n => {
    console.log(`- "${n.title}" (Slug: ${n.slug}) → ${n.chapters.length} Chapters`);
    n.chapters.forEach(c => {
      console.log(`    Ch #${c.chapterNumber}: "${c.title}" (${c.wordCount} words)`);
    });
  });

  await prisma.$disconnect();
}

checkFinal();

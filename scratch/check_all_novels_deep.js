const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllNovelsAndChapters() {
  console.log("=== CHECKING ALL NOVELS AND THEIR CHAPTERS ===");
  const novels = await prisma.novel.findMany({
    include: {
      chapters: {
        orderBy: { chapterNumber: 'asc' }
      }
    }
  });

  novels.forEach(n => {
    console.log(`Novel: "${n.title}" (ID: ${n.id}, Slug: ${n.slug})`);
    console.log(`  Chapters count: ${n.chapters.length}`);
    n.chapters.forEach(c => {
      console.log(`    - Ch #${c.chapterNumber}: "${c.title}" | Words: ${c.wordCount}`);
    });
  });

  await prisma.$disconnect();
}

checkAllNovelsAndChapters();

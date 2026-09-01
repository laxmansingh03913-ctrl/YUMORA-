const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestChapters() {
  console.log("=== CHECKING LATEST CHAPTERS IN DATABASE ===");
  const chapters = await prisma.chapter.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { novel: { select: { id: true, title: true, slug: true } } }
  });

  console.log(`Latest ${chapters.length} chapters:`);
  chapters.forEach(ch => {
    console.log(`- Novel: "${ch.novel?.title}" (ID: ${ch.novelId}) | Ch #${ch.chapterNumber}: "${ch.title}" | Words: ${ch.wordCount} | CreatedAt: ${ch.createdAt}`);
  });

  await prisma.$disconnect();
}

checkLatestChapters();

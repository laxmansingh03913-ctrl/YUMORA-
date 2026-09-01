const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTwoNovels() {
  const n1 = await prisma.novel.findFirst({
    where: { slug: 'the-ice-queens-secret-otaku-protocol' },
    include: { chapters: true }
  });

  const n2 = await prisma.novel.findFirst({
    where: { slug: 'light-novel-visual-guide-the-ice-queens-secret-otaku-protocol' },
    include: { chapters: true }
  });

  console.log("Novel 1 (the-ice-queens-secret-otaku-protocol):");
  console.log("  Chapters:", n1?.chapters.map(c => `Ch ${c.chapterNumber} (${c.wordCount} words)`));

  console.log("\nNovel 2 (light-novel-visual-guide-the-ice-queens-secret-otaku-protocol):");
  console.log("  Chapters:", n2?.chapters.map(c => `Ch ${c.chapterNumber} (${c.wordCount} words)`));

  await prisma.$disconnect();
}

checkTwoNovels();

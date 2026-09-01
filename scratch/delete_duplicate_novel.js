const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteDuplicateNovel() {
  console.log("Cleaning up duplicate novel 'light-novel-visual-guide-the-ice-queens-secret-otaku-protocol'...");

  const target = await prisma.novel.findFirst({
    where: { slug: 'light-novel-visual-guide-the-ice-queens-secret-otaku-protocol' }
  });

  if (target) {
    await prisma.chapter.deleteMany({ where: { novelId: target.id } });
    await prisma.novel.delete({ where: { id: target.id } });
    console.log("✓ Successfully removed duplicate novel:", target.title, "(ID:", target.id, ")");
  } else {
    console.log("Duplicate novel already not found.");
  }

  await prisma.$disconnect();
}

deleteDuplicateNovel();

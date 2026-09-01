const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPrisma() {
  const n = await prisma.novel.findFirst({
    where: { slug: 'the-ice-queens-secret-otaku-protocol' },
    include: { chapters: { orderBy: { chapterNumber: 'asc' } } }
  });
  console.log('Prisma check:');
  console.log('Novel:', n?.title);
  console.log('Chapters count in DB:', n?.chapters.length);
  n?.chapters.forEach(c => {
    console.log(`  - Ch #${c.chapterNumber}: "${c.title}"`);
  });
  await prisma.$disconnect();
}

testPrisma();

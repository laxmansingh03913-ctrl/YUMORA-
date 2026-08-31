const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const novel = await prisma.novel.findFirst({
    where: { title: { contains: 'Ice Queen' } },
    include: { chapters: { orderBy: { chapterNumber: 'asc' } } }
  });

  console.log('Ice Queen Chapters:');
  novel.chapters.forEach(ch => {
    console.log(`Ch #${ch.chapterNumber}: "${ch.title}" | Words: ${ch.wordCount} | Length: ${ch.content?.length} chars`);
  });

  await prisma.$disconnect();
}

run();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncComics() {
  const comics = await prisma.comic.findMany({
    include: { _count: { select: { episodes: true } } }
  });

  for (const c of comics) {
    const actualCount = c._count.episodes;
    await prisma.comic.update({
      where: { id: c.id },
      data: { episodes_count: actualCount }
    });
    console.log(`✓ Comic "${c.title}" episodes_count synced to ${actualCount}`);
  }

  await prisma.$disconnect();
}

syncComics();

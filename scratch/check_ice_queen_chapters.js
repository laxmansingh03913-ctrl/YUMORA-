const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const novel = await prisma.novel.findFirst({
      where: {
        OR: [
          { slug: 'the-ice-queens-secret-otaku-protocol' },
          { title: { contains: 'Ice Queen' } }
        ]
      },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' }
        }
      }
    });

    console.log('Novel:', novel?.title);
    console.log('Slug:', novel?.slug);
    console.log('ID:', novel?.id);
    console.log('Chapters in DB:');
    novel?.chapters.forEach(ch => {
      console.log(`- Chapter #${ch.chapterNumber}: "${ch.title}" (ID: ${ch.id})`);
      console.log(`  Content length: ${ch.content?.length} chars`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

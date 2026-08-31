const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    // Print full content of Ice Queen chapter
    const chapter = await prisma.chapter.findFirst({
      where: {
        novel: {
          slug: 'the-ice-queens-secret-otaku-protocol-how-my-peaceful-high-school-life-got-terminated'
        },
        chapterNumber: 1
      }
    });

    if (!chapter) {
      console.log('Chapter not found');
      return;
    }
    
    console.log('Chapter ID:', chapter.id);
    console.log('Chapter Title:', chapter.title);
    console.log('Chapter Number:', chapter.chapterNumber);
    console.log('Word Count:', chapter.wordCount);
    console.log('Full Content:');
    console.log(chapter.content);
    console.log('\nContent length:', chapter.content.length, 'chars');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: '63682d6e-6f76-456c-ad31-373838313935'
      }
    });

    console.log('Title:', chapter?.title);
    console.log('Chapter Number:', chapter?.chapterNumber);
    console.log('Length:', chapter?.content?.length);
    console.log('First 1500 chars:\n', chapter?.content?.slice(0, 1500));
    console.log('------------------');
    
    // Check if it contains chapter headings like "Chapter 1", "Chapter 2", "Chapter 3", "Prologue", etc.
    const matches = chapter?.content?.match(/(Chapter\s+\d+|Prologue|Episode\s+\d+|ACT\s+\d+)/gi);
    console.log('Detected Chapter Headings:', matches);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

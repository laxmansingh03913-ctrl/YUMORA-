const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    // Check actual chapter counts vs chaptersCount field in novels table
    const novels = await prisma.novel.findMany({
      include: {
        _count: { select: { chapters: true } }
      }
    });

    console.log('Novel vs DB Chapter Count:');
    novels.forEach(n => {
      console.log(`"${n.title.slice(0,40)}"`);
      console.log(`  chaptersCount field: ${n.chaptersCount}`);
      console.log(`  Actual chapters in DB: ${n._count.chapters}`);
      console.log('');
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

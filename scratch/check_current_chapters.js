const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const novels = await prisma.novel.findMany({
      include: {
        chapters: {
          select: { id: true, chapterNumber: true, title: true, createdAt: true }
        }
      }
    });

    console.log(`=== NOVELS & CHAPTERS IN DB ===`);
    novels.forEach(n => {
      console.log(`Novel: "${n.title}" (ID: ${n.id}, Slug: ${n.slug})`);
      console.log(`  chapters_count column: ${n.chapters_count}`);
      console.log(`  Actual chapters count in DB: ${n.chapters.length}`);
      n.chapters.forEach(ch => {
        console.log(`    - Ch #${ch.chapterNumber}: "${ch.title}" (ID: ${ch.id}) [Created: ${ch.createdAt}]`);
      });
      console.log('----------------------------------------------------');
    });

    const allChapters = await prisma.chapter.findMany({
      select: { id: true, novelId: true, chapterNumber: true, title: true, createdAt: true }
    });
    console.log(`Total chapters in entire DB: ${allChapters.length}`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

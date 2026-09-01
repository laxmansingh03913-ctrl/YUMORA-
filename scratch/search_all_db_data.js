const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchEverything() {
  console.log("=== SEARCHING ENTIRE DATABASE FOR ANY SAVED CHAPTERS/EPISODES ===");

  // 1. Check all chapters in chapters table
  const chapters = await prisma.chapter.findMany({
    include: { novel: { select: { title: true, slug: true } } }
  });
  console.log(`Found ${chapters.length} chapters total in chapters table:`);
  chapters.forEach(ch => {
    console.log(`- Novel: "${ch.novel?.title}" | Ch #${ch.chapterNumber}: "${ch.title}" | ID: ${ch.id} | Words: ${ch.wordCount}`);
  });

  // 2. Check all comic episodes in comic_episodes table
  const episodes = await prisma.comicEpisode.findMany({
    include: { comic: { select: { title: true, slug: true } } }
  });
  console.log(`\nFound ${episodes.length} comic episodes total in comic_episodes table:`);
  episodes.forEach(ep => {
    console.log(`- Comic: "${ep.comic?.title}" | Ep #${ep.episodeNumber}: "${ep.title}" | ID: ${ep.id} | Pages: ${ep.imageUrls?.length}`);
  });

  // 3. Check community posts or comments just in case
  const comments = await prisma.comment.findMany({
    take: 10
  });
  console.log(`\nComments in DB: ${comments.length}`);

  await prisma.$disconnect();
}

searchEverything();

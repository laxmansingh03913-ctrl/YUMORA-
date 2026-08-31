const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAudit() {
  const issues = [];
  const warnings = [];
  const passes = [];

  console.log("=========================================");
  console.log("   YOMIKA FULL WEBSITE & DATABASE AUDIT   ");
  console.log("=========================================\n");

  // 1. Check Profiles & Users
  try {
    const userCount = await prisma.user.count();
    const usersWithoutWallet = await prisma.user.count({
      where: { wallet: null }
    });
    passes.push(`User Profiles: ${userCount} users found.`);
    if (usersWithoutWallet > 0) {
      warnings.push(`User Wallets: ${usersWithoutWallet} users do not have a CoinWallet record yet (created on first coin event).`);
    }
  } catch (e) {
    issues.push(`Users/Profiles Table Error: ${e.message}`);
  }

  // 2. Check Novels & Chapters
  try {
    const novels = await prisma.novel.findMany({
      include: {
        chapters: {
          select: { id: true, chapterNumber: true, title: true, content: true }
        }
      }
    });
    passes.push(`Novels: ${novels.length} total novels in database.`);

    for (const novel of novels) {
      // Check chapter count sync
      if (novel.chapters_count !== novel.chapters.length) {
        issues.push(`Novel "${novel.title}": chapters_count in DB (${novel.chapters_count}) does NOT match actual chapter count in DB (${novel.chapters.length}).`);
      }

      // Check chapter numbering sequence
      const chNums = novel.chapters.map(c => c.chapterNumber).sort((a, b) => a - b);
      if (chNums.length > 0 && chNums[0] > 1) {
        warnings.push(`Novel "${novel.title}": Chapters start at #${chNums[0]} instead of #1 (First chapter is Chapter ${chNums[0]}).`);
      }

      // Check empty chapters
      novel.chapters.forEach(ch => {
        if (!ch.content || ch.content.trim().length === 0) {
          issues.push(`Novel "${novel.title}" Ch #${ch.chapterNumber}: Content is completely blank/empty.`);
        }
      });
    }
  } catch (e) {
    issues.push(`Novels/Chapters Audit Error: ${e.message}`);
  }

  // 3. Check Comics & Episodes
  try {
    const comics = await prisma.comic.findMany({
      include: {
        episodes: {
          select: { id: true, episodeNumber: true, title: true, imageUrls: true }
        }
      }
    });
    passes.push(`Comics: ${comics.length} total comics in database.`);

    for (const comic of comics) {
      if (comic.episodes_count !== comic.episodes.length) {
        issues.push(`Comic "${comic.title}": episodes_count in DB (${comic.episodes_count}) does NOT match actual episode count (${comic.episodes.length}).`);
      }
    }
  } catch (e) {
    issues.push(`Comics/Episodes Audit Error: ${e.message}`);
  }

  // 4. Check Contests & Submissions
  try {
    const contests = await prisma.contest.findMany({
      include: {
        submissions: true
      }
    });
    passes.push(`Contests: ${contests.length} active/archived contests in database.`);
    
    for (const c of contests) {
      if (c.submissions.length > 0) {
        passes.push(`Contest "${c.title}": ${c.submissions.length} submissions registered.`);
      }
    }
  } catch (e) {
    issues.push(`Contests Audit Error: ${e.message}`);
  }

  // 5. Check Notifications & Reads
  try {
    const notificationCount = await prisma.notification.count();
    passes.push(`Notifications: ${notificationCount} notifications logged.`);
  } catch (e) {
    issues.push(`Notifications Table Error: ${e.message}`);
  }

  // 6. Check Coin Transactions
  try {
    const txCount = await prisma.coin_transactions.count();
    passes.push(`Coin Transactions: ${txCount} transactions logged.`);
  } catch (e) {
    issues.push(`Coin Transactions Table Error: ${e.message}`);
  }

  console.log("=== AUDIT SUMMARY ===");
  console.log(`✅ Passed Checks: ${passes.length}`);
  passes.forEach(p => console.log(`  ✓ ${p}`));

  console.log(`\n⚠️ Warnings: ${warnings.length}`);
  warnings.forEach(w => console.log(`  ! ${w}`));

  console.log(`\n❌ Issues / Discrepancies Found: ${issues.length}`);
  issues.forEach(i => console.log(`  x ${i}`));

  await prisma.$disconnect();
}

runAudit();

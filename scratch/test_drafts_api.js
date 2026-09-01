const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDrafts() {
  console.log("=== TESTING CREATOR DRAFTS DATABASE TABLE ===");

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found");
    return;
  }
  console.log("Testing with User:", user.name, "(ID:", user.id, ")");

  // 1. Create a draft
  const draft = await prisma.creatorDraft.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      title: "Test Cloud Draft Novel",
      chaptersData: {
        1: { title: "Chapter 1: Draft Awakening", content: "Sample draft content for Chapter 1" },
        2: { title: "Chapter 2: Draft Protocol", content: "Sample draft content for Chapter 2" }
      },
      lastSavedAt: new Date()
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId: user.id,
      title: "Test Cloud Draft Novel",
      format: "NOVEL",
      genre: "Fantasy",
      chaptersData: {
        1: { title: "Chapter 1: Draft Awakening", content: "Sample draft content for Chapter 1" },
        2: { title: "Chapter 2: Draft Protocol", content: "Sample draft content for Chapter 2" }
      },
      lastSavedAt: new Date()
    }
  });

  console.log("✓ Draft created/updated in DB:", draft.id, "| Title:", draft.title);
  console.log("  Chapters saved in JSONB:", Object.keys(draft.chaptersData));

  // 2. Fetch the draft
  const fetched = await prisma.creatorDraft.findFirst({
    where: { userId: user.id }
  });
  console.log("✓ Fetched draft from DB successfully:", fetched.title, "| Last saved:", fetched.lastSavedAt);

  // 3. Clean up test draft
  await prisma.creatorDraft.deleteMany({
    where: { id: '00000000-0000-0000-0000-000000000001' }
  });
  console.log("✓ Cleaned up test draft.");

  await prisma.$disconnect();
}

testDrafts();

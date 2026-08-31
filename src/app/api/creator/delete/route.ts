import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUuid } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, type, creatorId, penaltyCoins = 50 } = body;

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (id, type)" },
        { status: 400 }
      );
    }

    const validId = ensureUuid(id);
    let titleDeleted = "Content";

    if (type === "NOVEL") {
      // Find the novel first to get title & confirm existence
      const novel = await prisma.novel.findFirst({
        where: {
          OR: [{ id: validId }, { slug: id }],
        },
      });

      if (!novel) {
        return NextResponse.json(
          { success: false, error: "Novel not found" },
          { status: 404 }
        );
      }

      titleDeleted = novel.title;

      // Delete novel (cascades to chapters, bookmarks, reading progress, comments)
      await prisma.novel.delete({
        where: { id: novel.id },
      });
    } else if (type === "COMIC") {
      const comic = await prisma.comic.findFirst({
        where: {
          OR: [{ id: validId }, { slug: id }],
        },
      });

      if (!comic) {
        return NextResponse.json(
          { success: false, error: "Comic not found" },
          { status: 404 }
        );
      }

      titleDeleted = comic.title;

      await prisma.comic.delete({
        where: { id: comic.id },
      });
    } else if (type === "CHAPTER") {
      const chapter = await prisma.chapter.findUnique({
        where: { id: validId },
        include: { novel: { select: { id: true, title: true } } },
      });

      if (!chapter) {
        return NextResponse.json(
          { success: false, error: "Chapter not found" },
          { status: 404 }
        );
      }

      titleDeleted = `${chapter.novel?.title || "Story"} - Chapter ${chapter.chapterNumber}`;

      await prisma.chapter.delete({
        where: { id: validId },
      });

      // Update novel's chapter count
      if (chapter.novelId) {
        const remainingCount = await prisma.chapter.count({
          where: { novelId: chapter.novelId },
        });
        await prisma.novel.update({
          where: { id: chapter.novelId },
          data: { chapters_count: remainingCount },
        });
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid content type" },
        { status: 400 }
      );
    }

    // Apply Creator Penalty (Deduct coins from CoinWallet and log notification) if creatorId provided
    if (creatorId && penaltyCoins > 0) {
      const validCreatorId = ensureUuid(creatorId);
      try {
        const wallet = await prisma.coinWallet.findUnique({
          where: { userId: validCreatorId },
        });

        if (wallet) {
          const currentBalance = wallet.balance || 0;
          const newBalance = Math.max(0, currentBalance - penaltyCoins);

          await prisma.coinWallet.update({
            where: { userId: validCreatorId },
            data: { balance: newBalance },
          });

          // Record coin transaction
          await prisma.coin_transactions.create({
            data: {
              user_id: validCreatorId,
              amount: -penaltyCoins,
              type: "PENALTY",
              description: `Penalty for deleting "${titleDeleted}"`,
            },
          });
        }

        // Create notification for creator
        await prisma.notification.create({
          data: {
            userId: validCreatorId,
            title: "Content Permanently Deleted",
            message: `"${titleDeleted}" was permanently erased from the Yomika database. A deletion penalty of ${penaltyCoins} coins was deducted.`,
            type: "SYSTEM",
            contentUrl: "/creator",
          },
        });
      } catch (penaltyErr) {
        console.warn("[CREATOR DELETION PENALTY ERROR]", penaltyErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `"${titleDeleted}" has been permanently deleted from Yomika database.`,
      penaltyApplied: penaltyCoins,
    });
  } catch (error: any) {
    console.error("[API CREATOR DELETE ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to permanently delete content" },
      { status: 500 }
    );
  }
}

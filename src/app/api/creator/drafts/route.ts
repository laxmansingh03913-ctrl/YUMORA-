import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized: User ID required" }, { status: 401 });
    }

    const draft = await prisma.creatorDraft.findFirst({
      where: { userId },
      orderBy: { lastSavedAt: "desc" },
    });

    if (!draft) {
      return NextResponse.json({ success: true, draft: null });
    }

    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        userId: draft.userId,
        seriesId: draft.seriesId,
        format: draft.format,
        title: draft.title,
        description: draft.description,
        coverUrl: draft.coverUrl,
        bannerUrl: draft.bannerUrl,
        genre: draft.genre,
        secondaryGenre: draft.secondaryGenre,
        tags: draft.tags,
        uploadMode: draft.uploadMode,
        currentStep: draft.currentStep,
        chaptersData: draft.chaptersData,
        lastSavedAt: draft.lastSavedAt,
      },
    });
  } catch (error: any) {
    console.error("[CREATOR DRAFT GET ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      seriesId,
      format,
      title,
      description,
      coverUrl,
      bannerUrl,
      genre,
      secondaryGenre,
      tags,
      uploadMode,
      currentStep,
      chaptersData,
    } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized: User ID required" }, { status: 401 });
    }

    // Upsert draft for user
    const existingDraft = await prisma.creatorDraft.findFirst({
      where: { userId },
    });

    let draft;
    if (existingDraft) {
      draft = await prisma.creatorDraft.update({
        where: { id: existingDraft.id },
        data: {
          seriesId: seriesId || null,
          format: format || "NOVEL",
          title: title || "",
          description: description || "",
          coverUrl: coverUrl || "",
          bannerUrl: bannerUrl || null,
          genre: genre || "Fantasy",
          secondaryGenre: secondaryGenre || null,
          tags: Array.isArray(tags) ? tags : [],
          uploadMode: uploadMode || "NEW_SERIES",
          currentStep: currentStep || 3,
          chaptersData: chaptersData || {},
          lastSavedAt: new Date(),
        },
      });
    } else {
      draft = await prisma.creatorDraft.create({
        data: {
          userId,
          seriesId: seriesId || null,
          format: format || "NOVEL",
          title: title || "",
          description: description || "",
          coverUrl: coverUrl || "",
          bannerUrl: bannerUrl || null,
          genre: genre || "Fantasy",
          secondaryGenre: secondaryGenre || null,
          tags: Array.isArray(tags) ? tags : [],
          uploadMode: uploadMode || "NEW_SERIES",
          currentStep: currentStep || 3,
          chaptersData: chaptersData || {},
          lastSavedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Draft saved directly to cloud database",
      draftId: draft.id,
      lastSavedAt: draft.lastSavedAt,
    });
  } catch (error: any) {
    console.error("[CREATOR DRAFT SAVE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized: User ID required" }, { status: 401 });
    }

    await prisma.creatorDraft.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true, message: "Draft cleared from database" });
  } catch (error: any) {
    console.error("[CREATOR DRAFT DELETE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

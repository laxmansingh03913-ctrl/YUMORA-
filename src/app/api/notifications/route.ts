import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to view notifications." },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
    });

    const formatted = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      contentId: n.contentId || undefined,
      contentType: n.contentType || undefined,
      contentUrl: n.contentUrl || undefined,
      creatorAvatar: n.creatorAvatar || undefined,
      creatorName: n.creatorName || undefined,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, notifications: formatted });
  } catch (error: any) {
    console.error("[GET /api/notifications ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error fetching notifications." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to modify notifications." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    if (id === "all") {
      await prisma.notification.updateMany({
        where: { userId: authUser.id },
        data: { isRead: true },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id, userId: authUser.id },
        data: { isRead: true },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Missing required notification ID." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Notifications successfully marked as read." });
  } catch (error: any) {
    console.error("[POST /api/notifications ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error updating notifications." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to delete notifications." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id === "all") {
      await prisma.notification.deleteMany({
        where: { userId: authUser.id },
      });
    } else if (id) {
      await prisma.notification.delete({
        where: { id, userId: authUser.id },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Missing required notification ID for deletion." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Notifications successfully deleted." });
  } catch (error: any) {
    console.error("[DELETE /api/notifications ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error deleting notifications." },
      { status: 500 }
    );
  }
}

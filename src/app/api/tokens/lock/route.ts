import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    siteId?: string;
    tokenKey?: string;
    value?: string;
    sessionId?: string;
  };

  if (!body.siteId || !body.tokenKey || body.value === undefined || !body.sessionId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.lockedToken.upsert({
    where: {
      siteId_tokenKey_sessionId: {
        siteId: body.siteId,
        tokenKey: body.tokenKey,
        sessionId: body.sessionId,
      },
    },
    create: {
      siteId: body.siteId,
      tokenKey: body.tokenKey,
      lockedValue: body.value,
      sessionId: body.sessionId,
    },
    update: {
      lockedValue: body.value,
    },
  });

  return NextResponse.json({ locked: true });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as {
    siteId?: string;
    tokenKey?: string;
    sessionId?: string;
  };

  if (!body.siteId || !body.tokenKey || !body.sessionId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.lockedToken.deleteMany({
    where: {
      siteId: body.siteId,
      tokenKey: body.tokenKey,
      sessionId: body.sessionId,
    },
  });

  return NextResponse.json({ locked: false });
}

import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

interface Params {
  params: { siteId: string };
}

function getValueAtPath(source: unknown, tokenKey: string): string {
  const [group, key] = tokenKey.split(".");
  if (!group || !key) return "";
  const groupValue = (source as Record<string, Record<string, unknown>>)[group];
  const value = groupValue?.[key];
  return value === undefined ? "" : String(value);
}

function setValueAtPath(target: Record<string, unknown>, tokenKey: string, value: string): Record<string, unknown> {
  const [group, key] = tokenKey.split(".");
  if (!group || !key) return target;

  const groupObj = (target[group] as Record<string, unknown>) ?? {};
  target[group] = {
    ...groupObj,
    [key]: value,
  };
  return target;
}

export async function GET(_: NextRequest, { params }: Params) {
  const token = await prisma.designToken.findUnique({
    where: { siteId: params.siteId },
  });

  const site = await prisma.scrapedSite.findUnique({
    where: { id: params.siteId },
    select: { url: true, extractionStatus: true },
  });

  if (!token) {
    return NextResponse.json({ error: "Token set not found" }, { status: 404 });
  }

  const locked = await prisma.lockedToken.findMany({
    where: { siteId: params.siteId },
    select: { tokenKey: true },
  });

  return NextResponse.json({
    siteId: params.siteId,
    url: site?.url ?? "",
    status: site?.extractionStatus ?? "unknown",
    tokens: {
      colors: token.colors,
      typography: token.typography,
      spacing: token.spacing,
      shadows: token.shadows,
      radii: token.radii,
    },
    lockedKeys: locked.map((entry: { tokenKey: string }) => entry.tokenKey),
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const body = (await request.json()) as {
    tokenKey?: string;
    value?: string;
    sessionId?: string;
  };

  if (!body.tokenKey || body.value === undefined || !body.sessionId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const lock = await prisma.lockedToken.findUnique({
    where: {
      siteId_tokenKey_sessionId: {
        siteId: params.siteId,
        tokenKey: body.tokenKey,
        sessionId: body.sessionId,
      },
    },
  });

  if (lock) {
    return NextResponse.json({ error: "Token is locked" }, { status: 409 });
  }

  const current = await prisma.designToken.findUnique({ where: { siteId: params.siteId } });
  if (!current) {
    return NextResponse.json({ error: "Token set not found" }, { status: 404 });
  }

  const tokenDoc: Record<string, unknown> = {
    colors: current.colors,
    typography: current.typography,
    spacing: current.spacing,
    shadows: current.shadows,
    radii: current.radii,
  };

  const valueBefore = getValueAtPath(tokenDoc, body.tokenKey);
  const nextDoc = setValueAtPath(structuredClone(tokenDoc), body.tokenKey, body.value);

  await prisma.versionHistory.create({
    data: {
      siteId: params.siteId,
      tokenKey: body.tokenKey,
      valueBefore,
      valueAfter: body.value,
      sessionId: body.sessionId,
    },
  });

  const updated = await prisma.designToken.update({
    where: { siteId: params.siteId },
    data: {
      colors: nextDoc.colors as Prisma.InputJsonObject,
      typography: nextDoc.typography as Prisma.InputJsonObject,
      spacing: nextDoc.spacing as Prisma.InputJsonObject,
      shadows: nextDoc.shadows as Prisma.InputJsonObject,
      radii: nextDoc.radii as Prisma.InputJsonObject,
    },
  });

  return NextResponse.json({
    tokenKey: body.tokenKey,
    value: body.value,
    tokens: {
      colors: updated.colors,
      typography: updated.typography,
      spacing: updated.spacing,
      shadows: updated.shadows,
      radii: updated.radii,
    },
  });
}

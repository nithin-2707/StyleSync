import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Params {
  params: { siteId: string };
}

export async function GET(_: Request, { params }: Params) {
  const history: Array<{
    tokenKey: string;
    valueBefore: string;
    valueAfter: string;
    changedAt: Date;
  }> = await prisma.versionHistory.findMany({
    where: { siteId: params.siteId },
    orderBy: { changedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    history: history.map((entry) => ({
      tokenKey: entry.tokenKey,
      valueBefore: entry.valueBefore,
      valueAfter: entry.valueAfter,
      timestamp: entry.changedAt.toISOString(),
    })),
  });
}

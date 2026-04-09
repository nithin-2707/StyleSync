import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Params {
  params: { siteId: string };
}

export async function GET(_: Request, { params }: Params) {
  const site = await prisma.scrapedSite.findUnique({
    where: { id: params.siteId },
    select: { extractionStatus: true, url: true },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json({
    siteId: params.siteId,
    status: site.extractionStatus,
    url: site.url,
  });
}

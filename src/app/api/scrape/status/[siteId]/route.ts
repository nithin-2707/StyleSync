import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

interface Params {
  params: { siteId: string };
}

export async function GET(_: Request, { params }: Params) {
  const { prisma } = await import("@/lib/db");

  const siteId = params?.siteId;
  if (!siteId || typeof siteId !== "string") {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  const site = await prisma.scrapedSite.findUnique({
    where: { id: siteId },
    select: { extractionStatus: true, url: true },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json({
    siteId,
    status: site.extractionStatus,
    url: site.url,
  });
}

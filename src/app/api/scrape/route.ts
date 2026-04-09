import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureScrapeWorker, getScrapeQueue } from "@/lib/queue/scrape-worker";
import { getDemoTokens, isDemoMode } from "@/lib/fixtures/demo-tokens";
import { scrapeWithPlaywright } from "@/lib/scraper/playwright";
import { scrapeWithCheerio } from "@/lib/scraper/cheerio-fallback";
import { extractPaletteFromImages } from "@/lib/color/vibrant";
import { normalizeTokens } from "@/lib/tokens/normalizer";
export const dynamic = "force-dynamic";

async function runInlineScrape(siteId: string, url: string, sessionId: string) {
  try {
    await prisma.scrapedSite.update({
      where: { id: siteId },
      data: { extractionStatus: "running" },
    });

    let raw;
    try {
      raw = await scrapeWithPlaywright(url);
    } catch {
      raw = await scrapeWithCheerio(url);
    }

    const locked = await prisma.lockedToken.findMany({ where: { siteId, sessionId } });
    const palette = await extractPaletteFromImages(raw.imageUrls);
    const tokens = normalizeTokens(raw, locked, palette);

    await prisma.designToken.upsert({
      where: { siteId },
      create: {
        siteId,
        colors: tokens.colors as unknown as Prisma.InputJsonObject,
        typography: tokens.typography as unknown as Prisma.InputJsonObject,
        spacing: tokens.spacing as unknown as Prisma.InputJsonObject,
        shadows: tokens.shadows as unknown as Prisma.InputJsonObject,
        radii: tokens.radii as unknown as Prisma.InputJsonObject,
      },
      update: {
        colors: tokens.colors as unknown as Prisma.InputJsonObject,
        typography: tokens.typography as unknown as Prisma.InputJsonObject,
        spacing: tokens.spacing as unknown as Prisma.InputJsonObject,
        shadows: tokens.shadows as unknown as Prisma.InputJsonObject,
        radii: tokens.radii as unknown as Prisma.InputJsonObject,
      },
    });

    await prisma.scrapedSite.update({
      where: { id: siteId },
      data: { extractionStatus: "done" },
    });
  } catch {
    await prisma.scrapedSite.update({
      where: { id: siteId },
      data: { extractionStatus: "failed" },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string; sessionId?: string };

    if (!body.url || !body.sessionId) {
      return NextResponse.json({ error: "Missing url or sessionId", errorCode: "INVALID_URL" }, { status: 400 });
    }

    try {
      new URL(body.url);
    } catch {
      return NextResponse.json({ error: "Invalid URL", errorCode: "INVALID_URL" }, { status: 400 });
    }

    const site = await prisma.scrapedSite.create({
      data: {
        url: body.url,
        sessionId: body.sessionId,
        extractionStatus: "pending",
      },
    });

    // Demo mode — instant, no scraping needed
    if (isDemoMode(body.url)) {
      const demo = getDemoTokens(body.url);
      if (demo) {
        await prisma.designToken.upsert({
          where: { siteId: site.id },
          create: {
            siteId: site.id,
            colors: demo.colors as unknown as Prisma.InputJsonObject,
            typography: demo.typography as unknown as Prisma.InputJsonObject,
            spacing: demo.spacing as unknown as Prisma.InputJsonObject,
            shadows: demo.shadows as unknown as Prisma.InputJsonObject,
            radii: demo.radii as unknown as Prisma.InputJsonObject,
          },
          update: {
            colors: demo.colors as unknown as Prisma.InputJsonObject,
            typography: demo.typography as unknown as Prisma.InputJsonObject,
            spacing: demo.spacing as unknown as Prisma.InputJsonObject,
            shadows: demo.shadows as unknown as Prisma.InputJsonObject,
            radii: demo.radii as unknown as Prisma.InputJsonObject,
          },
        });
        await prisma.scrapedSite.update({
          where: { id: site.id },
          data: { extractionStatus: "done" },
        });

        return NextResponse.json({ siteId: site.id, jobId: "demo", status: "done" });
      }
    }

    // Try Redis queue first
    try {
      ensureScrapeWorker();
      const queue = getScrapeQueue();
      if (queue) {
        const job = await queue.add("scrape", {
          siteId: site.id,
          url: body.url,
          sessionId: body.sessionId,
        });
        return NextResponse.json({ siteId: site.id, jobId: String(job.id), status: "queued" });
      }
    } catch {
      // Redis not available, fall through to inline scraping
    }

    // Inline scraping fallback (no Redis needed)
    // Run async without blocking — client will poll /api/scrape/status/[siteId]
    void runInlineScrape(site.id, body.url, body.sessionId);

    return NextResponse.json({ siteId: site.id, jobId: "inline", status: "pending" });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown scrape error",
        errorCode: "NAVIGATION_ERROR",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { ensureScrapeWorker, getScrapeQueue } from "@/lib/queue/scrape-worker";
import { getDemoTokens, isDemoMode } from "@/lib/fixtures/demo-tokens";
import { scrapeBestEffort } from "@/lib/scraper/best-effort";
import { extractPaletteFromImages } from "@/lib/color/vibrant";
import { normalizeTokens } from "@/lib/tokens/normalizer";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function shouldUseQueue(): boolean {
  // Queue mode needs a persistent worker process; keep it opt-in for serverless deployments.
  return process.env.ENABLE_REDIS_QUEUE === "true";
}

async function runInlineScrape(siteId: string, url: string, sessionId: string) {
  const { prisma } = await import("@/lib/db");

  try {
    await prisma.scrapedSite.update({
      where: { id: siteId },
      data: { extractionStatus: "running" },
    });

    const raw = await scrapeBestEffort(url);

    const locked = await prisma.lockedToken.findMany({ where: { siteId, sessionId } });
    let palette = null;
    try {
      palette = await extractPaletteFromImages(raw.imageUrls);
    } catch {
      palette = null;
    }
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

    return { ok: true as const };
  } catch {
    await prisma.scrapedSite.update({
      where: { id: siteId },
      data: { extractionStatus: "failed" },
    });

    return { ok: false as const };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import("@/lib/db");
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

    if (shouldUseQueue()) {
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
        // If queue mode is enabled but unavailable, continue with inline execution.
      }
    }

    // Execute inline and await completion to avoid serverless background-task drops.
    const result = await runInlineScrape(site.id, body.url, body.sessionId);
    return NextResponse.json({
      siteId: site.id,
      jobId: "inline",
      status: result.ok ? "done" : "failed",
    });
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

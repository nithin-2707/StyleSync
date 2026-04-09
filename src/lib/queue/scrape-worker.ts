import { Queue, Worker } from "bullmq";
import type { Prisma } from "@prisma/client";
import { scrapeBestEffort } from "@/lib/scraper/best-effort";
import { extractPaletteFromImages } from "@/lib/color/vibrant";
import { normalizeTokens } from "@/lib/tokens/normalizer";
import { getDemoTokens, isDemoMode } from "@/lib/fixtures/demo-tokens";

async function getPrismaClient() {
  const { prisma } = await import("@/lib/db");
  return prisma;
}

function hasValidRedisUrl(): boolean {
  const url = process.env.REDIS_URL;
  if (!url) {
    return false;
  }
  if (url.includes("host.upstash.io") || url.includes("your-token")) {
    return false;
  }
  return true;
}

function getConnection() {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not configured");
  }
  return { url };
}

let scrapeQueueInstance: Queue | null = null;

export function getScrapeQueue(): Queue | null {
  if (!hasValidRedisUrl()) {
    return null;
  }
  if (!scrapeQueueInstance) {
    scrapeQueueInstance = new Queue("scrape-queue", { connection: getConnection() });
  }
  return scrapeQueueInstance;
}

let workerStarted = false;

export function ensureScrapeWorker(): void {
  if (workerStarted || !hasValidRedisUrl()) {
    return;
  }

  workerStarted = true;

  new Worker(
    "scrape-queue",
    async (job) => {
      const prisma = await getPrismaClient();
      const { siteId, url, sessionId } = job.data as { siteId: string; url: string; sessionId: string };

      await prisma.scrapedSite.update({
        where: { id: siteId },
        data: { extractionStatus: "running" },
      });

      try {
        if (isDemoMode(url)) {
          const demo = getDemoTokens(url);
          if (demo) {
            await prisma.designToken.upsert({
              where: { siteId },
              create: {
                siteId,
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
            await prisma.scrapedSite.update({ where: { id: siteId }, data: { extractionStatus: "done" } });
            return;
          }
        }

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
      } catch (error) {
        await prisma.scrapedSite.update({
          where: { id: siteId },
          data: { extractionStatus: "failed" },
        });
        throw error;
      }
    },
    { connection: getConnection() },
  );
}

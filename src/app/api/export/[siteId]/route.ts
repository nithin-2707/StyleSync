import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tokensToCss, tokensToJson, tokensToTailwind } from "@/lib/tokens/exporter";
import type { DesignTokens } from "@/types/tokens";

interface Params {
  params: { siteId: string };
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function readString(record: Record<string, unknown>, key: string, fallback: string): string {
  const value = record[key];
  return typeof value === "string" ? value : fallback;
}

function readNumber(record: Record<string, unknown>, key: string, fallback: number): number {
  const value = record[key];
  return typeof value === "number" ? value : fallback;
}

export async function GET(request: NextRequest, { params }: Params) {
  const format = request.nextUrl.searchParams.get("format");

  const token = await prisma.designToken.findUnique({
    where: { siteId: params.siteId },
  });

  if (!token) {
    return NextResponse.json({ error: "Token set not found" }, { status: 404 });
  }

  const colors = toRecord(token.colors);
  const typography = toRecord(token.typography);
  const spacing = toRecord(token.spacing);
  const shadows = toRecord(token.shadows);
  const radii = toRecord(token.radii);

  const tokens: DesignTokens = {
    colors: {
      primary: readString(colors, "primary", "#934AC5"),
      secondary: readString(colors, "secondary", "#6B5F7A"),
      accent: readString(colors, "accent", "#E8A87C"),
      neutral: readString(colors, "neutral", "#D7CEE4"),
      background: readString(colors, "background", "#F0EDF5"),
      text: readString(colors, "text", "#1A1025"),
      surface: readString(colors, "surface", "#FFFFFF"),
      border: readString(colors, "border", "#CFC1E0"),
    },
    typography: {
      headingFont: readString(typography, "headingFont", "Inter"),
      bodyFont: readString(typography, "bodyFont", "Inter"),
      monoFont: readString(typography, "monoFont", "JetBrains Mono"),
      baseSize: readString(typography, "baseSize", "15px"),
      scale: Array.isArray(typography.scale)
        ? typography.scale.filter((v): v is string => typeof v === "string")
        : ["11px", "13px", "15px", "18px", "24px", "32px"],
      lineHeight: readNumber(typography, "lineHeight", 1.7),
      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    spacing: {
      unit: readNumber(spacing, "unit", 4),
      scale: Array.isArray(spacing.scale)
        ? spacing.scale.filter((v): v is number => typeof v === "number")
        : [0, 4, 8, 12, 16, 24, 32, 48, 64],
    },
    shadows: {
      sm: readString(shadows, "sm", "0 2px 8px rgba(26,16,37,0.08)"),
      md: readString(shadows, "md", "0 4px 24px rgba(26,16,37,0.12)"),
      lg: readString(shadows, "lg", "0 10px 40px rgba(26,16,37,0.16)"),
    },
    radii: {
      sm: readString(radii, "sm", "4px"),
      md: readString(radii, "md", "8px"),
      lg: readString(radii, "lg", "16px"),
      full: readString(radii, "full", "999px"),
    },
  };

  if (format === "css") {
    const content = tokensToCss(tokens);
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Content-Disposition": "attachment; filename='tokens.css'",
      },
    });
  }

  if (format === "json") {
    const content = tokensToJson(tokens);
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": "attachment; filename='tokens.json'",
      },
    });
  }

  if (format === "tailwind") {
    const content = tokensToTailwind(tokens);
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Content-Disposition": "attachment; filename='tailwind.config.js'",
      },
    });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}

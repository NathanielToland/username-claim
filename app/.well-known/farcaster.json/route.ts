import { NextResponse } from "next/server";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SUBTITLE,
  APP_TITLE,
  APP_URL,
  MINIAPP_HERO_URL,
  MINIAPP_ICON_URL,
  MINIAPP_SPLASH_URL,
  accountAssociation,
  hasAccountAssociation,
} from "@/lib/app-config";

export async function GET() {
  const manifest: Record<string, unknown> = {
    miniapp: {
      version: "1",
      name: APP_NAME,
      homeUrl: APP_URL,
      iconUrl: MINIAPP_ICON_URL,
      splashImageUrl: MINIAPP_SPLASH_URL,
      splashBackgroundColor: "#F8FBFF",
      subtitle: APP_SUBTITLE,
      description: APP_DESCRIPTION,
      primaryCategory: "utility",
      tags: ["identity", "handles", "registry", "base", "username"],
      heroImageUrl: MINIAPP_HERO_URL,
      tagline: "Claim your Base handle",
      ogTitle: APP_TITLE,
      ogDescription: APP_DESCRIPTION,
      ogImageUrl: MINIAPP_HERO_URL,
      noindex: false,
    },
  };

  if (hasAccountAssociation) {
    manifest.accountAssociation = accountAssociation;
  }

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}

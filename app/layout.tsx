import type { ReactNode } from "react";
import { BureauHeader } from "@/components/BureauHeader";
import { Providers } from "@/components/Providers";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TITLE,
  APP_URL,
  BASE_APP_ID,
  FC_MINIAPP_CONTENT,
  MINIAPP_HERO_URL,
  TALENT_VERIFICATION,
} from "@/lib/app-config";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="base:app_id" content={BASE_APP_ID} />
        <meta name="talentapp:project_verification" content={TALENT_VERIFICATION} />
        <meta name="application-name" content={APP_NAME} />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="fc:miniapp" content={FC_MINIAPP_CONTENT} />
        <meta property="og:title" content={APP_TITLE} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:image" content={MINIAPP_HERO_URL} />
        <meta property="og:url" content={APP_URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={APP_TITLE} />
        <meta name="twitter:description" content={APP_DESCRIPTION} />
        <meta name="twitter:image" content={MINIAPP_HERO_URL} />
        <link rel="canonical" href={APP_URL} />
        <title>{APP_NAME}</title>
      </head>
      <body>
        <Providers>
          <div className="app-shell">
            <BureauHeader />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

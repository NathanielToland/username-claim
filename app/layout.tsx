import type { ReactNode } from "react";
import { BureauHeader } from "@/components/BureauHeader";
import { Providers } from "@/components/Providers";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="base:app_id" content="69cc7ac997b57b22030486dd" />
        <meta
          name="talentapp:project_verification"
          content="e2ef86f3fc7e28a43ee3fe3d8da4d1ef076ebad7d292860d1a78c110959e56769b2dd08e6aaed1828ec24d95f4508e6a24a19d7f1de899e512022a110b70e968"
        />
        <meta name="application-name" content="username-claim" />
        <meta
          name="description"
          content="Claim a unique Base username through a bureau-style registry console."
        />
        <title>username-claim</title>
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

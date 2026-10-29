import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Icon } from "@/components/ui/Icon";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#FBF6EB",
};

export const metadata: Metadata = {
  title: "Gobbl Lab",
  description: "A prototype for people who feel they don't know much about politics. Nothing you do here is saved.",
  icons: { icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen font-body antialiased bg-bg text-ink">
        <div className="flex min-h-dvh flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center border-b border-line bg-surface px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-bg">
                <Icon name="feather" size={16} />
              </span>
              <span className="font-display text-lg font-bold tracking-[-0.03em]">Gobbl Lab</span>
              <span className="rounded-full bg-golden-100 px-2 py-0.5 font-body text-xs font-semibold text-golden-700">
                Prototype
              </span>
            </Link>
          </header>
          <main className="flex-1 px-4 py-8 lg:px-6 lg:py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}

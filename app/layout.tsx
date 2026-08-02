import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import BackgroundGlow from "@/components/BackgroundGlow";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://putiyuan.pages.dev"
  ),
  title: "善缘堂 · 为家人祈福求灵签",
  description:
    "心诚则灵。为家人点一盏祈福灯，求一支关帝灵签，看一卦命理八字。一念慈悲，福报自来。",
  applicationName: "善缘堂",
  authors: [{ name: "善缘堂" }],
  keywords: [
    "善缘堂", "祈福", "求签", "关帝灵签", "八字精批",
    "周公解梦", "求灵签", "看手相", "看面相", "命理", "起名",
  ],
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: "善缘堂 · 为家人祈福求灵签",
    description:
      "心诚则灵。为家人点一盏祈福灯，求一支关帝灵签，看一卦命理八字。一念慈悲，福报自来。",
    siteName: "善缘堂",
    images: [{ url: "/share-cover.svg", width: 1200, height: 630, alt: "善缘堂" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "善缘堂 · 为家人祈福求灵签",
    description:
      "心诚则灵。为家人点一盏祈福灯，求一支关帝灵签，看一卦命理八字。一念慈悲，福报自来。",
    images: ["/share-cover.svg"],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1a1410",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="善缘堂" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="x5-fullscreen" content="true" />
        <meta name="x5-page-mode" content="app" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap"
          as="style"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-xuan text-paper font-[var(--font-body)]">
        <BackgroundGlow />
        <Header />
        <main className="relative z-10 flex-1 pt-14 pb-24 md:pb-8">
          <div className="mx-auto max-w-6xl px-4">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

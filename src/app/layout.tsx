import type { Metadata } from "next";
import { Inter, Merriweather, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ReaderProvider } from "@/context/ReaderContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { RealtimeSyncProvider } from "@/lib/supabase/realtime";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-jp",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://youmika.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yomika — Stories. Comics. Worlds.",
    template: "%s | Yomika",
  },
  description:
    "Discover original novels, manga, webtoons, and comics from independent creators around the world. Yomika is the global home for original storytelling.",
  keywords: [
    "novels",
    "web novels",
    "manga",
    "serialized fiction",
    "comics",
    "webtoons",
    "creators",
    "indie publishing",
    "scifi",
    "fantasy",
    "yomika",
    "youmika",
  ],
  authors: [{ name: "Yomika Global", url: siteUrl }],
  creator: "Yomika",
  publisher: "Yomika",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Yomika — Stories. Comics. Worlds.",
    description: "Discover original novels, manga, webtoons, and comics from independent creators around the world.",
    siteName: "Yomika",
    url: siteUrl,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/hero-character.png",
        width: 1200,
        height: 630,
        alt: "Yomika — Stories. Comics. Worlds.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yomika — Stories. Comics. Worlds.",
    description: "Discover original novels, manga, webtoons, and comics from independent creators around the world.",
    images: ["/hero-character.png"],
    creator: "@yomika_official",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Yomika",
    url: siteUrl,
    description: "Discover original novels, manga, webtoons, and comics from independent creators around the world.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/discover?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansJP.variable} ${merriweather.variable} font-sans min-h-screen flex flex-col antialiased selection:bg-[#D91E18] selection:text-white bg-[#FAFAF7] text-[#111111]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <AuthProvider>
            <ReaderProvider>
              <SidebarProvider>
                <RealtimeSyncProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <div className="flex flex-1 min-h-[calc(100vh-64px)] w-full">
                      <Sidebar />
                      <div className="flex-1 min-w-0 flex flex-col">
                        <main className="flex-1 pb-16 md:pb-0">{children}</main>
                        <Footer />
                      </div>
                    </div>
                    <MobileNav />
                  </div>
                </RealtimeSyncProvider>
              </SidebarProvider>
            </ReaderProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

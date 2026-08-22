import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ReaderProvider } from "@/context/ReaderContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yomika.co.uk"),
  title: "Yomika — Stories. Comics. Worlds.",
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
  ],
  authors: [{ name: "Yomika Publishing", url: "https://yomika.co.uk" }],
  openGraph: {
    title: "Yomika — Stories. Comics. Worlds.",
    description: "Discover original novels, manga, webtoons, and comics from independent creators around the world.",
    siteName: "Yomika",
    url: "https://yomika.co.uk",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yomika — Stories. Comics. Worlds.",
    description: "Discover original novels, manga, webtoons, and comics from independent creators around the world.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} font-sans min-h-screen flex flex-col antialiased selection:bg-rose-500 selection:text-white`}>
        <ThemeProvider>
          <AuthProvider>
            <ReaderProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 pb-16 md:pb-0">{children}</main>
                <Footer />
                <MobileNav />
              </div>
            </ReaderProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

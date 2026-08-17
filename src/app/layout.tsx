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
  title: "Yumora — Global Novel & Comics Creator Platform",
  description:
    "Read original serialized novels, discover visionary independent creators, and explore webtoons from around the world. Stories worth getting lost in.",
  keywords: [
    "novels",
    "web novels",
    "serialized fiction",
    "comics",
    "webtoons",
    "creators",
    "indie publishing",
    "scifi",
    "fantasy",
  ],
  authors: [{ name: "Yumora Publishing" }],
  openGraph: {
    title: "Yumora — Stories Worth Getting Lost In",
    description: "The global home for independent storytelling.",
    siteName: "Yumora",
    type: "website",
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

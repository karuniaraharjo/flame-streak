import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlameStreak — Bangun Kebiasaan Harianmu",
  description:
    "Lacak konsistensi harianmu dengan visualisasi streak api yang memotivasi. Check-in setiap hari dan jaga apimu tetap menyala!",
  keywords: ["streak", "habit tracker", "kebiasaan", "daily check-in", "konsistensi"],
  openGraph: {
    title: "FlameStreak — Bangun Kebiasaan Harianmu",
    description: "Lacak konsistensi harianmu dengan visualisasi streak api yang memotivasi.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <QueryProvider>
            {children}
            <PWAInstallPrompt />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

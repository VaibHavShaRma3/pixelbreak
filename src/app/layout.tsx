import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PixelBreak — Browser Games",
    template: "%s | PixelBreak",
  },
  description:
    "Play 18 browser-based games across arcade, puzzle, creative, and chill categories. Compete on leaderboards and track your stats.",
  keywords: ["browser games", "online games", "arcade", "puzzle", "leaderboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

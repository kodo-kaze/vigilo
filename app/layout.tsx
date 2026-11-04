import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vigilo — Predictive AI Pedestrian Crowd Intelligence & Flow Management",
  description:
    "Designed for railway terminals, metro stations, airports, shopping malls, and mega events. Vigilo leverages existing CCTV infrastructure and computer vision to track density, forecast bottlenecks, and coordinate authorities with commuters in real time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className={`${geistSans.className} min-h-full flex flex-col bg-[#040508] text-gray-100 selection:bg-cyan-500/20 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

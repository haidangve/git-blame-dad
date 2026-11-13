import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--ff-pixel" });
const body = VT323({ weight: "400", subsets: ["latin"], variable: "--ff-body" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "git blame --dad",
  description: "Skills I was supposed to learn from my dad.",
  // The image itself comes from app/opengraph-image.tsx.
  openGraph: {
    title: "git blame --dad",
    description: "A pixel-art quest log of skills I was supposed to learn from my dad.",
    siteName: "git blame --dad",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0f1330", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pixel.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

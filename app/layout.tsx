import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--ff-pixel" });
const body = VT323({ weight: "400", subsets: ["latin"], variable: "--ff-body" });

export const metadata: Metadata = {
  title: "git blame --dad",
  description: "Skills I was supposed to learn from my dad.",
};

export const viewport: Viewport = { themeColor: "#0f1330", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pixel.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

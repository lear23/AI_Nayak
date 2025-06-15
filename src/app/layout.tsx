import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AI Nayak - Your Personal AI Assistant",
  description: "Personal AI assistant with Ollama integration. Smart chat, document analysis, and more.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      // SVG as primary icon (from public/)
      { url: "/ai_nayak.svg", type: "image/svg+xml" },
      
      // PNGs as fallback (optional)
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      // Use SVG or PNG for Apple (Safari may prefer PNG)
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
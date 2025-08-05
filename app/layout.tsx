import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapLetter - Personalized AI Newsletter",
  description: "Get your personalized AI-powered newsletter delivered to your inbox. Choose your interests and delivery frequency for a tailored news experience.",
  keywords: ["newsletter", "AI", "personalized", "news", "email", "subscription"],
  authors: [{ name: "SnapLetter Team" }],
  creator: "SnapLetter",
  publisher: "SnapLetter",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://snapletter.vercel.app'),
  openGraph: {
    title: "SnapLetter - Personalized AI Newsletter",
    description: "Get your personalized AI-powered newsletter delivered to your inbox. Choose your interests and delivery frequency for a tailored news experience.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapLetter - Personalized AI Newsletter",
    description: "Get your personalized AI-powered newsletter delivered to your inbox.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

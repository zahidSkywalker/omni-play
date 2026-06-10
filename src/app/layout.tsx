import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#6C84E8",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://my-project-zeta-taupe.vercel.app'),
  title: "Omni Play — Free Live TV & Radio",
  description: "Watch free live TV channels and listen to radio stations from around the world. Browse by country or category with a beautiful IPTV player.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: 'Omni Play — Free Live TV & Radio',
    description: 'Watch free live TV channels and listen to radio stations from around the world.',
    url: 'https://my-project-zeta-taupe.vercel.app',
    siteName: 'Omni Play',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Omni Play — Free Live TV & Radio',
    description: 'Watch free live TV channels and listen to radio stations from around the world.',
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Omni Play",
    "mobile-web-app-capable": "yes",
    "application-name": "Omni Play",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="bg-[#0f172a] text-white font-[family-name:var(--font-outfit)] antialiased overflow-hidden">
        <main className="h-full">{children}</main>
      </body>
    </html>
  );
}

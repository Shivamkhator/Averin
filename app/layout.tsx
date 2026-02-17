import type { Metadata } from "next";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";
import "./globals.css";
import { Inter, Manrope } from "next/font/google";
import InstallPrompt from "@/components/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Averin",
  icons: "/Averin.png",
  description: "Life Made Easier",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Averin",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#052b33",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="translucent" />
        <meta name="apple-mobile-web-app-title" content="Averin" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${manrope.variable} ${inter.variable} bg-background text-foreground transition-colors`}
        suppressHydrationWarning
      >
        <InstallPrompt />
        <Providers attribute="class" enableSystem defaultTheme="system">
          {children}
        </Providers>
        <Toaster
          position="top-center"
          swipeDirections={['left', 'right']}
          offset={{ top: 72 }}
          richColors
        />
      </body>
    </html>
  );
}
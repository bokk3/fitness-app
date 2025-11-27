import type { Metadata, Viewport } from "next";
import "./globals.css";

import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "FitTrack - Fitness Tracking App",
  description: "Track your workouts, nutrition, and progress with FitTrack",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitTrack",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#00ff00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

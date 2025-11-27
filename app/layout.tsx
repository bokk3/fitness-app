import type { Metadata } from "next";
import "./globals.css";

import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "FitTrack - Fitness Tracking App",
  description: "Track your workouts, nutrition, and progress with FitTrack",
  manifest: "/manifest.json",
  themeColor: "#00ff00",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitTrack",
  },
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

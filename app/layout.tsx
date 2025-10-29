import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "twnty.ai - Insights & Stories",
  description: "A minimal blog for modern thinkers",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tak Games Stats Dashboard",
  description: "Real-time statistics dashboard for PlayTak games",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

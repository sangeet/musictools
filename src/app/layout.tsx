import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MusicTools - Practical Tools for Musicians",
  description: "Eliminate cognitive friction when arranging songs and practicing. Instant inversions, interactive fretboards, and chord-melody harmonization.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

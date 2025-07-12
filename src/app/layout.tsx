import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music tools",
  description: "Random tech tools for music use",
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

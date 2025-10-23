import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comparos - Smart Product Comparison",
  description: "Compare products side-by-side with intelligent analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}

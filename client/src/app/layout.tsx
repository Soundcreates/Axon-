import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axon — Token-Aligned Peer Review",
  description: "Transparent, incentivized peer review — on-chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark"> {/* switch to 'light' for light theme */}
      <body className="min-h-screen bg-background text-foreground antialiased aurora">
        {children}
      </body>
    </html>
  );
}

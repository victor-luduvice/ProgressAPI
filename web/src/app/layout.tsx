import type { Metadata, Viewport } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./globals.css";
import "./brand.css";

export const metadata: Metadata = {
  title: "Progress | Controle de estoque",
  description: "Painel de estoque e registro de contagens.",
  applicationName: "Progress",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Progress",
  },
};

export const viewport: Viewport = {
  themeColor: "#176b50",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

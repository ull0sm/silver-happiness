import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IRON TRACK — Forge Iron.",
  description:
    "Brutalist fitness tracker. Curated splits, custom workout builder, progressive overload, and live leaderboards. No weakness.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#131313",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${lexend.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        />
      </head>
      <body className="bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-black">
        {children}
      </body>
    </html>
  );
}

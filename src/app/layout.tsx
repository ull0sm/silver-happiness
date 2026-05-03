import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitTrack | Performance Lab",
  description:
    "Track your reps, analyze your power output, and dominate live leaderboards. Built for athletes who view fitness as a battle.",
  keywords: ["fitness tracker", "workout log", "progressive overload", "gym app"],
  openGraph: {
    title: "FitTrack | Performance Lab",
    description: "Forge iron. Break records. No weakness.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${lexend.variable} font-lexend bg-background text-on-surface antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}

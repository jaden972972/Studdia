import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Focusify | Discipline & Study Cockpit',
  description: 'The ultimate minimalist tool for deep work, Pomodoro sessions, and curated focus music. Built for discipline.',
  keywords: ['Focusify', 'Deep Work', 'Pomodoro', 'Study Music', 'Discipline'],
  authors: [{ name: 'Jaden Sy' }],
  robots: 'index, follow', // Esto le dice a Google: "Entra y regístrame"
  openGraph: {
    title: 'Focusify',
    description: 'Forge your mind with the best study tool.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

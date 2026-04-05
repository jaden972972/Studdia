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
  title: 'Studdia | Discipline & Study Cockpit',
  description: 'The ultimate minimalist tool for deep work, Pomodoro sessions, and curated focus music. Built for discipline.',
  keywords: ['Studdia', 'Deep Work', 'Pomodoro', 'Study Music', 'Discipline'],
  authors: [{ name: 'Jaden Sy' }],
  robots: 'index, follow', // Esto le dice a Google: "Entra y regístrame"
  openGraph: {
    title: 'Studdia',
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
      {/* Blocking script: applies theme before first paint to avoid flash */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('studdia_theme');
              // Light is the default — only go dark if explicitly saved
              document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
            } catch(e) {
              document.documentElement.setAttribute('data-theme', 'light');
            }
          })();
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chat with Real-time tool streaming Progress",
  description: "Next.js app with AI SDK v5 beta and real-time tool streaming progress",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const envTheme = '${process.env.NEXT_PUBLIC_DEFAULT_THEME || 'system'}';
                const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                let shouldBeDark = false;
                
                if (theme) {
                  // User has selected a theme
                  shouldBeDark = theme === 'dark';
                } else {
                  // No user preference, use ENV or system
                  if (envTheme === 'dark') {
                    shouldBeDark = true;
                  } else if (envTheme === 'light') {
                    shouldBeDark = false;
                  } else {
                    // envTheme === 'system' or fallback
                    shouldBeDark = systemIsDark;
                  }
                }
                
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
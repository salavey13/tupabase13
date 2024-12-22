import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
//import { Navigation } from '@/components/Navigation';
import { AppProvider } from '@/lib/contexts/app-context';
//import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Events',
  description: 'Find and create amazing events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/*<ThemeProvider attribute="class" className="pt-16"defaultTheme="dark" enableSystem>*/}
          <AppProvider>
            {/*<Navigation />*/}
            <main >
              {children}
            </main>
          </AppProvider>
        {/*</ThemeProvider>*/}
      </body>
    </html>
  );
}
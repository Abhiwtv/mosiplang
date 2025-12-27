import type { Metadata } from "next";
import { Inter, Hind } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";

// Fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const hind = Hind({ 
  weight: ['400', '500', '600', '700'], // required weights
  subsets: ['devanagari'],
  variable: '--font-hind',
  display: 'swap'
});

// Metadata
export const metadata: Metadata = {
  title: "AgriExport - Digital Trade Platform",
  description: "Next-generation export compliance platform",
};

// RootLayout
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch locale and messages inside the async function
  const locale = (await getLocale()) || 'en';        // fallback to 'en'
  const messages = await getMessages({locale});        // explicitly pass locale

  return (
    <html lang={locale} className={`${inter.variable} ${hind.variable}`}>
      <body className={`${locale === 'hi' ? 'font-hind' : 'font-inter'} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

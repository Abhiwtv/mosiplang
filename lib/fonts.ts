import { Inter, Hind } from 'next/font/google';

export const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true
});

export const hind = Hind({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari'],
  variable: '--font-hind',
  display: 'swap',
  preload: true
});
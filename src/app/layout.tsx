import type { Metadata } from 'next';
import './globals.css';
import { store } from '@/config/product';

export const metadata: Metadata = {
  title: `${store.brand} | ${store.productName}`,
  description: 'Discover HUXIABEAUTY True Match Foundation at ÉLURE BEAUTY. Cash on Delivery across Nepal, subject to courier service.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

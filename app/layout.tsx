import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const dmSans = localFont({ src: [
  { path:'./fonts/dm-sans-400.ttf', weight:'400' },
  { path:'./fonts/dm-sans-500.ttf', weight:'500' },
  { path:'./fonts/dm-sans-600.ttf', weight:'600' },
  { path:'./fonts/dm-sans-700.ttf', weight:'700' },
], variable:'--font-dm', display:'swap' });
const caslon = localFont({ src:'./fonts/libre-caslon-400.ttf', variable:'--font-caslon', display:'swap', weight:'400' });

export const metadata: Metadata = {
  title: 'Atlas Asia — A little curiosity. A whole continent.',
  description: 'Your personal Asia travel companion. Explore destinations, discover celebrations in 2027–2028, and plan your next solo adventure.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${dmSans.variable} ${caslon.variable}`}><body>{children}</body></html>;
}

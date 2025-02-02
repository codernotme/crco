import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crco Bridge',
  description: 'created by team 401 Unauthorized',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

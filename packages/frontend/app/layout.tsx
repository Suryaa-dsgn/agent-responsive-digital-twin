import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { BackendProvider } from '@/lib/BackendContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Developer Digital Twin - Agent-Responsive Design',
  description: 'A demonstration of Agent-Responsive Design principles for bilingual human-AI interfaces',
  keywords: ['developer digital twin', 'agent-responsive design', 'AI interfaces', 'API design'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BackendProvider>
          {children}
        </BackendProvider>
      </body>
    </html>
  );
}


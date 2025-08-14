import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { BackendProvider } from '@/lib/BackendContext';
import { getNonce } from '@/lib/nonce';
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
  // Get the nonce for this request
  const nonce = getNonce();
  
  return (
    <html lang="en">
      <head>
        {/* Apply nonce to any inline scripts in head */}
        {/* This is an example of how to use nonce with inline scripts */}
        {nonce && (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
                // This script now has a nonce and won't be blocked by CSP
                console.log("CSP nonce applied successfully");
              `
            }}
          />
        )}
      </head>
      <body className={inter.className}>
        <BackendProvider>
          {children}
        </BackendProvider>
      </body>
    </html>
  );
}


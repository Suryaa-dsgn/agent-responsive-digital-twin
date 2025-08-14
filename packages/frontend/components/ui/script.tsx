import { getNonce } from '@/lib/nonce';
import NextScript, { ScriptProps as NextScriptProps } from 'next/script';

interface ScriptProps extends NextScriptProps {
  // Additional props can be added here if needed
}

/**
 * Script component that automatically applies the CSP nonce
 * Use this instead of the default Next.js Script component
 */
export function Script(props: ScriptProps) {
  const nonce = getNonce();
  
  return <NextScript {...props} nonce={nonce} />;
}

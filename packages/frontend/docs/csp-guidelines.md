# Content Security Policy (CSP) Guidelines

## Overview

This project implements a strict Content Security Policy to protect against cross-site scripting (XSS) attacks. 
The CSP is configured to use nonces for inline scripts and styles, removing the need for unsafe-inline and unsafe-eval directives in production.

## How It Works

1. A unique nonce (cryptographic random value) is generated for each request in the Next.js middleware
2. The nonce is added to the CSP header and made available via request headers
3. The `getNonce()` function retrieves this nonce for use in server components
4. Utility components apply the nonce automatically to scripts and styles

## Development vs Production

- **Development**: A relaxed CSP is used with unsafe-inline and unsafe-eval allowed
- **Production**: A strict CSP is enforced using nonces and without unsafe directives

## Using the Nonce in Your Code

### For Server Components

```tsx
import { getNonce } from '@/lib/nonce';

export default function MyServerComponent() {
  const nonce = getNonce();
  
  return (
    <div>
      {/* Option 1: Use the utility components */}
      <NonceScript>
        {`console.log("This inline script is allowed by CSP")`}
      </NonceScript>
      
      {/* Option 2: Apply the nonce manually */}
      <script 
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `console.log("This inline script is also allowed")`
        }}
      />
    </div>
  );
}
```

### For Client Components with Next.js Script

```tsx
import { Script } from '@/components/ui/script';

export default function MyClientComponent() {
  return (
    <div>
      {/* This automatically applies the nonce */}
      <Script id="example" strategy="afterInteractive">
        {`console.log("This script uses the nonce from the custom Script component")`}
      </Script>
    </div>
  );
}
```

## Best Practices

1. **Avoid Inline Scripts/Styles**: Whenever possible, move code to external files
2. **Use the Utility Components**: Use `NonceScript`, `NonceStyle`, and `Script` components
3. **Third-Party Scripts**: Use the custom `Script` component with proper strategy
4. **Content Hash Alternative**: For static inline scripts that don't change, you can use SHA hashes instead of nonces

## Troubleshooting

If you encounter CSP errors in the console:

1. Check that all inline scripts and styles have the proper nonce attribute
2. Use browser dev tools to inspect the CSP header and verify the nonce is correct
3. For third-party scripts, ensure they're properly allowed in the CSP configuration

## Testing

Before deploying to production, test thoroughly to ensure all features work with the strict CSP:

```bash
# Set NODE_ENV to production for local testing with strict CSP
NODE_ENV=production npm run dev
```

# Content Security Policy (CSP) Implementation

This document outlines the Content Security Policy implementation in our Next.js application.

## Overview

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks. Our implementation:

1. **Removes unsafe directives** in production environment
2. **Uses nonces** for inline scripts and styles
3. **Maintains development experience** with a relaxed policy in development mode
4. **Provides utility components** to simplify implementation

## Key Components

### 1. Middleware (`middleware.ts`)

- Generates a unique nonce per request
- Sets different CSP headers based on environment
- Adds the nonce to response headers for access in components

### 2. Nonce Utilities (`lib/nonce.ts`)

- `getNonce()`: Retrieves the current request's nonce
- `NonceScript`: Component for inline scripts with automatic nonce
- `NonceStyle`: Component for inline styles with automatic nonce

### 3. Script Component (`components/ui/script.tsx`)

- Wrapper around Next.js Script component that adds nonce attribute

### 4. Test Utilities (`test/csp-test.ts`)

- Functions to verify CSP implementation is working correctly

## Usage

### In Server Components

```tsx
import { getNonce, NonceScript, NonceStyle } from '@/lib/nonce';

export default function MyServerComponent() {
  const nonce = getNonce();
  
  return (
    <>
      {/* Method 1: Using utility components */}
      <NonceScript>
        {`console.log("This inline script works with CSP")`}
      </NonceScript>
      
      <NonceStyle>
        {`.my-class { color: red; }`}
      </NonceStyle>
      
      {/* Method 2: Manual nonce application */}
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `console.log("This also works with CSP")`
        }}
      />
    </>
  );
}
```

### In Client Components

```tsx
import { Script } from '@/components/ui/script';

export default function MyClientComponent() {
  return (
    <Script id="my-script" strategy="afterInteractive">
      {`console.log("This client script works with CSP")`}
    </Script>
  );
}
```

## Testing

1. Visit `/csp-test` route to see the CSP implementation in action
2. Click "Run CSP Tests" to verify the implementation
3. Check browser console for CSP violations

For production testing:

```bash
# Run locally with production CSP settings
NODE_ENV=production npm run dev
```

## Security Considerations

1. **Never use** `unsafe-inline` or `unsafe-eval` in production
2. Add third-party domains explicitly to the CSP configuration in `middleware.ts`
3. Update CSP when integrating new third-party scripts or services
4. Regularly test CSP with security scanning tools

## Additional Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [CSP Evaluator Tool](https://csp-evaluator.withgoogle.com/)

See `docs/csp-guidelines.md` for more detailed implementation guidelines.

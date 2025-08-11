'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {}

const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          'p-4 rounded-md bg-gray-100 overflow-x-auto text-sm font-mono',
          className
        )}
        {...props}
      >
        <code>{children}</code>
      </pre>
    );
  }
);

Code.displayName = 'Code';

export { Code };

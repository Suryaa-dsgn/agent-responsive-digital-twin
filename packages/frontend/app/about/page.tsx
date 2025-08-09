import Link from 'next/link';
import { Button } from '../../components/ui/button';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">About Developer Digital Twin</h1>
      
      <div className="max-w-3xl space-y-6 text-foreground">
        <p>
          The Developer Digital Twin project demonstrates Agent-Responsive Design principles,
          showcasing how digital interfaces can be designed to work seamlessly with both humans
          and AI agents.
        </p>
        
        <h2 className="mt-6 text-2xl font-semibold">Agent-Responsive Design</h2>
        <p>
          Agent-Responsive Design is a methodology for creating interfaces that are &quot;bilingual&quot; - 
          speaking clearly to both humans and AI agents. This project showcases how APIs and UIs can
          be designed to provide rich context, clear actions, and machine-readable formats.
        </p>
        
        <h2 className="mt-6 text-2xl font-semibold">Key Principles</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Context-rich responses with clear next actions</li>
          <li>Machine-readable formats alongside human-readable displays</li>
          <li>Consistent, predictable patterns for AI consumption</li>
          <li>Explicit state management and transition guidance</li>
          <li>Clean, semantic markup with appropriate ARIA attributes</li>
        </ul>
        
        <div className="mt-8">
          <Button asChild className="bg-accent text-white hover:bg-blue-700">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

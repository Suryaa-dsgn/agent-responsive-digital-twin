import { SemanticLayerDemo } from '@/components/SemanticLayerDemo';

export const metadata = {
  title: 'Semantic Layer Demo | AI Agent Demo',
  description: 'Demonstration of agent-friendly vs agent-hostile UI patterns',
};

export default function SemanticLayerDemoPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12">
      <SemanticLayerDemo />
    </main>
  );
}

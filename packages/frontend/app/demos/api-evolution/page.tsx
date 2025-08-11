import { APIEvolutionDemo } from '@/components/APIEvolutionDemo';

export const metadata = {
  title: 'API Evolution Demo | AI Agent Demo',
  description: 'Demonstration of traditional vs AI-first API responses',
};

export default function APIEvolutionDemoPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12">
      <APIEvolutionDemo />
    </main>
  );
}

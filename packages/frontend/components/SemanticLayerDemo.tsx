'use client';

import { useState } from 'react';
import { Code } from './ui/code';

/**
 * SemanticLayerDemo - A component that demonstrates the difference between
 * agent-friendly and agent-hostile UI patterns
 */
export function SemanticLayerDemo() {
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [selectedButton, setSelectedButton] = useState<'good' | 'bad' | null>(null);

  const handleGoodButtonClick = () => {
    setSelectedButton('good');
    setAgentResponse(
      "I can see this is a primary action button labeled 'Submit Form'. I'll help you submit the form data."
    );
  };

  const handleBadButtonClick = () => {
    setSelectedButton('bad');
    setAgentResponse(
      "I'm not sure what this element does. It appears to be a div with some text, but I can't determine its purpose or functionality."
    );
  };

  // Code snippets for display
  const goodButtonCode = `<button
  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
  onClick={handleSubmit}
  role="button"
  aria-label="Submit Form"
  data-agent-action="primary"
  data-agent-description="Submits the form data to the server"
>
  Submit Form
</button>`;

  const badButtonCode = `<div
  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded cursor-pointer"
  onClick={handleSubmit}
>
  Submit Form
</div>`;

  // Agent's "view" of each button
  const goodButtonAgentView = `{
  "element": "button",
  "role": "button",
  "accessible_name": "Submit Form",
  "action": "primary",
  "description": "Submits the form data to the server",
  "interactable": true,
  "state": "enabled"
}`;

  const badButtonAgentView = `{
  "element": "div",
  "role": null,
  "accessible_name": null,
  "action": null,
  "description": null,
  "interactable": false,
  "state": "unknown"
}`;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Semantic Layer Demo</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          This demo shows how proper semantic HTML and accessibility attributes make UI elements more understandable to AI agents.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Bad Button Column */}
        <div className="space-y-6 border border-red-200 rounded-lg p-6 bg-red-50">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-600">Agent-Hostile UI</h3>
            <p className="text-sm text-gray-600 mt-2">
              Uses non-semantic elements with minimal accessibility
            </p>
          </div>

          <div className="flex justify-center">
            {/* The "bad" button implementation */}
            <div
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded cursor-pointer"
              onClick={handleBadButtonClick}
            >
              Submit Form
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">HTML Implementation:</h4>
            <Code className="text-sm">{badButtonCode}</Code>
            
            <h4 className="font-medium">What an AI Agent "Sees":</h4>
            <Code className="text-sm bg-gray-800 text-gray-200">{badButtonAgentView}</Code>
            
            <div className="bg-red-100 p-4 rounded-md">
              <h4 className="font-medium text-red-700">Problems:</h4>
              <ul className="text-sm list-disc pl-5 space-y-1 text-red-800">
                <li>No semantic meaning (uses div instead of button)</li>
                <li>Missing accessibility attributes</li>
                <li>No role or descriptive information</li>
                <li>AI agents cannot understand the purpose</li>
                <li>Difficult for keyboard navigation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Good Button Column */}
        <div className="space-y-6 border border-green-200 rounded-lg p-6 bg-green-50">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-green-600">Agent-Friendly UI</h3>
            <p className="text-sm text-gray-600 mt-2">
              Uses semantic elements with proper accessibility attributes
            </p>
          </div>

          <div className="flex justify-center">
            {/* The "good" button implementation */}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              onClick={handleGoodButtonClick}
              role="button"
              aria-label="Submit Form"
              data-agent-action="primary"
              data-agent-description="Submits the form data to the server"
            >
              Submit Form
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">HTML Implementation:</h4>
            <Code className="text-sm">{goodButtonCode}</Code>
            
            <h4 className="font-medium">What an AI Agent "Sees":</h4>
            <Code className="text-sm bg-gray-800 text-gray-200">{goodButtonAgentView}</Code>
            
            <div className="bg-green-100 p-4 rounded-md">
              <h4 className="font-medium text-green-700">Benefits:</h4>
              <ul className="text-sm list-disc pl-5 space-y-1 text-green-800">
                <li>Proper semantic element (button)</li>
                <li>Clear accessibility attributes</li>
                <li>Data attributes provide context for AI agents</li>
                <li>AI can understand purpose and functionality</li>
                <li>Supports keyboard navigation and screen readers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Response Section */}
      {agentResponse && (
        <div className="mt-8 p-6 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">Simulated AI Agent Response</h3>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              AI
            </div>
            <div className="flex-1">
              <div className="font-medium">
                When interacting with the {selectedButton === 'good' ? 'agent-friendly' : 'agent-hostile'} button:
              </div>
              <div className="mt-2 p-4 bg-white rounded-md shadow-sm">
                {agentResponse}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Why This Matters</h3>
        <p className="text-gray-700">
          As AI agents become more integrated into our digital experiences, they need to understand the purpose
          and functionality of UI elements. Semantic HTML, accessibility attributes, and descriptive data attributes
          create a bridge between human-readable interfaces and machine-understandable structure.
        </p>
        <p className="text-gray-700 mt-2">
          Building agent-friendly interfaces ensures that AI can help users interact with your application effectively.
        </p>
      </div>
    </div>
  );
}

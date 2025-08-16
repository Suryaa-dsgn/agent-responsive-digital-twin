import { getNonce, NonceScript, NonceStyle } from '@/lib/nonce';
import { Script } from '@/components/ui/script';
import CSPTestButton from '@/components/CSPTestButton';

export default function CspTestPage() {
  const nonce = getNonce();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Content Security Policy Test Page</h1>
      
      <section className="mb-8 p-6 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Current CSP Nonce</h2>
        <p className="mb-2">Current page nonce value: <code className="bg-gray-200 px-2 py-1 rounded">{nonce}</code></p>
        
        <div className="mt-4">
          <CSPTestButton />
        </div>
      </section>
      
      <section className="mb-8 p-6 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Server Component Examples</h2>
        
        {/* Example of using NonceScript component */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">NonceScript Component</h3>
          <NonceScript>
            {`document.getElementById('nonce-script-result').textContent = 'NonceScript component works! ✅';`}
          </NonceScript>
          <div id="nonce-script-result" className="p-3 bg-gray-100 rounded">
            If you see this, the NonceScript component is not working ❌
          </div>
        </div>
        
        {/* Example of using NonceStyle component */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">NonceStyle Component</h3>
          <NonceStyle>
            {`
              #nonce-style-target {
                color: #00cc00;
                font-weight: bold;
                border: 2px dashed #00cc00;
                padding: 8px;
                border-radius: 4px;
                background-color: #f0fff0;
              }
            `}
          </NonceStyle>
          <div id="nonce-style-target" className="p-3 rounded">
            If this text is green with a green border, NonceStyle component works! ✅
          </div>
        </div>
        
        {/* Example of direct nonce usage */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Direct Nonce Usage</h3>
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
                document.getElementById('direct-nonce-result').textContent = 'Direct nonce usage works! ✅';
              `
            }}
          />
          <div id="direct-nonce-result" className="p-3 bg-gray-100 rounded">
            If you see this, direct nonce usage is not working ❌
          </div>
        </div>
      </section>
      
      <section className="p-6 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Client Component Examples</h2>
        
        {/* Example of using Script component */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Script Component</h3>
          <Script id="client-script" strategy="afterInteractive">
            {`
              document.getElementById('client-script-result').textContent = 'Script component works! ✅';
            `}
          </Script>
          <div id="client-script-result" className="p-3 bg-gray-100 rounded">
            If you see this, the Script component is not working ❌
          </div>
        </div>
      </section>
    </div>
  );
}

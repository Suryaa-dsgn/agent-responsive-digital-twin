'use client';

export default function CSPTestButton() {
  return (
    <div>
      <button 
        id="test-csp-button"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => {
          // This will be evaluated at runtime
          import('@/test/csp-test')
            .then(({ runAllCspTests }) => runAllCspTests())
            .then(results => {
              const resultsElement = document.getElementById('test-results');
              if (resultsElement) {
                resultsElement.innerHTML = `
                  <div class="mt-4 p-3 ${results.noncePresent && results.inlineWithNonceWorks && results.inlineWithoutNonceBlocked ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} border rounded">
                    <p><strong>Nonce in CSP header:</strong> ${results.noncePresent ? '✅' : '❌'}</p>
                    <p><strong>Inline script with nonce works:</strong> ${results.inlineWithNonceWorks ? '✅' : '❌'}</p>
                    <p><strong>Inline script without nonce blocked:</strong> ${results.inlineWithoutNonceBlocked ? '✅' : '❌'}</p>
                  </div>
                `;
              }
            });
        }}
      >
        Run CSP Tests
      </button>
      <div id="test-results" className="mt-4"></div>
    </div>
  );
}

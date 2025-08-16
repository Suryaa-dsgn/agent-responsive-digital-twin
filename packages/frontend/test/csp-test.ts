/**
 * Content Security Policy Test Utility
 * 
 * This file provides functions to test if the CSP implementation is working correctly.
 * Run these tests before deploying to production to ensure the strict CSP doesn't break functionality.
 */

// Declare global window properties used by the tests
declare global {
  interface Window {
    __cspTestPassed?: boolean;
    __cspTestWithoutNoncePassed?: boolean;
  }
}

/**
 * Tests if a nonce is present in the CSP header
 * @returns {boolean} True if nonce is found in CSP header
 */
export function testCspNonce(): boolean {
  try {
    const cspHeader = document.querySelector('meta[property="csp-nonce"]')?.getAttribute('content') || 
                      document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content');
    
    if (!cspHeader) {
      console.error('CSP header not found');
      return false;
    }
    
    // Check if the CSP contains a nonce pattern with more permissive regex for URL-safe base64
    const nonceMatch = cspHeader.match(/nonce-([A-Za-z0-9+/=_-]+)/);
    
    if (!nonceMatch) {
      console.error('CSP header found but no nonce detected');
      return false;
    }
    
    const extractedNonce = nonceMatch[1];
    
    // Validate the extracted nonce
    if (!extractedNonce || extractedNonce.length < 8 || extractedNonce.length > 128) {
      console.error('Invalid nonce detected: length outside expected bounds');
      return false;
    }
    
    // Only log after validation passes
    console.log('CSP nonce found:', extractedNonce);
    return true;
  } catch (e) {
    console.error('Error testing CSP nonce:', e);
    return false;
  }
}

/**
 * Tests if inline scripts with nonce work
 * @returns {Promise<boolean>} True if the test script executes successfully
 */
export async function testInlineScriptWithNonce(): Promise<boolean> {
  return new Promise((resolve) => {
    let script: HTMLScriptElement | null = null;
    try {
      // Create a global flag that our test script will set
      window.__cspTestPassed = false;
      
      // Get the nonce from an existing script if available
      const existingNonce = document.querySelector('script[nonce]')?.getAttribute('nonce');
      
      if (!existingNonce) {
        console.error('No script with nonce found to test against');
        delete window.__cspTestPassed;
        return resolve(false);
      }
      
      // Create a test script with the same nonce
      script = document.createElement('script');
      script.nonce = existingNonce;
      script.textContent = 'window.__cspTestPassed = true;';
      document.head.appendChild(script);
      
      // Check if our flag was set
      setTimeout(() => {
        const result = (window as any).__cspTestPassed === true;
        console.log('Inline script with nonce test:', result ? 'PASSED' : 'FAILED');
        
        // Clean up: remove script element and delete global flag
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
        script = null;
        delete window.__cspTestPassed;
        
        resolve(result);
      }, 100);
    } catch (e) {
      console.error('Error testing inline script with nonce:', e);
      
      // Clean up in case of error
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      script = null;
      delete window.__cspTestPassed;
      
      resolve(false);
    }
  });
}

/**
 * Tests if inline script without nonce is blocked
 * @returns {Promise<boolean>} True if the script without nonce is blocked as expected
 */
export async function testInlineScriptWithoutNonce(): Promise<boolean> {
  return new Promise((resolve) => {
    let script: HTMLScriptElement | null = null;
    try {
      // Create a global flag that our test script will try to set
      window.__cspTestWithoutNoncePassed = false;
      
      // Create a test script without nonce
      script = document.createElement('script');
      script.textContent = 'window.__cspTestWithoutNoncePassed = true;';
      document.head.appendChild(script);
      
      // If CSP is working, the script should be blocked and flag should remain false
      setTimeout(() => {
        const result = (window as any).__cspTestWithoutNoncePassed === false;
        console.log('Inline script without nonce test:', result ? 'PASSED' : 'FAILED');
        
        // Clean up: remove script element and delete global flag
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
        script = null;
        delete (window as any).__cspTestWithoutNoncePassed;
        
        resolve(result);
      }, 100);
    } catch (e) {
      console.error('Error testing inline script without nonce:', e);
      
      // Clean up in case of error
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      script = null;
      delete (window as any).__cspTestWithoutNoncePassed;
      
      resolve(false);
    }
  });
}

/**
 * Run all CSP tests
 */
export async function runAllCspTests(): Promise<{
  noncePresent: boolean;
  inlineWithNonceWorks: boolean;
  inlineWithoutNonceBlocked: boolean;
}> {
  const noncePresent = testCspNonce();
  const inlineWithNonceWorks = await testInlineScriptWithNonce();
  const inlineWithoutNonceBlocked = await testInlineScriptWithoutNonce();
  
  console.log('CSP Tests Summary:');
  console.log('- Nonce present in CSP header:', noncePresent ? 'YES' : 'NO');
  console.log('- Inline script with nonce works:', inlineWithNonceWorks ? 'YES' : 'NO');
  console.log('- Inline script without nonce blocked:', inlineWithoutNonceBlocked ? 'YES' : 'NO');
  
  return {
    noncePresent,
    inlineWithNonceWorks,
    inlineWithoutNonceBlocked
  };
}

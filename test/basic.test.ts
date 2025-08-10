/**
 * Basic sample test to verify Jest configuration works
 */

describe('Basic test suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('should handle async operations', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});

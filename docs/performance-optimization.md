# Performance Optimization Guide

This guide outlines the performance optimizations implemented in the AI Agent Demo application for optimal production deployment.

## Image Optimization

Next.js provides built-in image optimization through the `next/image` component. We've configured the following optimizations:

```javascript
// next.config.js
images: {
  domains: [],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60,
},
```

When using images in your components:

```jsx
import Image from 'next/image'

// Use responsive images
<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={isAboveFold}
  loading="lazy"
/>
```

## JavaScript Optimization

1. **Code Splitting**
   
   Use dynamic imports for large components that aren't immediately needed:

   ```jsx
   import dynamic from 'next/dynamic'

   const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
     loading: () => <p>Loading...</p>,
   })
   ```

2. **Lazy Loading**
   
   For components below the fold or in different routes:

   ```jsx
   const LazyComponent = dynamic(() => import('../components/LazyComponent'), {
     ssr: false, // Only load on client-side
   })
   ```

3. **Minimizing Bundle Size**
   
   - Import only what you need from libraries
   - Use lightweight alternatives when possible
   - Set up proper tree-shaking

## API Response Optimization

1. **Caching Strategies**

   ```javascript
   // For static data that rarely changes
   export async function getStaticProps() {
     // ...fetch data
     return {
       props: { data },
       revalidate: 60 * 60, // Revalidate every hour
     }
   }
   ```

2. **Edge Caching**
   
   Properly configure response headers:

   ```javascript
   // For API routes
   res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
   ```

## CSS Optimization

1. **Removing Unused CSS**
   
   Tailwind CSS is already optimized to remove unused styles in production.

2. **Critical CSS**
   
   Ensure critical styles are loaded first, with non-critical styles deferred.

## Backend Optimization

1. **Compression**

   ```javascript
   import compression from 'compression'

   // In server.ts
   app.use(compression())
   ```

2. **Response Caching**
   
   Implement caching for expensive operations:

   ```javascript
   // Cache implementation with TTL and LRU eviction
   class LRUCache {
     constructor(maxSize = 100, maxAgeMs = 3600000) {
       this.cache = new Map();
       this.maxSize = maxSize;
       this.maxAgeMs = maxAgeMs; // Default: 1 hour TTL
     }
   
     get(key) {
       if (!this.cache.has(key)) return undefined;
       
       const item = this.cache.get(key);
       
       // Check if item is expired
       if (Date.now() > item.expiry) {
         this.cache.delete(key);
         return undefined;
       }
       
       // LRU: update access by deleting and re-adding
       this.cache.delete(key);
       this.cache.set(key, item);
       
       return item.value;
     }
     
     set(key, value) {
       // Evict oldest entry if at capacity
       if (this.cache.size >= this.maxSize) {
         // Delete the first item (oldest in insertion order)
         const firstKey = this.cache.keys().next().value;
         this.cache.delete(firstKey);
       }
       
       // Store with expiration timestamp
       this.cache.set(key, {
         value,
         expiry: Date.now() + this.maxAgeMs
       });
     }
   }
   
   // Initialize cache with size limit and TTL
   const cache = new LRUCache(100, 15 * 60 * 1000); // 15 minutes TTL, 100 items max
   
   app.get('/api/expensive-operation', async (req, res) => {
     const cacheKey = req.url;
     const cachedResult = cache.get(cacheKey);
     
     if (cachedResult !== undefined) {
       return res.json(cachedResult);
     }
     
     try {
       // Perform operation...
       const result = await performExpensiveOperation();
       
       // Store in cache
       cache.set(cacheKey, result);
       res.json(result);
     } catch (error) {
       res.status(500).json({ error: 'Operation failed' });
     }
   });
   ```
   
   > **Note:** For production use, consider:
   > - Using an established library like `lru-cache` or `node-cache` for more features
   > - Implementing mutex locks for cache access in high-concurrency scenarios
   > - For multi-process/multi-server deployments, use a distributed cache like Redis
   > - Add metrics for cache hit/miss rates to monitor effectiveness

## Monitoring Performance

1. **Web Vitals**

   ```jsx
   // _app.js
   export function reportWebVitals(metric) {
     // Analytics implementation
     console.log(metric)
   }
   ```

2. **Lighthouse CI**
   
   Consider setting up Lighthouse CI to monitor performance metrics on each deployment.

## Third-Party Scripts

1. **Deferred Loading**
   
   Load non-critical third-party scripts after page load:

   ```jsx
   useEffect(() => {
     // Load analytics script
     const script = document.createElement('script')
     script.src = '...'
     document.body.appendChild(script)
   }, [])
   ```

2. **Script Loading Attributes**
   
   ```html
   <script async defer src="..."></script>
   ```

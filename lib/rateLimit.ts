import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        const currentCount = tokenCount[0] !== undefined ? tokenCount[0] : 0;
        
        if (currentCount === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCache.set(token, [currentCount + 1]);
        }

        const currentUsage = currentCount + 1;
        const isRateLimited = currentUsage > limit;

        if (isRateLimited) {
          return reject(new Error('Rate limit exceeded'));
        }

        return resolve();
      }),
  };
}

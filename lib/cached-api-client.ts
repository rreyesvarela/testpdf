// lib/cached-api-client.ts
import { apiCall } from './api-client';

type ApiOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
};

// In-memory cache
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, { data: any; timestamp: number }>();

export async function cachedApiCall<T>(
    endpoint: string,
    options: ApiOptions,
    cacheDurationMs: number = 0 // 0 means no cache
): Promise<T> {
    // Only apply caching for GET requests
    if (options.method !== 'GET' || cacheDurationMs <= 0) {
        return apiCall(endpoint, options);
    }

    // Create a cache key based on endpoint and params
    const paramsString = options.params ? JSON.stringify(options.params) : '';
    const cacheKey = `${endpoint}:${paramsString}`;

    // Check if we have a valid cached response
    const cachedItem = cache.get(cacheKey);
    const now = Date.now();

    if (cachedItem && now - cachedItem.timestamp < cacheDurationMs) {
        return cachedItem.data;
    }

    // If not cached or expired, fetch fresh data
    const data = await apiCall<T>(endpoint, options);

    // Store in cache
    cache.set(cacheKey, { data, timestamp: now });

    return data;
}
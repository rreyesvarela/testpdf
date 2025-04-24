// lib/api-client.ts
import { getToken } from './auth';

type ApiOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
};

export async function apiCall<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> {
    const { method = 'GET', params, body } = options;

    // Get auth token
    const token = await getToken();

    // Build URL with query params for GET requests
    let url = `${process.env.API_BASE_URL}/${endpoint}`;

    if (method === 'GET' && params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            queryParams.append(key, value);
        });
        url += `?${queryParams.toString()}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
        method,
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
        },
        cache: 'no-store' // Prevent caching for dynamic data
    };

    // Add body for non-GET requests
    if (method !== 'GET' && body) {
        requestOptions.body = JSON.stringify(body);
    }

    // Make the request
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}
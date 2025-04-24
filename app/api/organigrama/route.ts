// app/api/organigrama/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cachedApiCall } from '@/lib/cached-api-client';

// Cache the response for 24 hours (86400 seconds)
export const revalidate = 86400;

// GET organigrama
export async function GET(request: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const params: Record<string, string> = {};

        // Convert searchParams to a regular object
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        params.modo="edicion"

        // const data = await apiCall('organigrama', {
        //     method: 'GET',
        //     params
        // });

        // In your route handler
        const DAY_IN_MS = 86400 * 1000;
        const data = await cachedApiCall('organigrama', {
            method: 'GET',
            params
        }, DAY_IN_MS);

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch organigrama' },
            { status: 500 }
        );
    }
}
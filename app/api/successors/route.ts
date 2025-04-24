import { NextRequest, NextResponse } from 'next/server';
import { apiCall } from '@/lib/api-client';

// GET successors
export async function GET(request: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const params: Record<string, string> = {};

        // Convert searchParams to a regular object
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        const data = await apiCall('successors', {
            method: 'GET',
            params
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch successors' },
            { status: 500 }
        );
    }
}
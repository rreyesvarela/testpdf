import { NextRequest, NextResponse } from 'next/server';
import { apiCall } from '@/lib/api-client';
import { cachedApiCall } from '@/lib/cached-api-client';

export const maxDuration = 60;

// GET hogan
export async function GET(request: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const params: Record<string, string> = {};

        // Convert searchParams to a regular object
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        const time = 60 * 5 * 1000;
        params.modo="edicion"

        let data = null;

        if (params?.isPDF) {
            data = await cachedApiCall('hogan', {
                method: 'GET',
                params
            }, time);

        } else {
            data = await apiCall('hogan', {
                method: 'GET',
                params
            });
        }

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch hogan' },
            { status: 500 }
        );
    }
}

// UPDATE hogan
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await apiCall(`hogan`, {
            method: 'PUT',
            body
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update hogan' },
            { status: 500 }
        );
    }
}
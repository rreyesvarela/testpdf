import { NextRequest, NextResponse } from 'next/server';
import { apiCall } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET APP
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

        const data = await apiCall('APP', {
            method: 'GET',
            params
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch APP' },
            { status: 500 }
        );
    }
}

// UPDATE APP
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        const data = await apiCall(`APP`, {
            method: 'PUT',
            body
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update APP' },
            { status: 500 }
        );
    }
}
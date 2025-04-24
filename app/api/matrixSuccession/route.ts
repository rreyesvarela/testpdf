import { NextRequest, NextResponse } from 'next/server';
import { apiCall } from '@/lib/api-client';

// GET matrizSuccesion
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

        const data = await apiCall('matrizSuccesion', {
            method: 'GET',
            params
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch matrizSuccesion' },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { apiCall } from '@/lib/api-client';

// UPDATE strength
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        const data = await apiCall(`strength`, {
            method: 'PUT',
            body
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update strength' },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { apiCall } from '@/lib/api-client';

// GET suggestedActions
export async function GET(request: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const params: Record<string, string> = {};

        // Convert searchParams to a regular object
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        const data = await apiCall('suggestedActions', {
            method: 'GET',
            params
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch suggestedActions' },
            { status: 500 }
        );
    }
}

// CREATE suggestedActions
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await apiCall('suggestedActions', {
            method: 'POST',
            body
        });

        return NextResponse.json(data, { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create suggestedActions' },
            { status: 500 }
        );
    }
}

// UPDATE suggestedActions
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        const data = await apiCall(`suggestedActions`, {
            method: 'PUT',
            body
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update suggestedActions' },
            { status: 500 }
        );
    }
}

// DELETE suggestedActions
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();

        const data = await apiCall(`suggestedActions`, {
            method: 'DELETE',
            body
        });

        return NextResponse.json(data, { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to delete suggestedActions' },
            { status: 500 }
        );
    }
}
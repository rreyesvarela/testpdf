import { NextRequest, NextResponse } from 'next/server';
import { apiCall } from '@/lib/api-client';

// GET CV
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

        const data = await apiCall('CV', {
            method: 'GET',
            params
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch CV' },
            { status: 500 }
        );
    }
}

// CREATE CV
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await apiCall('CV', {
            method: 'POST',
            body
        });

        return NextResponse.json(data, { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create CV' },
            { status: 500 }
        );
    }
}

// UPDATE CV
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await apiCall(`CV`, {
            method: 'PUT',
            body
        });

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update CV' },
            { status: 500 }
        );
    }
}

// DELETE CV
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();

        const data = await apiCall(`CV`, {
            method: 'DELETE',
            body
        });

        return NextResponse.json(data, { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to delete CV' },
            { status: 500 }
        );
    }
}
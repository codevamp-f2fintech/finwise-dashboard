import { NextResponse } from 'next/server';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const backendUrl = process.env.BACKEND_URL || 'https://web.f2fintech.in/api/v1';
        const response = await fetch(`${backendUrl}/update-leads-info/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || 'Failed to update lead' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error proxying update-leads-info:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

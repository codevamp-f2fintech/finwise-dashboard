import { NextResponse } from 'next/server';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const response = await fetch(`https://web.f2fintech.in/api/v1/update-leads-info/${id}`, {
            method: "PUT", // assuming PUT, could be POST - we pass whatever backend expects
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            let errorMsg = "Failed to update leads info to backend";
            try {
                const errorJson = await response.json();
                errorMsg = errorJson.message || errorMsg;
            } catch { }
            return NextResponse.json({ error: errorMsg }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Error proxying update leads info:", error);
        return NextResponse.json(
            { error: "Internal Server Error proxying request." },
            { status: 500 }
        );
    }
}

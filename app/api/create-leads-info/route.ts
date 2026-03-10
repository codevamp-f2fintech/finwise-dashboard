import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch("https://web.f2fintech.in/api/v1/create-leads-info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            // If the upstream API fails, relay the error status
            let errorMsg = "Failed to submit leads info to backend";
            try {
                const errorJson = await response.json();
                errorMsg = errorJson.message || errorMsg;
            } catch {
                // upstream error wasn't JSON
            }
            return NextResponse.json({ error: errorMsg }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Error proxying leads info:", error);
        return NextResponse.json(
            { error: "Internal Server Error or network issue proxying request." },
            { status: 500 }
        );
    }
}

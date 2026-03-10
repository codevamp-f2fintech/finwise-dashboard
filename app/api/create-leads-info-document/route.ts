import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch("https://web.f2fintech.in/api/v1/create-leads-info-document", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            let errorMsg = "Failed to create document record in backend";
            try {
                const errorJson = await response.json();
                errorMsg = errorJson.message || errorMsg;
            } catch { }
            return NextResponse.json({ error: errorMsg }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Error proxying create document:", error);
        return NextResponse.json(
            { error: "Internal Server Error proxying request." },
            { status: 500 }
        );
    }
}

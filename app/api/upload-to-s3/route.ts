import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const response = await fetch("https://web.f2fintech.in/api/v1/upload-to-s3", {
            method: "POST",
            // Do NOT set Content-Type header manually here when forwarding FormData
            // fetch will automatically set the correct boundary 
            body: formData,
        });

        if (!response.ok) {
            let errorMsg = "Failed to upload document to S3 via backend";
            try {
                const errorJson = await response.json();
                errorMsg = errorJson.message || errorMsg;
            } catch { }
            return NextResponse.json({ error: errorMsg }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Error proxying S3 upload:", error);
        return NextResponse.json(
            { error: "Internal Server Error proxying request." },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            document_url,
            leads_info_id,
            type,
            company_id,
        } = body;

        const pool = getPool();

        const [result] = await pool.execute(
            `INSERT INTO leads_info_document
                (document_url, leads_info_id, type, company_id)
             VALUES (?, ?, ?, ?)`,
            [
                document_url ?? null,
                leads_info_id ?? null,
                type ?? null,
                company_id ?? null,
            ]
        );

        const insertId = (result as any).insertId;

        const [rows] = await pool.execute(
            'SELECT * FROM leads_info_document WHERE id = ?',
            [insertId]
        );

        const record = (rows as any[])[0];

        return NextResponse.json({
            success: true,
            data: { data: record },
        });

    } catch (error: any) {
        console.error('Error inserting leads_info_document into DB:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

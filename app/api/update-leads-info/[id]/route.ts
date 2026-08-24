import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const pool = getPool();

        // Build dynamic SET clause from whatever fields are in the body
        const fields = Object.keys(body);
        if (fields.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const setClauses = fields.map(f => `\`${f}\` = ?`).join(', ');
        const values = fields.map(f => body[f] ?? null);

        await pool.execute(
            `UPDATE leads_info SET ${setClauses} WHERE id = ?`,
            [...values, id]
        );

        // Return updated row
        const [rows] = await pool.execute(
            'SELECT * FROM leads_info WHERE id = ?',
            [id]
        );

        const record = (rows as any[])[0];

        if (!record) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { data: record },
        });

    } catch (error: any) {
        console.error('Error updating leads info in DB:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

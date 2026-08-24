import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            name,
            phone,
            email,
            persona,
            degree,
            experience_years,
            employment_type,
            cibil_band,
            declared_income,
            existing_emi,
            product,
            requested_limit,
            tenure_months,
            city,
            pincode,
            foreign_degree,
            college_on_list,
        } = body;

        const pool = getPool();

        const [result] = await pool.execute(
            `INSERT INTO leads_info
                (name, phone, email, persona, degree, experience_years,
                 employment_type, cibil_band, declared_income, existing_emi,
                 product, requested_limit, tenure_months, city, pincode,
                 foreign_degree, college_on_list)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name ?? null,
                phone ?? null,
                email ?? null,
                persona ?? null,
                degree ?? null,
                experience_years ?? 0,
                employment_type ?? null,
                cibil_band ?? null,
                declared_income ?? 0,
                existing_emi ?? 0,
                product ?? null,
                requested_limit ?? 0,
                tenure_months ?? 0,
                city ?? null,
                pincode ?? null,
                foreign_degree ?? null,
                college_on_list ?? null,
            ]
        ) as mysql.ResultSetHeader[];

        const insertId = (result as any).insertId;

        // Fetch the newly created row to return it (matches original response shape)
        const [rows] = await pool.execute(
            'SELECT * FROM leads_info WHERE id = ?',
            [insertId]
        );

        const record = (rows as any[])[0];

        return NextResponse.json({
            success: true,
            data: { data: record },
        });

    } catch (error: any) {
        console.error('Error inserting leads info into DB:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

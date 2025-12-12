import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const suppliers = await sql`
      SELECT 
        id,
        external_id,
        name,
        country_code,
        region,
        supplier_type,
        supply_chain_level,
        main_part_families,
        created_at,
        updated_at
      FROM suppliers
      ORDER BY name
    `;
    
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      external_id, 
      name, 
      country_code, 
      region, 
      supplier_type, 
      supply_chain_level,
      main_part_families 
    } = body;

    const result = await sql`
      INSERT INTO suppliers (
        external_id, name, country_code, region, 
        supplier_type, supply_chain_level, main_part_families
      )
      VALUES (
        ${external_id}, ${name}, ${country_code}, ${region},
        ${supplier_type}, ${supply_chain_level}, ${main_part_families || []}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const pcfObjects = await sql`
      SELECT 
        p.id,
        p.supplier_id,
        p.campaign_id,
        p.product_ref,
        p.perimeter,
        p.reference_year,
        p.total_emissions_kgco2e,
        p.method,
        p.frameworks,
        p.emission_factor_sources,
        p.uncertainty,
        p.validation_status,
        p.validation_notes,
        p.updated_at,
        s.name as supplier_name,
        c.name as campaign_name
      FROM pcf_objects p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN campaigns c ON p.campaign_id = c.id
      ORDER BY p.updated_at DESC
    `;
    
    return NextResponse.json(pcfObjects);
  } catch (error) {
    console.error('Error fetching PCF objects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PCF objects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      supplier_id,
      campaign_id,
      product_ref,
      perimeter,
      reference_year,
      total_emissions_kgco2e,
      method,
      validation_status
    } = body;

    const result = await sql`
      INSERT INTO pcf_objects (
        supplier_id, campaign_id, product_ref, perimeter,
        reference_year, total_emissions_kgco2e, method, validation_status
      )
      VALUES (
        ${supplier_id}, ${campaign_id}, ${product_ref}, ${perimeter},
        ${reference_year}, ${total_emissions_kgco2e}, ${method}, 
        ${validation_status || 'pending'}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating PCF object:', error);
    return NextResponse.json(
      { error: 'Failed to create PCF object' },
      { status: 500 }
    );
  }
}

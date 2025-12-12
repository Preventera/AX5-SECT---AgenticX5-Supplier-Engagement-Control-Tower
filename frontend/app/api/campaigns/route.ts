import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const campaigns = await sql`
      SELECT 
        id,
        name,
        type,
        objective,
        start_date,
        end_date,
        target_part_families,
        created_by,
        created_at,
        updated_at
      FROM campaigns
      ORDER BY start_date DESC
    `;
    
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      type, 
      objective, 
      start_date, 
      end_date,
      target_part_families,
      created_by 
    } = body;

    const result = await sql`
      INSERT INTO campaigns (
        name, type, objective, start_date, end_date,
        target_part_families, created_by
      )
      VALUES (
        ${name}, ${type}, ${objective}, ${start_date}, ${end_date},
        ${target_part_families || []}, ${created_by || 'system'}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

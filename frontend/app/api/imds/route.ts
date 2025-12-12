import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const submissions = await sql`
      SELECT 
        i.id,
        i.supplier_id,
        i.campaign_id,
        i.internal_ref,
        i.mds_id,
        i.part_number,
        i.oem,
        i.submitted_at,
        i.status,
        i.rejection_reason,
        i.iteration_count,
        i.updated_at,
        s.name as supplier_name,
        c.name as campaign_name
      FROM imds_submissions i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN campaigns c ON i.campaign_id = c.id
      ORDER BY i.updated_at DESC
    `;
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching IMDS submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IMDS submissions' },
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
      internal_ref,
      mds_id,
      part_number,
      oem,
      status
    } = body;

    const result = await sql`
      INSERT INTO imds_submissions (
        supplier_id, campaign_id, internal_ref, mds_id,
        part_number, oem, status
      )
      VALUES (
        ${supplier_id}, ${campaign_id}, ${internal_ref}, ${mds_id},
        ${part_number}, ${oem}, ${status || 'draft'}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating IMDS submission:', error);
    return NextResponse.json(
      { error: 'Failed to create IMDS submission' },
      { status: 500 }
    );
  }
}

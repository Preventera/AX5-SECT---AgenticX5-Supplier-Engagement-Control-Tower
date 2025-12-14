import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Récupérer les soumissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const supplierId = searchParams.get('supplier_id');
    const id = searchParams.get('id');

    // Récupérer une soumission spécifique
    if (id) {
      const submissions = await sql`
        SELECT ps.*, s.name as supplier_name
        FROM portal_submissions ps
        LEFT JOIN suppliers s ON ps.supplier_id = s.id
        WHERE ps.id = ${id}
      `;
      if (submissions.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(submissions[0]);
    }

    // Par token (portail fournisseur)
    if (token) {
      // Vérifier le token
      const tokens = await sql`
        SELECT supplier_id, campaign_id FROM supplier_access_tokens
        WHERE token = ${token} AND is_active = true AND expires_at > NOW()
      `;
      if (tokens.length === 0) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const { supplier_id, campaign_id } = tokens[0];
      
      const submissions = await sql`
        SELECT * FROM portal_submissions
        WHERE supplier_id = ${supplier_id}
        ${campaign_id ? sql`AND campaign_id = ${campaign_id}` : sql``}
        ORDER BY created_at DESC
      `;
      return NextResponse.json(submissions);
    }

    // Par fournisseur (admin)
    if (supplierId) {
      const submissions = await sql`
        SELECT ps.*, c.name as campaign_name
        FROM portal_submissions ps
        LEFT JOIN campaigns c ON ps.campaign_id = c.id
        WHERE ps.supplier_id = ${supplierId}
        ORDER BY ps.created_at DESC
      `;
      return NextResponse.json(submissions);
    }

    // Toutes les soumissions (admin)
    const submissions = await sql`
      SELECT 
        ps.*,
        s.name as supplier_name,
        c.name as campaign_name
      FROM portal_submissions ps
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      LEFT JOIN campaigns c ON ps.campaign_id = c.id
      ORDER BY ps.created_at DESC
      LIMIT 100
    `;
    return NextResponse.json(submissions);

  } catch (error) {
    console.error('GET submissions error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Créer une soumission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      token,
      submission_type,
      // IMDS fields
      mds_id,
      part_number,
      part_name,
      oem,
      // PCF fields
      product_name,
      emissions_total,
      emissions_unit,
      perimeter,
      methodology,
      reference_year,
      // Common
      notes,
      attachments
    } = body;

    // Vérifier le token
    const tokens = await sql`
      SELECT id, supplier_id, campaign_id FROM supplier_access_tokens
      WHERE token = ${token} AND is_active = true AND expires_at > NOW()
    `;
    
    if (tokens.length === 0) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
    }

    const { id: token_id, supplier_id, campaign_id } = tokens[0];

    if (!submission_type || !['imds', 'pcf'].includes(submission_type)) {
      return NextResponse.json({ error: 'submission_type invalide' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO portal_submissions (
        supplier_id, campaign_id, token_id, submission_type,
        mds_id, part_number, part_name, oem,
        product_name, emissions_total, emissions_unit, perimeter, methodology, reference_year,
        notes, attachments, status
      ) VALUES (
        ${supplier_id},
        ${campaign_id},
        ${token_id},
        ${submission_type},
        ${mds_id || null},
        ${part_number || null},
        ${part_name || null},
        ${oem || null},
        ${product_name || null},
        ${emissions_total || null},
        ${emissions_unit || 'kg CO2e'},
        ${perimeter || null},
        ${methodology || null},
        ${reference_year || null},
        ${notes || null},
        ${JSON.stringify(attachments || [])},
        'draft'
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });

  } catch (error) {
    console.error('POST submissions error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT - Mettre à jour une soumission
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      token,
      // Fields to update
      mds_id,
      part_number,
      part_name,
      oem,
      product_name,
      emissions_total,
      emissions_unit,
      perimeter,
      methodology,
      reference_year,
      notes,
      attachments,
      status,
      // Review fields (admin)
      reviewed_by,
      review_notes
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    // Si token fourni, vérifier l'accès
    if (token) {
      const tokens = await sql`
        SELECT supplier_id FROM supplier_access_tokens
        WHERE token = ${token} AND is_active = true AND expires_at > NOW()
      `;
      if (tokens.length === 0) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }

      // Vérifier que la soumission appartient au fournisseur
      const check = await sql`
        SELECT id FROM portal_submissions
        WHERE id = ${id} AND supplier_id = ${tokens[0].supplier_id}
      `;
      if (check.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Construire la mise à jour
    const updateFields: any = { updated_at: new Date().toISOString() };
    
    if (mds_id !== undefined) updateFields.mds_id = mds_id;
    if (part_number !== undefined) updateFields.part_number = part_number;
    if (part_name !== undefined) updateFields.part_name = part_name;
    if (oem !== undefined) updateFields.oem = oem;
    if (product_name !== undefined) updateFields.product_name = product_name;
    if (emissions_total !== undefined) updateFields.emissions_total = emissions_total;
    if (emissions_unit !== undefined) updateFields.emissions_unit = emissions_unit;
    if (perimeter !== undefined) updateFields.perimeter = perimeter;
    if (methodology !== undefined) updateFields.methodology = methodology;
    if (reference_year !== undefined) updateFields.reference_year = reference_year;
    if (notes !== undefined) updateFields.notes = notes;
    if (attachments !== undefined) updateFields.attachments = JSON.stringify(attachments);
    
    if (status !== undefined) {
      updateFields.status = status;
      if (status === 'submitted') {
        updateFields.submitted_at = new Date().toISOString();
      }
      if (['validated', 'rejected'].includes(status)) {
        updateFields.reviewed_at = new Date().toISOString();
        if (reviewed_by) updateFields.reviewed_by = reviewed_by;
        if (review_notes) updateFields.review_notes = review_notes;
      }
    }

    const result = await sql`
      UPDATE portal_submissions SET
        mds_id = COALESCE(${updateFields.mds_id}, mds_id),
        part_number = COALESCE(${updateFields.part_number}, part_number),
        part_name = COALESCE(${updateFields.part_name}, part_name),
        oem = COALESCE(${updateFields.oem}, oem),
        product_name = COALESCE(${updateFields.product_name}, product_name),
        emissions_total = COALESCE(${updateFields.emissions_total}, emissions_total),
        emissions_unit = COALESCE(${updateFields.emissions_unit}, emissions_unit),
        perimeter = COALESCE(${updateFields.perimeter}, perimeter),
        methodology = COALESCE(${updateFields.methodology}, methodology),
        reference_year = COALESCE(${updateFields.reference_year}, reference_year),
        notes = COALESCE(${updateFields.notes}, notes),
        status = COALESCE(${updateFields.status}, status),
        submitted_at = COALESCE(${updateFields.submitted_at}, submitted_at),
        reviewed_at = COALESCE(${updateFields.reviewed_at}, reviewed_at),
        reviewed_by = COALESCE(${updateFields.reviewed_by}, reviewed_by),
        review_notes = COALESCE(${updateFields.review_notes}, review_notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error('PUT submissions error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

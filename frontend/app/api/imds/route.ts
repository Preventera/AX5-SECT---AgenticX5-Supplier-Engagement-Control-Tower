import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Liste toutes les soumissions IMDS
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const supplierId = searchParams.get('supplier_id');

    if (id) {
      const submission = await sql`
        SELECT i.*, s.name as supplier_name 
        FROM imds_submissions i
        LEFT JOIN suppliers s ON i.supplier_id = s.id
        WHERE i.id = ${id}
      `;
      if (submission.length === 0) {
        return NextResponse.json({ error: 'Soumission non trouvée' }, { status: 404 });
      }
      return NextResponse.json(submission[0]);
    }

    if (supplierId) {
      const submissions = await sql`
        SELECT i.*, s.name as supplier_name 
        FROM imds_submissions i
        LEFT JOIN suppliers s ON i.supplier_id = s.id
        WHERE i.supplier_id = ${supplierId}
        ORDER BY i.created_at DESC
      `;
      return NextResponse.json(submissions);
    }

    const submissions = await sql`
      SELECT i.*, s.name as supplier_name 
      FROM imds_submissions i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      ORDER BY i.created_at DESC
    `;
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Erreur GET IMDS:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle soumission IMDS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      supplier_id,
      mds_id,
      part_number,
      part_name,
      oem,
      validation_status = 'pending',
      submitted_at,
      notes
    } = body;

    // Validation
    if (!supplier_id || !mds_id || !part_number) {
      return NextResponse.json(
        { error: 'supplier_id, mds_id et part_number sont requis' }, 
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO imds_submissions (
        supplier_id, mds_id, part_number, part_name, oem, 
        validation_status, submitted_at, notes, created_at, updated_at
      ) VALUES (
        ${supplier_id}, 
        ${mds_id}, 
        ${part_number}, 
        ${part_name || null},
        ${oem || null},
        ${validation_status},
        ${submitted_at || new Date().toISOString()},
        ${notes || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erreur POST IMDS:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

// PUT - Mettre à jour une soumission IMDS
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      mds_id,
      part_number,
      part_name,
      oem,
      validation_status,
      validated_at,
      notes
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Si validation, ajouter la date de validation
    const validatedDate = validation_status === 'validated' ? new Date().toISOString() : validated_at;

    const result = await sql`
      UPDATE imds_submissions SET
        mds_id = COALESCE(${mds_id}, mds_id),
        part_number = COALESCE(${part_number}, part_number),
        part_name = COALESCE(${part_name}, part_name),
        oem = COALESCE(${oem}, oem),
        validation_status = COALESCE(${validation_status}, validation_status),
        validated_at = ${validatedDate || null},
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Soumission non trouvée' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erreur PUT IMDS:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE - Supprimer une soumission IMDS
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM imds_submissions WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Soumission non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Soumission supprimée', submission: result[0] });
  } catch (error) {
    console.error('Erreur DELETE IMDS:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

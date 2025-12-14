import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Liste toutes les déclarations PCF
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const supplierId = searchParams.get('supplier_id');

    if (id) {
      const pcf = await sql`
        SELECT p.*, s.name as supplier_name 
        FROM pcf_declarations p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.id = ${id}
      `;
      if (pcf.length === 0) {
        return NextResponse.json({ error: 'Déclaration PCF non trouvée' }, { status: 404 });
      }
      return NextResponse.json(pcf[0]);
    }

    if (supplierId) {
      const pcfs = await sql`
        SELECT p.*, s.name as supplier_name 
        FROM pcf_declarations p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.supplier_id = ${supplierId}
        ORDER BY p.created_at DESC
      `;
      return NextResponse.json(pcfs);
    }

    const pcfs = await sql`
      SELECT p.*, s.name as supplier_name 
      FROM pcf_declarations p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json(pcfs);
  } catch (error) {
    console.error('Erreur GET PCF:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle déclaration PCF
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      supplier_id,
      product_ref,
      product_name,
      perimeter = 'cradle-to-gate',
      reference_year,
      total_emissions_kgco2e,
      method = 'ISO 14067',
      validation_status = 'pending',
      notes
    } = body;

    // Validation
    if (!supplier_id || !product_ref || !total_emissions_kgco2e) {
      return NextResponse.json(
        { error: 'supplier_id, product_ref et total_emissions_kgco2e sont requis' }, 
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO pcf_declarations (
        supplier_id, product_ref, product_name, perimeter, reference_year,
        total_emissions_kgco2e, method, validation_status, notes, created_at, updated_at
      ) VALUES (
        ${supplier_id}, 
        ${product_ref}, 
        ${product_name || null},
        ${perimeter},
        ${reference_year || new Date().getFullYear()},
        ${total_emissions_kgco2e},
        ${method},
        ${validation_status},
        ${notes || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erreur POST PCF:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

// PUT - Mettre à jour une déclaration PCF
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      product_ref,
      product_name,
      perimeter,
      reference_year,
      total_emissions_kgco2e,
      method,
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
      UPDATE pcf_declarations SET
        product_ref = COALESCE(${product_ref}, product_ref),
        product_name = COALESCE(${product_name}, product_name),
        perimeter = COALESCE(${perimeter}, perimeter),
        reference_year = COALESCE(${reference_year}, reference_year),
        total_emissions_kgco2e = COALESCE(${total_emissions_kgco2e}, total_emissions_kgco2e),
        method = COALESCE(${method}, method),
        validation_status = COALESCE(${validation_status}, validation_status),
        validated_at = ${validatedDate || null},
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Déclaration PCF non trouvée' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erreur PUT PCF:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE - Supprimer une déclaration PCF
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM pcf_declarations WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Déclaration PCF non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Déclaration PCF supprimée', pcf: result[0] });
  } catch (error) {
    console.error('Erreur DELETE PCF:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

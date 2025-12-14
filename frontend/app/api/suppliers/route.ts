import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Liste tous les fournisseurs ou un fournisseur spécifique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const supplier = await sql`
        SELECT * FROM suppliers WHERE id = ${id}
      `;
      if (supplier.length === 0) {
        return NextResponse.json({ error: 'Fournisseur non trouvé' }, { status: 404 });
      }
      return NextResponse.json(supplier[0]);
    }

    const suppliers = await sql`
      SELECT * FROM suppliers ORDER BY created_at DESC
    `;
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Erreur GET suppliers:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau fournisseur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      contact_email,  // from frontend
      contact_name, 
      tier, 
      country, 
      city,
      industry,
      status = 'active'
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Nom est requis' }, 
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO suppliers (
        name, email, contact_name, tier, country, city, industry, status, created_at, updated_at
      ) VALUES (
        ${name}, 
        ${contact_email || null}, 
        ${contact_name || null}, 
        ${tier || 1}, 
        ${country || null}, 
        ${city || null},
        ${industry || null},
        ${status},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erreur POST supplier:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

// PUT - Mettre à jour un fournisseur
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      name, 
      contact_email,  // from frontend, maps to 'email' column
      contact_name, 
      tier, 
      country, 
      city,
      industry,
      status
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const result = await sql`
      UPDATE suppliers SET
        name = COALESCE(${name}, name),
        email = COALESCE(${contact_email}, email),
        contact_name = COALESCE(${contact_name}, contact_name),
        tier = COALESCE(${tier}, tier),
        country = COALESCE(${country}, country),
        city = COALESCE(${city}, city),
        industry = COALESCE(${industry}, industry),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Fournisseur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erreur PUT supplier:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE - Supprimer un fournisseur
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM suppliers WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Fournisseur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Fournisseur supprimé', supplier: result[0] });
  } catch (error) {
    console.error('Erreur DELETE supplier:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

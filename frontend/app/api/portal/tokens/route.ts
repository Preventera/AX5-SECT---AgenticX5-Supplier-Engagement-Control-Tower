import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

// Générer un token unique
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// GET - Vérifier un token ou lister les tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const supplierId = searchParams.get('supplier_id');

    // Vérifier un token spécifique
    if (token) {
      const tokens = await sql`
        SELECT 
          t.*,
          s.name as supplier_name,
          s.email as supplier_email,
          c.name as campaign_name
        FROM supplier_access_tokens t
        LEFT JOIN suppliers s ON t.supplier_id = s.id
        LEFT JOIN campaigns c ON t.campaign_id = c.id
        WHERE t.token = ${token}
          AND t.is_active = true
          AND t.expires_at > NOW()
      `;

      if (tokens.length === 0) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Token invalide ou expiré' 
        }, { status: 401 });
      }

      // Mettre à jour l'utilisation
      await sql`
        UPDATE supplier_access_tokens 
        SET last_used_at = NOW(), use_count = use_count + 1
        WHERE token = ${token}
      `;

      return NextResponse.json({ 
        valid: true, 
        data: tokens[0] 
      });
    }

    // Lister les tokens d'un fournisseur
    if (supplierId) {
      const tokens = await sql`
        SELECT 
          t.*,
          c.name as campaign_name
        FROM supplier_access_tokens t
        LEFT JOIN campaigns c ON t.campaign_id = c.id
        WHERE t.supplier_id = ${supplierId}
        ORDER BY t.created_at DESC
      `;
      return NextResponse.json(tokens);
    }

    // Lister tous les tokens (admin)
    const tokens = await sql`
      SELECT 
        t.*,
        s.name as supplier_name,
        c.name as campaign_name
      FROM supplier_access_tokens t
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      LEFT JOIN campaigns c ON t.campaign_id = c.id
      ORDER BY t.created_at DESC
      LIMIT 100
    `;
    return NextResponse.json(tokens);

  } catch (error) {
    console.error('GET tokens error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Créer un token d'accès
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      supplier_id, 
      campaign_id, 
      contact_email, 
      contact_name,
      expires_days = 30,
      created_by
    } = body;

    if (!supplier_id || !contact_email) {
      return NextResponse.json({ 
        error: 'supplier_id et contact_email requis' 
      }, { status: 400 });
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_days);

    const result = await sql`
      INSERT INTO supplier_access_tokens (
        supplier_id, campaign_id, token, contact_email, contact_name, 
        expires_at, created_by
      ) VALUES (
        ${supplier_id},
        ${campaign_id || null},
        ${token},
        ${contact_email},
        ${contact_name || null},
        ${expiresAt.toISOString()},
        ${created_by || null}
      )
      RETURNING *
    `;

    // Générer l'URL du portail
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ax-5-sect-agentic-x5-supplier-engag.vercel.app'}/portal?token=${token}`;

    return NextResponse.json({
      ...result[0],
      portal_url: portalUrl
    }, { status: 201 });

  } catch (error) {
    console.error('POST tokens error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Révoquer un token
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const token = searchParams.get('token');

    if (!id && !token) {
      return NextResponse.json({ error: 'id ou token requis' }, { status: 400 });
    }

    let result;
    if (id) {
      result = await sql`
        UPDATE supplier_access_tokens 
        SET is_active = false 
        WHERE id = ${id}
        RETURNING id, token
      `;
    } else {
      result = await sql`
        UPDATE supplier_access_tokens 
        SET is_active = false 
        WHERE token = ${token}
        RETURNING id, token
      `;
    }

    if (result.length === 0) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Token révoqué', data: result[0] });

  } catch (error) {
    console.error('DELETE tokens error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

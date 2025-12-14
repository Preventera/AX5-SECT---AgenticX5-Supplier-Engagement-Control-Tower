import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Récupérer un utilisateur par email ou ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (email) {
      const users = await sql`
        SELECT id, email, name, avatar_url, role, department, job_title, 
               language, theme, is_active, last_login_at, created_at
        FROM users 
        WHERE email = ${email} AND is_active = true
      `;
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(users[0]);
    }

    if (id) {
      const users = await sql`
        SELECT id, email, name, avatar_url, role, department, job_title,
               language, theme, is_active, last_login_at, created_at
        FROM users 
        WHERE id = ${id}
      `;
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(users[0]);
    }

    // Liste tous les utilisateurs (admin only - à protéger)
    const users = await sql`
      SELECT id, email, name, avatar_url, role, department, job_title,
             language, theme, is_active, last_login_at, created_at
      FROM users 
      ORDER BY created_at DESC
    `;
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Créer un utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role = 'viewer', department, job_title, language = 'fr' } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required' }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO users (email, name, role, department, job_title, language)
      VALUES (${email}, ${name}, ${role}, ${department || null}, ${job_title || null}, ${language})
      RETURNING id, email, name, role, department, job_title, language, theme, created_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT - Mettre à jour un utilisateur
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, role, department, job_title, language, theme, is_active, last_login_at } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE users SET
        name = COALESCE(${name}, name),
        role = COALESCE(${role}, role),
        department = COALESCE(${department}, department),
        job_title = COALESCE(${job_title}, job_title),
        language = COALESCE(${language}, language),
        theme = COALESCE(${theme}, theme),
        is_active = COALESCE(${is_active}, is_active),
        last_login_at = COALESCE(${last_login_at}, last_login_at),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, name, role, department, job_title, language, theme, is_active
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Désactiver un utilisateur (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE users SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deactivated', user: result[0] });
  } catch (error) {
    console.error('DELETE users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

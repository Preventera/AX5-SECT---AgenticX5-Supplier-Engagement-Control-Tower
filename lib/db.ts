import { neon } from '@neondatabase/serverless';

// Connexion à la base de données Neon
const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Helper pour les requêtes
export async function query<T>(queryText: string, params?: any[]): Promise<T[]> {
  try {
    const result = await sql(queryText, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Compter les fournisseurs
    const suppliersCount = await sql`SELECT COUNT(*) as count FROM suppliers`;
    
    // Compter par niveau
    const tier1Count = await sql`
      SELECT COUNT(*) as count FROM suppliers 
      WHERE supply_chain_level = 'Tier-1'
    `;
    const tier2Count = await sql`
      SELECT COUNT(*) as count FROM suppliers 
      WHERE supply_chain_level = 'Tier-2'
    `;
    
    // Compter PCF avec maturité intermédiaire+
    const pcfIntermediateCount = await sql`
      SELECT COUNT(DISTINCT supplier_id) as count FROM pcf_objects 
      WHERE validation_status = 'validated'
    `;
    
    // Compter les campagnes actives
    const activeCampaignsCount = await sql`
      SELECT COUNT(*) as count FROM campaigns 
      WHERE end_date >= CURRENT_DATE
    `;
    
    // Compter les soumissions IMDS par statut
    const imdsStats = await sql`
      SELECT status, COUNT(*) as count 
      FROM imds_submissions 
      GROUP BY status
    `;
    
    // Compter les PCF par statut
    const pcfStats = await sql`
      SELECT validation_status as status, COUNT(*) as count 
      FROM pcf_objects 
      GROUP BY validation_status
    `;
    
    // Total IMDS et PCF
    const totalImds = await sql`SELECT COUNT(*) as count FROM imds_submissions`;
    const totalPcf = await sql`SELECT COUNT(*) as count FROM pcf_objects`;

    const stats = {
      totalSuppliers: Number(suppliersCount[0]?.count || 0),
      tier1: Number(tier1Count[0]?.count || 0),
      tier2: Number(tier2Count[0]?.count || 0),
      pcfIntermediatePlus: Number(pcfIntermediateCount[0]?.count || 0),
      activeCampaigns: Number(activeCampaignsCount[0]?.count || 0),
      totalImds: Number(totalImds[0]?.count || 0),
      totalPcf: Number(totalPcf[0]?.count || 0),
      imdsStats: imdsStats.reduce((acc: any, row: any) => {
        acc[row.status] = Number(row.count);
        return acc;
      }, {}),
      pcfStats: pcfStats.reduce((acc: any, row: any) => {
        acc[row.status] = Number(row.count);
        return acc;
      }, {})
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

// Mock saved grants for Alex (initial dashboard load)
const MOCK_GRANTS = [
  {
    id: 'ca-dream-fund',
    name: 'California Dream Fund',
    amount: '$8,500/year',
    deadline: '2026-08-15',
    status: 'eligible',
    requirements: ['AB540 status', 'California resident 3+ years'],
  },
  {
    id: 'bay-area-stem',
    name: 'Bay Area STEM Immigrant Scholarship',
    amount: '$5,000 one-time',
    deadline: '2026-09-01',
    status: 'eligible',
    requirements: ['STEM major', 'immigrant status'],
  },
  {
    id: 'pell-grant',
    name: 'Federal Pell Grant',
    amount: '$7,395 max',
    deadline: '2026-06-30',
    status: 'ineligible',
    requirements: ['U.S. citizen or eligible noncitizen', 'FAFSA completion'],
    warning: 'H4 visa holders are ineligible.',
  },
];

export async function GET() {
  return NextResponse.json(MOCK_GRANTS);
}

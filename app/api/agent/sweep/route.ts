import { NextRequest, NextResponse } from 'next/server';
import { routePrompt } from '../../../../lib/tokenrouter';
import { brightdata } from '../../../../lib/brightdata';
import { evermind } from '../../../../lib/evermind';
import type { Grant } from '../../../../types';

// Mock user ID for demo
const DEMO_USER_ID = 'user_alex_h4';

export async function POST(request: NextRequest) {
  try {
    // 1. Run daily sweep — 3 mock URLs
    const urls = [
      'https://californiadreamfund.org/eligibility',
      'https://bayareastem.org/scholarships',
      'https://ed.gov/pell-eligibility',
    ];

    const scrapeResults = await brightdata.runDailySweep(urls);

    // 2. Get yesterday's grants
    const yesterdayGrants = await evermind.getYesterdaySnapshot(DEMO_USER_ID);

    // 3. Simulate today's grants (with deliberate delta)
    const todayGrants: Grant[] = [
      {
        id: 'ca-dream-fund',
        name: 'California Dream Fund',
        amount: '$8,500/year',
        deadline: '2026-08-15',
        status: 'ineligible', // changed from 'eligible'
        requirements: ['AB540 status', 'CA resident 3+ years', 'EAD required'],
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
        requirements: ['U.S. citizen or eligible noncitizen', 'FAFSA'],
      },
      {
        id: 'bay-area-tech-merit',
        name: 'Bay Area Tech Merit Fund',
        amount: '$3,000',
        deadline: '2026-10-15',
        status: 'new',
        requirements: ['Statistics major', 'Sunnyvale resident'],
      },
    ];

    // 4. Detect deltas
    const deltas = evermind.detectDeltas(yesterdayGrants, todayGrants);

    // 5. Generate AI explanations per delta
    const alerts: any[] = [];
    const newGrants: any[] = [];

    for (const delta of deltas) {
      if (delta.type === 'status_change' && delta.status === 'ineligible') {
        // DEEP_ROUTE: policy reasoning for eligibility loss
        const explanation = await routePrompt(
          'deep',
          `You are a legal policy analyst specializing in U.S. financial aid for H4 visa holders. Analyze the change below and explain in plain English: why it matters, who it affects, and what action the student should take. Be precise, cite the rule change, and avoid jargon.`,
          `Grant '${delta.grant.name}' changed from 'eligible' to 'ineligible'. New requirement added: 'EAD required'. Previous requirements: ['AB540 status', 'CA resident 3+ years']. Student profile: H4 visa, Statistics major, Sunnyvale CA.`
        );

        alerts.push({
          id: `alert_${Date.now()}_inelig_${delta.grant.id}`,
          type: 'critical',
          title: `CRITICAL: ${delta.grant.name} eligibility lost`,
          message: explanation,
          detectedBy: ['Bright Data', 'TokenRouter'],
          timestamp: new Date().toISOString(),
        });
      }

      if (delta.type === 'new_grant') {
        // FAST_ROUTE: extract & rank
        const summary = await routePrompt(
          'fast',
          `Extract grant name, amount, deadline, and top 2 matching criteria from this text. Return as JSON: {name, amount, deadline, matchReason}. Do NOT add commentary.`,
          `New grant: Bay Area Tech Merit Fund — $3,000 — Deadline: Oct 15, 2026 — For Statistics majors who live in Sunnyvale.`
        );

        try {
          const parsed = JSON.parse(summary);
          newGrants.push({
            ...delta.grant,
            matchScore: 94,
            matchReason: parsed.matchReason || 'Statistics major + Sunnyvale resident',
          });
        } catch {
          newGrants.push({
            ...delta.grant,
            matchScore: 94,
            matchReason: 'Statistics major + Sunnyvale resident',
          });
        }
      }
    }

    // 6. Save today's snapshot
    await evermind.saveGrantSnapshot(DEMO_USER_ID, todayGrants);

    return NextResponse.json({
      alerts,
      updatedGrants: todayGrants.filter(g => !newGrants.find(n => n.id === g.id)),
      newGrants,
    });
  } catch (error) {
    console.error('[API] /api/agent/sweep error:', error);
    return NextResponse.json(
      { error: 'Sweep failed' },
      { status: 500 }
    );
  }
}

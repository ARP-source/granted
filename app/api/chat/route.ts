import { NextRequest, NextResponse } from 'next/server';

async function safeRoutePrompt(
  task: 'fast' | 'deep',
  systemPrompt: string,
  userMessage: string,
  fallback: string
): Promise<string> {
  try {
    const { routePrompt } = await import('../../../lib/tokenrouter');
    return await routePrompt(task, systemPrompt, userMessage);
  } catch (err) {
    console.warn(`[TokenRouter] ${task} call failed, using fallback:`, err);
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, grantContext, userProfile, history } = await request.json();

    const profileSummary = userProfile
      ? `User profile: ${userProfile.name || 'Unknown'}, ${userProfile.immigrationStatus || 'Not specified'}, ${userProfile.school || 'No school'}, ${userProfile.major || 'No major'}, ${userProfile.location || 'No location'}${userProfile.gpa ? `, GPA: ${userProfile.gpa}` : ''}${userProfile.circumstances?.length ? `, Circumstances: ${userProfile.circumstances.join(', ')}` : ''}.`
      : 'No user profile provided.';

    const grantSummary = grantContext
      ? `Grant: ${grantContext.name}, Amount: ${grantContext.amount}, Deadline: ${grantContext.deadline}, Status: ${grantContext.status}, Requirements: ${grantContext.requirements?.join(', ') || 'None listed'}.`
      : 'No specific grant selected.';

    const recentHistory = (history || [])
      .slice(-6)
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are GrantForge AI, a knowledgeable funding advisor. You help students, founders, and researchers navigate grants, scholarships, and funding opportunities. You provide specific, actionable advice about eligibility, application strategy, required documents, timelines, and how to strengthen applications.

${profileSummary}

${grantSummary}

Be concise but thorough. When the user asks about eligibility, cross-reference their profile with the grant requirements. When they ask for help applying, give step-by-step guidance. If you detect a potential issue (like immigration status vs. requirements), flag it clearly.`;

    const fullMessage = recentHistory
      ? `Previous conversation:\n${recentHistory}\n\nUser's new message: ${message}`
      : message;

    const fallbackResponse = generateFallback(message, grantContext, userProfile);

    const response = await safeRoutePrompt('deep', systemPrompt, fullMessage, fallbackResponse);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('[API] /api/chat error:', error);
    return NextResponse.json(
      { response: 'I encountered an error processing your request. Please try again.' },
      { status: 200 }
    );
  }
}

function generateFallback(message: string, grant: any, profile: any): string {
  const msg = (message || '').toLowerCase();
  const name = grant?.name || 'this grant';

  if (msg.includes('eligible') || msg.includes('qualify')) {
    const issues: string[] = [];
    if (profile?.immigrationStatus && grant?.requirements) {
      const reqs = grant.requirements.join(' ').toLowerCase();
      if (reqs.includes('citizen') && !['u.s. citizen', 'citizen'].includes(profile.immigrationStatus.toLowerCase())) {
        issues.push(`This grant requires U.S. citizenship, but your status is listed as "${profile.immigrationStatus}".`);
      }
    }
    if (issues.length > 0) {
      return `Based on your profile, there may be eligibility concerns for ${name}:\n\n${issues.join('\n')}\n\nI'd recommend reviewing the full requirements carefully and contacting the grant administrator if you're unsure.`;
    }
    return `Based on your profile, you appear to meet the basic criteria for ${name}. Requirements include: ${grant?.requirements?.join(', ') || 'not specified'}. I'd recommend gathering your documents early and reaching out to the program office for any clarifying questions.`;
  }

  if (msg.includes('document') || msg.includes('need') || msg.includes('require')) {
    return `For ${name}, you'll typically need:\n\n1. **Proof of enrollment** — transcript or enrollment verification letter\n2. **Financial documentation** — FAFSA, tax returns, or income verification\n3. **Personal statement** — explaining your goals and why you're a strong candidate\n4. **Letters of recommendation** — usually 1-2 from professors or mentors\n5. **ID/residency proof** — varies by grant requirements\n\nDeadline: ${grant?.deadline || 'Check the official website'}. Start gathering these at least 3-4 weeks before the deadline.`;
  }

  if (msg.includes('timeline') || msg.includes('plan') || msg.includes('strategy')) {
    return `Here's a recommended timeline for ${name}:\n\n**4 weeks before deadline:**\n- Review all requirements and eligibility criteria\n- Request letters of recommendation\n- Start drafting your personal statement\n\n**2 weeks before:**\n- Complete application forms\n- Finalize personal statement\n- Gather all supporting documents\n\n**1 week before:**\n- Final review of all materials\n- Submit application\n- Save confirmation/receipt\n\nDeadline: ${grant?.deadline || 'TBD'}`;
  }

  if (msg.includes('personal statement') || msg.includes('essay') || msg.includes('write')) {
    return `For your personal statement for ${name}, consider this structure:\n\n1. **Opening hook** — A specific moment that connects to your funding need\n2. **Your background** — ${profile?.immigrationStatus ? `Your experience as a ${profile.immigrationStatus} student` : 'Your unique background'} and how it shapes your goals\n3. **Academic/professional goals** — What you're studying (${profile?.major || 'your field'}) and where you're headed\n4. **Why this funding matters** — Specific impact on your education and career\n5. **Closing** — How you'll give back or contribute to the community\n\nKeep it under 500 words unless otherwise specified. Be authentic and specific.`;
  }

  return `I can help you with ${name}. Here are some things I can assist with:\n\n• **Eligibility check** — Compare your profile against requirements\n• **Application strategy** — Timeline and step-by-step plan\n• **Document preparation** — What you need to gather\n• **Personal statement** — Structure and writing tips\n• **Deadline tracking** — Key dates to remember\n\nWhat would you like to focus on?`;
}

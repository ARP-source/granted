import { NextRequest, NextResponse } from 'next/server';
import { evermind } from '../../../../lib/evermind';

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json();
    await evermind.saveUserProfile('user_alex_h4', profile);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API] /api/user/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

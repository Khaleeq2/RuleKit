import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    // Mock stats data
    return NextResponse.json({
      totalRules: 12,
      totalAssets: 8,
      validations: 45,
      passRate: 92,
      passRateTrend: 3, // +3%
      decisionsTrend: 5, // +5
      lastRuleUpdate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      lastAssetUpload: new Date(now.getTime() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

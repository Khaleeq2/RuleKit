import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    // Mock validation results
    return NextResponse.json([
      {
        id: '1',
        assetName: 'brand-guide.pdf',
        status: 'passed',
        passedRules: 12,
        failedRules: 0,
        ruleName: 'Logo Usage Check',
        timestamp: now.toISOString(),
      },
      {
        id: '2',
        assetName: 'social-post-v2.png',
        status: 'failed',
        passedRules: 5,
        failedRules: 2,
        ruleName: 'Color Palette Validation',
        timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      },
      {
        id: '3',
        assetName: 'marketing-banner.jpg',
        status: 'passed',
        passedRules: 10,
        failedRules: 0,
        ruleName: 'Typography Standards',
        timestamp: new Date(now.getTime() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      },
      {
        id: '4',
        assetName: 'product-icon-set.svg',
        status: 'passed',
        passedRules: 15,
        failedRules: 0,
        ruleName: 'Icon Set Consistency',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      },
      {
        id: '5',
        assetName: 'hero-illustration.png',
        status: 'failed',
        passedRules: 3,
        failedRules: 1,
        ruleName: 'Accessibility Contrast',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch validations' },
      { status: 500 }
    );
  }
}

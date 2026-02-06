import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock assets data
    return NextResponse.json([
      {
        id: '1',
        name: 'document.pdf',
        size: 1024000,
        uploadedAt: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Mock validation run
    return NextResponse.json(
      {
        success: true,
        message: 'Validation completed',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run validation' },
      { status: 500 }
    );
  }
}

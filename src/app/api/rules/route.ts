import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock rules data
    return NextResponse.json([
      {
        id: '1',
        name: 'Email Validation',
        description: 'Validates email format',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Phone Number Check',
        description: 'Validates phone numbers',
        createdAt: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(
      {
        id: Math.random().toString(36).substr(2, 9),
        ...body,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock signup - in production, this would call Supabase or your auth service
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: { email, name },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

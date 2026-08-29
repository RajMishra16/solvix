import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = await cookies();

    // Clear the auth cookie
    cookieStore.delete('Solvix_auth');

    return NextResponse.json({ success: true });
}

export async function GET() {
    const cookieStore = await cookies();

    // Clear the auth cookie
    cookieStore.delete('Solvix_auth');

    // Redirect to home page
    return NextResponse.redirect(new URL('/', process.env.APP_BASE_URL || 'http://localhost:3000'));
}

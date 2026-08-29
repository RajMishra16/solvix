import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('Solvix_auth');

    if (!authCookie) {
        return NextResponse.json({ authenticated: false });
    }

    try {
        const session = JSON.parse(authCookie.value);

        // Check if session is expired
        if (session.expiresAt && session.expiresAt < Date.now()) {
            cookieStore.delete('Solvix_auth');
            return NextResponse.json({ authenticated: false });
        }

        return NextResponse.json({
            authenticated: true,
            user: session.user,
        });
    } catch {
        return NextResponse.json({ authenticated: false });
    }
}

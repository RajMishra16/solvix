import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Supabase login
        const loginResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            console.error('Supabase login error:', loginData);

            return NextResponse.json(
                { error: loginData.error_description || 'Invalid credentials' },
                { status: 401 }
            );
        }

        const session = loginData;
        const user = loginData.user;

        // Store tokens in HTTP-only cookie
        const cookieStore = await cookies();

        const sessionData = {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: Date.now() + (session.expires_in * 1000),
            user: {
                sub: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.email?.split('@')[0],
                picture: null,
            },
        };

        cookieStore.set('Solvix_auth', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: session.expires_in,
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: sessionData.user,
        });

    } catch (error) {
        console.error('Login error:', error);

        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
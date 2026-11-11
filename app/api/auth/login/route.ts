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

        const demoEmail = process.env.DEV_LOGIN_EMAIL?.toLowerCase();
        const demoPassword = process.env.DEV_LOGIN_PASSWORD;

        if (demoEmail && demoPassword && email.toLowerCase() === demoEmail && password === demoPassword) {
            const cookieStore = await cookies();
            const sessionData = {
                accessToken: 'demo-access-token',
                refreshToken: 'demo-refresh-token',
                expiresAt: Date.now() + (60 * 60 * 1000),
                user: {
                    sub: 'demo-user',
                    email: email.toLowerCase(),
                    name: email.split('@')[0],
                    picture: null,
                },
            };

            cookieStore.set('Solvix_auth', JSON.stringify(sessionData), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60,
                path: '/',
            });

            return NextResponse.json({
                success: true,
                user: sessionData.user,
            });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json(
                { error: 'Authentication is not configured. Please contact support.' },
                { status: 500 }
            );
        }

        try {
            const loginResponse = await fetch(
                `${supabaseUrl}/auth/v1/token?grant_type=password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseAnonKey,
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            const loginData = await loginResponse.json();

            if (!loginResponse.ok) {
                console.error('Supabase login error:', loginData);

                return NextResponse.json(
                    { error: loginData.error_description || loginData.error || 'Invalid credentials' },
                    { status: 401 }
                );
            }

            const session = loginData;
            const user = loginData.user;

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
            console.error('Supabase login request failed:', error);

            return NextResponse.json(
                { error: 'Authentication service is unavailable. Please try again later.' },
                { status: 503 }
            );
        }
    } catch (error) {
        console.error('Login error:', error);

        return NextResponse.json(
            { error: 'Authentication service is unavailable. Please try again later.' },
            { status: 503 }
        );
    }
}
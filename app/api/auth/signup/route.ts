import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Supabase signup
        const signupResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                },
                body: JSON.stringify({
                    email,
                    password,
                    data: {
                        name: name || email.split('@')[0],
                    },
                }),
            }
        );

        const signupData = await signupResponse.json();

        if (!signupResponse.ok) {
            console.error('Signup error:', signupData);

            let errorMessage = 'Failed to create account';

            if (signupData.error_description) {
                errorMessage = signupData.error_description;
            } else if (signupData.error) {
                errorMessage = signupData.error;
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            );
        }

        // Supabase returns session if email confirmation disabled
        const session = signupData.session;
        const user = signupData.user;

        if (!session) {
            return NextResponse.json({
                success: true,
                message: 'Account created. Please verify your email.',
                requiresLogin: true,
            });
        }

        const cookieStore = await cookies();

        const sessionData = {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: Date.now() + (session.expires_in * 1000),
            user: {
                sub: user.id,
                email: user.email,
                name: user.user_metadata?.name || name || email.split('@')[0],
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
        console.error('Signup error:', error);

        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
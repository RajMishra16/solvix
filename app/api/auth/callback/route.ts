import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        console.error('OAuth error:', error, searchParams.get('error_description'));
        return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: process.env.AUTH0_CLIENT_ID,
                    client_secret: process.env.AUTH0_CLIENT_SECRET,
                    code,
                    redirect_uri: `${process.env.APP_BASE_URL}/api/auth/callback`,
                }),
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Token exchange error:', tokenData);
            return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
        }

        // Get user info
        const userInfoResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/userinfo`,
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            }
        );

        const userInfo = await userInfoResponse.json();

        // Create session cookie
        const cookieStore = await cookies();

        const sessionData = {
            accessToken: tokenData.access_token,
            idToken: tokenData.id_token,
            expiresAt: Date.now() + (tokenData.expires_in * 1000),
            user: {
                sub: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name || userInfo.nickname || userInfo.email?.split('@')[0],
                picture: userInfo.picture,
            },
        };

        cookieStore.set('Solvix_auth', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: tokenData.expires_in || 86400,
            path: '/',
        });

        // Redirect to home
        return NextResponse.redirect(new URL('/home', request.url));
    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getSafeRedirectPath(path: string | null) {
    return path?.startsWith('/') && !path.startsWith('//') && !path.includes('\\')
        ? path
        : '/home';
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = getSafeRedirectPath(searchParams.get('next'));

    if (searchParams.has('error')) {
        return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }

    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        const response = NextResponse.redirect(new URL(next, request.url));
        response.cookies.delete('Solvix_auth');
        return response;
    } catch (error) {
        console.error('Supabase auth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }
}

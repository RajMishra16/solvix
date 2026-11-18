import { redirect } from 'next/navigation';
import LoginClient from './login-client';
import { createClient } from '@/lib/supabase/server';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        redirect('/home');
    }

    return <LoginClient authError={Boolean(error)} />;
}

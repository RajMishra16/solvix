import { redirect } from 'next/navigation';
import RegisterClient from './register-client';
import { createClient } from '@/lib/supabase/server';

export default async function RegisterPage({
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

    return <RegisterClient authError={Boolean(error)} />;
}

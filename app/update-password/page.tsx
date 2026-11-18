import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UpdatePasswordClient from './update-password-client';

export default async function UpdatePasswordPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/forgot-password');
    }

    return <UpdatePasswordClient />;
}

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RegisterClient from './register-client';

export default async function RegisterPage() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('Solvix_auth');

    if (authCookie) {
        redirect('/home');
    }

    return <RegisterClient />;
}

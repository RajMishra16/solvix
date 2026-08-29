import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginClient from './login-client';

export default async function LoginPage() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('Solvix_auth');

    if (authCookie) {
        redirect('/home');
    }

    return <LoginClient />;
}

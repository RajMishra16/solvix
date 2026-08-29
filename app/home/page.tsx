import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HomeClient from './home-client';

export default async function HomePage() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('Solvix_auth');

    if (!authCookie) {
        redirect('/login');
    }

    return <HomeClient />;
}

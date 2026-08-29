import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Hero, HowItWorks, StatsBar, Testimonials, FinalCTA, Footer } from "@/components/landing"

export default async function Page() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('Solvix_auth');

  if (authCookie) {
    redirect('/home');
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <HowItWorks />
      <StatsBar />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  )
}

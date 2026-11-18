import { redirect } from 'next/navigation';
import { Hero, HowItWorks, StatsBar, Testimonials, FinalCTA, Footer } from "@/components/landing"
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
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

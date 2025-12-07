import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import HowItWorks from "@/components/how-it-works";
import RecentBlogs from "@/components/recent-blogs";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Force dynamic rendering to check auth status on every request
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <RecentBlogs />
    </main>
  );
}

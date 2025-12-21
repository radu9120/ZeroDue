import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import HowItWorks from "@/components/how-it-works";
import RecentBlogs from "@/components/recent-blogs";
import IndustriesSection from "@/components/industries-section";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewsSchema, HowToSchema } from "@/components/seo/StructuredData";

// Force dynamic rendering to check auth status on every request
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <>
      <ReviewsSchema />
      <HowToSchema />
      <main className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
        <Hero />
        <HowItWorks />
        <Features />
        <IndustriesSection />
        <Pricing />
        <Testimonials />
        <RecentBlogs />
      </main>
    </>
  );
}

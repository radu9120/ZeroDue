import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import HowItWorks from "@/components/how-it-works";
import FAQ from "@/components/faq";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
    </main>
  );
}

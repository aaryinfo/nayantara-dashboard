import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navigation />
      <HeroSection />
    </main>
  );
}

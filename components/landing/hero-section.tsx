"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-black">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-80"
        >
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-hero-0BnFGdr81Ifnj3WbBZoNt1KE4D5DMT.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-white/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-white/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-32 flex flex-col items-center text-center">
        
        {/* Logo and Main headline */}
        <div 
          className={`mb-8 flex flex-col items-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <Image 
              src="/logo.png" 
              alt="Nayantara Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-[clamp(3rem,8vw,5.5rem)] font-display leading-[0.92] tracking-tight text-white drop-shadow-xl">
            Nayantara <span className="word-gradient">Opticals</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70 font-sans tracking-wide">
            Intelligent Cash & Branch Management
          </p>
        </div>

        {/* Auth Buttons */}
        <div 
          className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <SignInButton mode="modal">
            <Button size="lg" className="h-12 px-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all hover-lift font-medium tracking-wide">
              Sign In
            </Button>
          </SignInButton>
          
          <SignUpButton mode="modal">
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full bg-transparent hover:bg-white/5 text-white border-white/30 hover:border-white/50 backdrop-blur-sm transition-all hover-lift font-medium tracking-wide">
              Request Access
            </Button>
          </SignUpButton>
        </div>
      </div>

    </section>
  );
}

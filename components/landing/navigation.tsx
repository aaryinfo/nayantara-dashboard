"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Capabilities",  href: "#features"      },
  { name: "Process",       href: "#how-it-works"  },
  { name: "Infra",         href: "#infra"          },
  { name: "Integrations",  href: "#integrations"  },
  { name: "Security",      href: "#security"      },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled 
          ? "top-4 left-4 right-4" 
          : "top-0 left-0 right-0"
      }`}
    >
      <nav 
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div 
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center text-[#00b4b4]">
              <svg width="28" height="20" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 12L12 22L18 16L24 22L34 12L24 2L18 8L12 2Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col items-start leading-none mt-1">
              <span className={`font-sans font-medium tracking-tight transition-all duration-500 ${isScrolled ? "text-xl text-foreground" : "text-2xl text-white"}`}>
                Nayantara
              </span>
              <span className={`font-sans tracking-tight transition-all duration-500 ${isScrolled ? "text-sm text-foreground/80" : "text-base text-white/80"} ml-auto -mt-1 mr-1`}>
                Opticals
              </span>
            </div>
            <span className={`font-mono transition-all duration-500 ${isScrolled ? "text-[10px] -mt-4 text-muted-foreground" : "text-xs -mt-5 text-white/60"}`}>TM</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {/* Nav links removed as per user request */}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Removed as auth is now in hero section */}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </nav>
      
      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMobileMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            {/* Nav links removed as per user request */}
          </div>
          
          {/* Bottom CTAs */}
          <div className={`flex flex-col gap-4 pt-8 border-t border-foreground/10 transition-all duration-500 ${
            isMobileMenuOpen 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            {/* Removed as auth is now in hero section */}
          </div>
        </div>
      </div>
    </header>
  );
}

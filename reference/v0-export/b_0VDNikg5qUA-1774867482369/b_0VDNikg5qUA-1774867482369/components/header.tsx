"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5">
            <Heart className="w-5 h-5 text-[#e07a3f] fill-[#e07a3f]" />
            <span className="text-xl font-medium tracking-tight text-[#e07a3f]">
              evermissed
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              How It Works
            </Link>
            <Link
              href="/memorials"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              Memorials
            </Link>
            <Link
              href="/why-evermissed"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              Why EverMissed
            </Link>
            <Link
              href="#testimonials"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              Testimonials
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-sm text-foreground/70 hover:text-foreground hover:bg-transparent"
            >
              Sign In
            </Button>
            <Button asChild className="bg-[#e07a3f] text-white hover:bg-[#d96c2f] text-sm px-6 rounded-full shadow-sm">
              <Link href="/create-memorial">Create Memorial</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md shadow-lg transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
          <Link
            href="#how-it-works"
            className="text-foreground/70 hover:text-foreground transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/memorials"
            className="text-foreground/70 hover:text-foreground transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Memorials
          </Link>
          <Link
            href="/why-evermissed"
            className="text-foreground/70 hover:text-foreground transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Why EverMissed
          </Link>
          <Link
            href="#testimonials"
            className="text-foreground/70 hover:text-foreground transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Testimonials
          </Link>
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Button variant="ghost" className="justify-start text-foreground/70">
              Sign In
            </Button>
            <Button className="bg-[#e07a3f] text-white hover:bg-[#d96c2f] rounded-full">
              Create Memorial
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export function HeroSection() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-sky.jpg"
          alt="Peaceful sky at sunrise"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Subtitle */}
          <p className="text-[#5a5a5a] tracking-[0.25em] text-xs md:text-sm uppercase mb-6 font-medium">
            In Loving Memory
          </p>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#3a3a3a] leading-tight mb-6 text-balance">
            Honor Those We Love
          </h1>

          {/* Subheadline */}
          <p className="text-[#5a5a5a] text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed text-pretty">
            Create a lasting digital memorial to preserve and share cherished memories of your loved ones.
          </p>

          {/* White Card Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-lg mx-auto">
            <p className="text-[#5a5a5a] text-sm md:text-base mb-6">
              I want to share memories of
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="flex-1 h-12 bg-[#f8f7f5] border-[#e8e6e3] rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:border-[#e07a3f] focus:ring-[#e07a3f]/20"
              />
              <Input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-1 h-12 bg-[#f8f7f5] border-[#e8e6e3] rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:border-[#e07a3f] focus:ring-[#e07a3f]/20"
              />
            </div>

            <Button
              size="lg"
              className="w-full bg-[#e07a3f] text-white hover:bg-[#d96c2f] h-12 text-base font-medium rounded-lg shadow-sm"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

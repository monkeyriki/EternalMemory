"use client"

import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-white to-[#faf9f7] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e07a3f]/5 via-transparent to-transparent" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
            Begin Today
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3a3a3a] mb-6 text-balance">
            Honor Someone Special
          </h2>
          <p className="text-[#6a6a6a] text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Create a beautiful, lasting tribute to someone you love. It only takes 
            a few minutes to start preserving their memory for generations to come.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#e07a3f] text-white hover:bg-[#d96c2f] px-10 py-6 text-base font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              Create a Memorial
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-[#d8d6d3] text-[#5a5a5a] hover:bg-[#faf9f7] hover:border-[#c8c6c3] px-10 py-6 text-base font-medium rounded-full"
            >
              Learn More
            </Button>
          </div>

          <p className="text-sm text-[#9a9a9a] mt-8">
            Free to create • No credit card required
          </p>
        </div>
      </div>
    </section>
  )
}

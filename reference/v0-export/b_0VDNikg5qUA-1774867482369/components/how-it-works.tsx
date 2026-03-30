"use client"

import { Heart, Image as ImageIcon, Share2, Globe } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Heart,
    title: "Start with Love",
    description:
      "Begin by sharing the name and dates of your loved one. Add a heartfelt description that captures who they were.",
  },
  {
    number: "02",
    icon: ImageIcon,
    title: "Add Memories",
    description:
      "Upload cherished photos, share meaningful stories, and add music that reminds you of them.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Invite Family",
    description:
      "Share the memorial with family and friends. They can contribute their own memories and tributes.",
  },
  {
    number: "04",
    icon: Globe,
    title: "Preserve Forever",
    description:
      "Your memorial lives on as a lasting digital legacy, accessible anytime, anywhere in the world.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
            Simple Process
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3a3a3a] mb-6 text-balance">
            Creating a Memorial is Easy
          </h2>
          <p className="text-[#6a6a6a] text-base md:text-lg leading-relaxed">
            In just a few thoughtful steps, create a beautiful tribute that honors 
            your loved one&apos;s memory.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group relative bg-[#faf9f7] rounded-xl p-8 hover:bg-white hover:shadow-lg transition-all duration-500 border border-transparent hover:border-[#e8e6e3]"
            >
              {/* Step Number */}
              <div className="text-[#e07a3f]/20 text-6xl font-serif absolute top-4 right-6 select-none">
                {step.number}
              </div>

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-[#e07a3f]/10 flex items-center justify-center mb-6 group-hover:bg-[#e07a3f]/15 transition-colors duration-500">
                  <step.icon className="w-6 h-6 text-[#e07a3f]" />
                </div>

                <h3 className="font-serif text-xl text-[#3a3a3a] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#6a6a6a] leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

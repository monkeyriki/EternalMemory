"use client"

import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Creating a memorial for my mother was a healing experience. EverMissed gave us a beautiful space where our entire family could share memories and feel connected, even across distances.",
    author: "Sarah Mitchell",
    relationship: "Daughter",
    location: "Portland, Oregon",
  },
  {
    quote:
      "The attention to detail and respect shown in every aspect of the platform is remarkable. It feels like a sacred space, not just a website. My father would have loved it.",
    author: "James Chen",
    relationship: "Son",
    location: "San Francisco, California",
  },
  {
    quote:
      "We received tributes from people all over the world who knew my grandmother. Reading their stories gave us comfort during an incredibly difficult time. This platform is a gift.",
    author: "Maria Santos",
    relationship: "Granddaughter",
    location: "Miami, Florida",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 bg-[#faf9f7]">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
            From Our Community
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3a3a3a] mb-6 text-balance">
            Stories of Comfort & Connection
          </h2>
          <p className="text-[#6a6a6a] text-base md:text-lg leading-relaxed">
            Families share how EverMissed has helped them honor their loved ones 
            and find solace in shared memories.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-500 border border-[#e8e6e3]/50 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Quote size={40} className="text-[#e07a3f]" />
              </div>

              {/* Quote Text */}
              <blockquote className="text-[#5a5a5a] leading-relaxed mb-8 relative z-10 text-sm md:text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author Info */}
              <div className="border-t border-[#f0eeeb] pt-5">
                <p className="font-serif text-[#3a3a3a] text-base">{testimonial.author}</p>
                <p className="text-sm text-[#8a8a8a]">
                  {testimonial.relationship} • {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

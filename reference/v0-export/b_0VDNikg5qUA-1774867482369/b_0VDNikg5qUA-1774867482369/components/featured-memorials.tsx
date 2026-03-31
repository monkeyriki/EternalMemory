"use client"

import Image from "next/image"
import { Heart, ImageIcon } from "lucide-react"

const memorials = [
  {
    id: 1,
    name: "Eleanor Grace Mitchell",
    birthDate: "March 15, 1942",
    deathDate: "December 8, 2024",
    image: "/images/memorial-1.jpg",
    description: "A devoted mother, grandmother, and friend who touched every life she encountered with kindness and warmth.",
    tributes: 47,
    photos: 124,
  },
  {
    id: 2,
    name: "Robert James Sullivan",
    birthDate: "June 22, 1938",
    deathDate: "October 3, 2024",
    image: "/images/memorial-2.jpg",
    description: "A man of integrity and humor who dedicated his life to family and community service.",
    tributes: 89,
    photos: 256,
  },
  {
    id: 3,
    name: "Margaret Rose Chen",
    birthDate: "September 1, 1955",
    deathDate: "November 21, 2024",
    image: "/images/memorial-3.jpg",
    description: "An inspiring teacher who believed in the potential of every student and left an indelible mark on education.",
    tributes: 156,
    photos: 89,
  },
  {
    id: 4,
    name: "David Michael Torres",
    birthDate: "January 12, 1985",
    deathDate: "August 15, 2024",
    image: "/images/memorial-4.jpg",
    description: "A beloved son, brother, and friend whose adventurous spirit and generous heart inspired all who knew him.",
    tributes: 203,
    photos: 312,
  },
]

export function FeaturedMemorials() {
  return (
    <section id="memorials" className="py-24 md:py-32 bg-[#faf9f7]">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
            Honoring Those We Love
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3a3a3a] mb-6 text-balance">
            Featured Memorials
          </h2>
          <p className="text-[#6a6a6a] text-base md:text-lg leading-relaxed">
            Beautiful tributes created by families who chose EverMissed to honor 
            and preserve the memory of their loved ones.
          </p>
        </div>

        {/* Memorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {memorials.map((memorial) => (
            <article
              key={memorial.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-[#e8e6e3]/50"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative w-full sm:w-44 lg:w-52 h-56 sm:h-auto flex-shrink-0 overflow-hidden">
                  <Image
                    src={memorial.image}
                    alt={memorial.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-serif text-xl text-[#3a3a3a] mb-1 group-hover:text-[#e07a3f] transition-colors duration-300">
                      {memorial.name}
                    </h3>
                    <p className="text-sm text-[#8a8a8a] mb-4">
                      {memorial.birthDate} — {memorial.deathDate}
                    </p>
                    <p className="text-[#6a6a6a] text-sm leading-relaxed line-clamp-3">
                      {memorial.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#f0eeeb]">
                    <div className="flex items-center gap-2 text-[#8a8a8a]">
                      <Heart size={15} className="text-[#e07a3f]" />
                      <span className="text-sm">{memorial.tributes} tributes</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8a8a8a]">
                      <ImageIcon size={15} className="text-[#e07a3f]" />
                      <span className="text-sm">{memorial.photos} photos</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-14">
          <a
            href="/memorials"
            className="inline-flex items-center gap-2 text-[#e07a3f] hover:text-[#d96c2f] transition-colors duration-300 text-sm font-medium tracking-wide"
          >
            View All Memorials
            <span className="text-lg">&#8594;</span>
          </a>
        </div>
      </div>
    </section>
  )
}

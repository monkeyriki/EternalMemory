"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Share2,
  Image as ImageIcon,
  Clock,
  MessageCircleHeart,
  Heart,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PawPrint,
} from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Your memories are precious. Control who can view and contribute to your memorial with customizable privacy settings. Your data is encrypted and protected.",
  },
  {
    icon: Share2,
    title: "Share with Family & Friends",
    description:
      "Invite loved ones near and far to participate in honoring your special person. Share via email, social media, or a private link.",
  },
  {
    icon: ImageIcon,
    title: "Rich Media Support",
    description:
      "Upload unlimited photos, videos, music, and written stories. Create a multimedia tribute that truly captures the essence of your loved one.",
  },
  {
    icon: Clock,
    title: "Lasting Digital Legacy",
    description:
      "Your memorial is preserved indefinitely. Future generations can discover and connect with their heritage through the stories you share today.",
  },
  {
    icon: MessageCircleHeart,
    title: "Virtual Tributes & Guestbook",
    description:
      "Allow visitors to light virtual candles, leave heartfelt messages, share their own memories, and express condolences in a beautiful guestbook.",
  },
]

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
  {
    quote:
      "After losing our beloved dog Max, EverMissed helped us create a beautiful tribute. The pet memorial feature is just as thoughtful as the human memorials. He was family, and now his memory lives on.",
    author: "David Thompson",
    relationship: "Pet Parent",
    location: "Austin, Texas",
  },
  {
    quote:
      "I was hesitant about creating something online, but EverMissed exceeded all my expectations. The design is elegant, tasteful, and truly honors my late husband's memory.",
    author: "Eleanor Wright",
    relationship: "Wife",
    location: "Boston, Massachusetts",
  },
]

export default function WhyEverMissedPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setIsAutoPlaying(false)
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setIsAutoPlaying(false)
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfcfa] to-[#f8f6f3]" />
        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
                Why Choose Us
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#3a3a3a] mb-6 leading-tight text-balance">
                A Meaningful Way to Remember
              </h1>
              <p className="text-[#6a6a6a] text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
                EverMissed provides a beautiful, lasting space to celebrate the
                lives of those who have touched our hearts. Because every story
                deserves to be told, and every memory deserves to be treasured.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-[#e07a3f] text-white hover:bg-[#d96c2f] text-sm px-8 py-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                  Create a Memorial
                </Button>
                <Link href="/memorials">
                  <Button
                    variant="outline"
                    className="border-[#e07a3f]/30 text-[#e07a3f] hover:bg-[#e07a3f]/5 text-sm px-8 py-6 rounded-full"
                  >
                    Browse Memorials
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/why-hero.jpg"
                  alt="Hands holding cherished memories"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
              Why EverMissed
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3a3a3a] mb-6 text-balance">
              Everything You Need to Honor a Life
            </h2>
            <p className="text-[#6a6a6a] text-base md:text-lg leading-relaxed">
              Our platform is designed with care and compassion, offering all
              the features you need to create a beautiful tribute.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group bg-[#fdfcfa] rounded-2xl p-8 border border-[#e8e6e3]/60 hover:border-[#e07a3f]/30 hover:shadow-xl transition-all duration-500"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-[#e07a3f]/10 flex items-center justify-center mb-6 group-hover:bg-[#e07a3f]/15 transition-colors duration-300">
                  <benefit.icon className="w-7 h-7 text-[#e07a3f]" />
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl text-[#3a3a3a] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-[#6a6a6a] text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Human & Pet Memorials Section */}
      <section className="py-24 md:py-32 bg-[#faf9f7]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
              For All Who We Love
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3a3a3a] mb-6 text-balance">
              Human & Pet Memorials
            </h2>
            <p className="text-[#6a6a6a] text-base md:text-lg leading-relaxed">
              Whether honoring a beloved family member, friend, or cherished
              pet, EverMissed provides the perfect space to celebrate every
              life that has touched your heart.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* Human Memorials Card */}
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e07a3f] to-[#f0a06f]" />
              <div className="p-10">
                <div className="w-16 h-16 rounded-full bg-[#e07a3f]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-[#e07a3f]" />
                </div>
                <h3 className="font-serif text-2xl text-[#3a3a3a] mb-4">
                  Human Memorials
                </h3>
                <p className="text-[#6a6a6a] leading-relaxed mb-6">
                  Create a beautiful tribute for parents, grandparents,
                  siblings, friends, and all the remarkable people who have
                  shaped our lives. Share photos, stories, and invite others to
                  contribute their memories.
                </p>
                <ul className="space-y-3 text-sm text-[#5a5a5a]">
                  <li className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#e07a3f]" />
                    Unlimited photos and videos
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#e07a3f]" />
                    Timeline of life events
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#e07a3f]" />
                    Family tree connections
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#e07a3f]" />
                    Virtual candles and tributes
                  </li>
                </ul>
              </div>
            </div>

            {/* Pet Memorials Card */}
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7eb39a] to-[#a8d4be]" />
              <div className="p-10">
                <div className="w-16 h-16 rounded-full bg-[#7eb39a]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PawPrint className="w-8 h-8 text-[#7eb39a]" />
                </div>
                <h3 className="font-serif text-2xl text-[#3a3a3a] mb-4">
                  Pet Memorials
                </h3>
                <p className="text-[#6a6a6a] leading-relaxed mb-6">
                  Our furry, feathered, and scaled friends are family too.
                  Create a loving tribute for the pets who brought joy,
                  companionship, and unconditional love into our lives.
                </p>
                <ul className="space-y-3 text-sm text-[#5a5a5a]">
                  <li className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#7eb39a]" />
                    Photo galleries and videos
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#7eb39a]" />
                    Favorite memories section
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#7eb39a]" />
                    Pet personality traits
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#7eb39a]" />
                    Rainbow Bridge tributes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
              From Our Community
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3a3a3a] mb-6 text-balance">
              Stories of Comfort & Connection
            </h2>
            <p className="text-[#6a6a6a] text-base md:text-lg leading-relaxed">
              Families share how EverMissed has helped them honor their loved
              ones and find solace in shared memories.
            </p>
          </div>

          {/* Carousel */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-[#fdfcfa] rounded-2xl p-8 md:p-12 border border-[#e8e6e3]/60 shadow-lg">
              {/* Quote Icon */}
              <div className="absolute top-8 left-8 md:top-10 md:left-10">
                <Heart className="w-10 h-10 text-[#e07a3f]/20" />
              </div>

              {/* Testimonial Content */}
              <div className="text-center pt-8">
                <blockquote className="text-[#4a4a4a] text-lg md:text-xl lg:text-2xl leading-relaxed mb-8 font-serif italic">
                  &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
                </blockquote>

                <div className="border-t border-[#e8e6e3] pt-6">
                  <p className="font-serif text-[#3a3a3a] text-lg">
                    {testimonials[currentTestimonial].author}
                  </p>
                  <p className="text-sm text-[#8a8a8a]">
                    {testimonials[currentTestimonial].relationship} •{" "}
                    {testimonials[currentTestimonial].location}
                  </p>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#6a6a6a] hover:text-[#e07a3f] transition-colors duration-300"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#6a6a6a] hover:text-[#e07a3f] transition-colors duration-300"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false)
                    setCurrentTestimonial(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "w-8 bg-[#e07a3f]"
                      : "bg-[#d0cdc8] hover:bg-[#b0ada8]"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#faf9f7] to-[#f5f3f0]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-12 h-12 text-[#e07a3f] mx-auto mb-6 fill-[#e07a3f]/20" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3a3a3a] mb-6 text-balance">
              Create Your Memorial Today
            </h2>
            <p className="text-[#6a6a6a] text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Join thousands of families who have created lasting tributes to
              their loved ones. It only takes a few minutes to get started, and
              your memorial will be cherished for generations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="bg-[#e07a3f] text-white hover:bg-[#d96c2f] text-base px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started Free
              </Button>
              <p className="text-sm text-[#8a8a8a]">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

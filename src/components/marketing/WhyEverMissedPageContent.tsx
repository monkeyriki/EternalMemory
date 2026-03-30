"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  PawPrint
} from "lucide-react";

const sectionWrap = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

const accentBtn =
  "inline-flex items-center justify-center rounded-full bg-[#e07a3f] px-8 py-3 text-sm font-medium text-white shadow-md transition hover:bg-[#d96c2f] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/50 focus-visible:ring-offset-2";
const outlineBtn =
  "inline-flex items-center justify-center rounded-full border border-[#e07a3f]/30 px-8 py-3 text-sm font-medium text-[#e07a3f] transition hover:bg-[#e07a3f]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 focus-visible:ring-offset-2";
const ctaLarge =
  "inline-flex items-center justify-center rounded-full bg-[#e07a3f] px-10 py-3 text-base font-medium text-white shadow-lg transition hover:bg-[#d96c2f] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/50 focus-visible:ring-offset-2";

const benefits = [
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Your memories are precious. Control who can view and contribute to your memorial with customizable privacy settings. Your data is encrypted and protected."
  },
  {
    icon: Share2,
    title: "Share with Family & Friends",
    description:
      "Invite loved ones near and far to participate in honoring your special person. Share via email, social media, or a private link."
  },
  {
    icon: ImageIcon,
    title: "Rich Media Support",
    description:
      "Upload unlimited photos, videos, music, and written stories. Create a multimedia tribute that truly captures the essence of your loved one."
  },
  {
    icon: Clock,
    title: "Lasting Digital Legacy",
    description:
      "Your memorial is preserved indefinitely. Future generations can discover and connect with their heritage through the stories you share today."
  },
  {
    icon: MessageCircleHeart,
    title: "Virtual Tributes & Guestbook",
    description:
      "Allow visitors to light virtual candles, leave heartfelt messages, share their own memories, and express condolences in a beautiful guestbook."
  }
];

const testimonials = [
  {
    quote:
      "Creating a memorial for my mother was a healing experience. EverMissed gave us a beautiful space where our entire family could share memories and feel connected, even across distances.",
    author: "Sarah Mitchell",
    relationship: "Daughter",
    location: "Portland, Oregon"
  },
  {
    quote:
      "The attention to detail and respect shown in every aspect of the platform is remarkable. It feels like a sacred space, not just a website. My father would have loved it.",
    author: "James Chen",
    relationship: "Son",
    location: "San Francisco, California"
  },
  {
    quote:
      "We received tributes from people all over the world who knew my grandmother. Reading their stories gave us comfort during an incredibly difficult time. This platform is a gift.",
    author: "Maria Santos",
    relationship: "Granddaughter",
    location: "Miami, Florida"
  },
  {
    quote:
      "After losing our beloved dog Max, EverMissed helped us create a beautiful tribute. The pet memorial feature is just as thoughtful as the human memorials. He was family, and now his memory lives on.",
    author: "David Thompson",
    relationship: "Pet Parent",
    location: "Austin, Texas"
  },
  {
    quote:
      "I was hesitant about creating something online, but EverMissed exceeded all my expectations. The design is elegant, tasteful, and truly honors my late husband's memory.",
    author: "Eleanor Wright",
    relationship: "Wife",
    location: "Boston, Massachusetts"
  }
];

export function WhyEverMissedPageContent() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfcfa] pb-20 md:pb-24">
      <section className="relative overflow-hidden scroll-mt-28 pt-24 pb-16 md:pt-28 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfcfa] via-[#faf8f5] to-[#f5f3f0]" />
        <div className={`relative ${sectionWrap}`}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            <div className="order-2 lg:order-1">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#e07a3f]">
                Why Choose Us
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-[#3a3a3a] text-balance md:text-5xl lg:text-[3.25rem]">
                A Meaningful Way to Remember
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#6a6a6a] md:text-xl">
                EverMissed provides a beautiful, lasting space to celebrate the lives of those who
                have touched our hearts. Because every story deserves to be told, and every memory
                deserves to be treasured.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/memorials/new" className={accentBtn}>
                  Create a Memorial
                </Link>
                <Link href="/memorials" className={outlineBtn}>
                  Browse Memorials
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 transition duration-500 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)]">
                <Image
                  src="/images/why-hero.jpg"
                  alt="Hands holding cherished memories"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#e8e6e3]/60 bg-white py-16 md:py-24">
        <div className={sectionWrap}>
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#e07a3f]">
              Why EverMissed
            </p>
            <h2 className="font-serif text-3xl text-balance text-[#3a3a3a] md:text-4xl lg:text-5xl">
              Everything You Need to Honor a Life
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#6a6a6a] md:text-lg">
              Our platform is designed with care and compassion, offering all the features you need
              to create a beautiful tribute.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-[#e8e6e3]/60 bg-[#fdfcfa] p-7 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#e07a3f]/35 hover:shadow-lg md:p-8"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e07a3f]/10 transition duration-300 group-hover:bg-[#e07a3f]/15">
                  <benefit.icon className="h-7 w-7 text-[#e07a3f]" />
                </div>
                <h3 className="font-serif text-xl text-[#3a3a3a]">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#6a6a6a]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#faf9f7] py-16 md:py-24">
        <div className={sectionWrap}>
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#e07a3f]">
              For All Who We Love
            </p>
            <h2 className="font-serif text-3xl text-balance text-[#3a3a3a] md:text-4xl lg:text-5xl">
              Human & Pet Memorials
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#6a6a6a] md:text-lg">
              Whether honoring a beloved family member, friend, or cherished pet, EverMissed
              provides the perfect space to celebrate every life that has touched your heart.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8 lg:gap-12">
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#e07a3f] to-[#f0a06f]" />
              <div className="p-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e07a3f]/10 transition group-hover:scale-110">
                  <Users className="h-8 w-8 text-[#e07a3f]" />
                </div>
                <h3 className="font-serif text-2xl text-[#3a3a3a]">Human Memorials</h3>
                <p className="mt-4 leading-relaxed text-[#6a6a6a]">
                  Create a beautiful tribute for parents, grandparents, siblings, friends, and all
                  the remarkable people who have shaped our lives.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-[#5a5a5a]">
                  <li className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#e07a3f]" />
                    Photos, stories, and guestbook
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#e07a3f]" />
                    Privacy controls
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#e07a3f]" />
                    Virtual tributes
                  </li>
                </ul>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#7eb39a] to-[#a8d4be]" />
              <div className="p-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7eb39a]/10 transition group-hover:scale-110">
                  <PawPrint className="h-8 w-8 text-[#7eb39a]" />
                </div>
                <h3 className="font-serif text-2xl text-[#3a3a3a]">Pet Memorials</h3>
                <p className="mt-4 leading-relaxed text-[#6a6a6a]">
                  Our furry, feathered, and scaled friends are family too. Create a loving tribute
                  for the pets who brought joy into our lives.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-[#5a5a5a]">
                  <li className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#7eb39a]" />
                    Photo galleries
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#7eb39a]" />
                    Favorite memories
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#7eb39a]" />
                    Respectful pet tributes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#e8e6e3]/60 bg-white py-16 md:py-24">
        <div className={sectionWrap}>
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#e07a3f]">
              From Our Community
            </p>
            <h2 className="font-serif text-3xl text-balance text-[#3a3a3a] md:text-4xl lg:text-5xl">
              Stories of Comfort & Connection
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#6a6a6a] md:text-lg">
              Families share how EverMissed has helped them honor their loved ones and find solace in
              shared memories.
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-2xl border border-[#e8e6e3]/60 bg-[#fdfcfa] p-6 shadow-lg sm:p-10 md:p-12">
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 md:top-10 md:left-10">
                <Heart className="h-10 w-10 text-[#e07a3f]/20" aria-hidden />
              </div>
              <div className="px-2 pt-10 text-center sm:px-12 md:px-16">
                <blockquote className="mb-8 font-serif text-base italic leading-relaxed text-[#4a4a4a] sm:text-lg md:text-xl lg:text-2xl">
                  &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
                </blockquote>
                <div className="border-t border-[#e8e6e3] pt-6">
                  <p className="font-serif text-lg text-[#3a3a3a]">
                    {testimonials[currentTestimonial].author}
                  </p>
                  <p className="text-sm text-[#8a8a8a]">
                    {testimonials[currentTestimonial].relationship} •{" "}
                    {testimonials[currentTestimonial].location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={prevTestimonial}
                className="absolute top-1/2 left-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#6a6a6a] shadow-md transition hover:text-[#e07a3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 sm:left-2 md:left-4"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextTestimonial}
                className="absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#6a6a6a] shadow-md transition hover:text-[#e07a3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 sm:right-2 md:right-4"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentTestimonial(index);
                  }}
                  className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 ${
                    index === currentTestimonial
                      ? "w-8 bg-[#e07a3f]"
                      : "w-2 bg-[#d0cdc8] hover:bg-[#b0ada8]"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#faf9f7] to-[#f0ebe6] py-16 md:py-24">
        <div className={sectionWrap}>
          <div className="mx-auto max-w-3xl text-center">
            <Heart className="mx-auto mb-6 h-12 w-12 fill-[#e07a3f]/20 text-[#e07a3f]" aria-hidden />
            <h2 className="font-serif text-3xl text-balance text-[#3a3a3a] md:text-4xl lg:text-5xl">
              Create Your Memorial Today
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6a6a6a] md:text-xl">
              Join families who have created lasting tributes to their loved ones. It only takes a
              few minutes to get started.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/memorials/new" className={ctaLarge}>
                Get Started Free
              </Link>
              <p className="text-sm text-[#8a8a8a]">No credit card required</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturedMemorials } from "@/components/featured-memorials"
import { WhyEverMissed } from "@/components/why-evermissed"
import { Testimonials } from "@/components/testimonials"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <HowItWorks />
      <FeaturedMemorials />
      <WhyEverMissed />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  )
}

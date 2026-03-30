"use client"

import { Shield, Users, Camera, Infinity } from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Your memories are protected with enterprise-grade security. Control who can view and contribute to your memorial.",
  },
  {
    icon: Users,
    title: "Share with Family",
    description:
      "Invite unlimited family members and friends to view, contribute photos, share stories, and leave heartfelt tributes.",
  },
  {
    icon: Camera,
    title: "Rich Media Support",
    description:
      "Upload unlimited photos, videos, and audio memories. Add background music that captures their spirit.",
  },
  {
    icon: Infinity,
    title: "Lasting Digital Legacy",
    description:
      "Your memorial is preserved indefinitely, ensuring future generations can learn about and connect with their heritage.",
  },
]

export function WhyEverMissed() {
  return (
    <section id="why-us" className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text */}
          <div>
            <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
              Why Choose Us
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3a3a3a] mb-6 text-balance">
              A Meaningful Way to Remember
            </h2>
            <p className="text-[#6a6a6a] text-base md:text-lg leading-relaxed mb-6">
              EverMissed provides a dignified, beautiful space where families can come 
              together to celebrate lives well-lived. We believe every person deserves 
              a lasting tribute that honors their unique story.
            </p>
            <p className="text-[#6a6a6a] leading-relaxed">
              Our platform is designed with care, respect, and the understanding that 
              grief is a journey. We&apos;re here to help you preserve what matters most—
              the memories, stories, and love that define a life.
            </p>
          </div>

          {/* Right Column - Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group bg-[#faf9f7] rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-500 border border-transparent hover:border-[#e8e6e3]"
              >
                <div className="w-12 h-12 rounded-full bg-[#e07a3f]/10 flex items-center justify-center mb-4 group-hover:bg-[#e07a3f]/15 transition-colors duration-500">
                  <benefit.icon className="w-5 h-5 text-[#e07a3f]" />
                </div>
                <h3 className="font-serif text-lg text-[#3a3a3a] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-[#6a6a6a] text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

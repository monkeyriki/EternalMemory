import Link from "next/link"
import { Heart } from "lucide-react"

const footerLinks = {
  company: [
    { label: "About Us", href: "#" },
    { label: "Our Mission", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  resources: [
    { label: "Help Center", href: "#" },
    { label: "Grief Support", href: "#" },
    { label: "Memorial Guide", href: "#" },
    { label: "Blog", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#3a3a3a]">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1.5 mb-6">
              <Heart className="w-5 h-5 text-[#e07a3f] fill-[#e07a3f]" />
              <span className="text-xl font-medium tracking-tight text-[#e07a3f]">
                evermissed
              </span>
            </Link>
            <p className="text-[#a0a0a0] leading-relaxed max-w-sm mb-6 text-sm">
              Creating beautiful spaces to honor and remember the people who have 
              touched our lives. Because every life deserves to be celebrated.
            </p>
            <p className="text-sm text-[#808080] italic">
              &ldquo;Those we love don&apos;t go away, they walk beside us every day.&rdquo;
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#a0a0a0] hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#a0a0a0] hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#a0a0a0] hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[#4a4a4a] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#808080]">
            © {new Date().getFullYear()} EverMissed. All rights reserved.
          </p>
          <p className="text-sm text-[#707070] text-center md:text-right">
            Made with care for families around the world.
          </p>
        </div>
      </div>
    </footer>
  )
}

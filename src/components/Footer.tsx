import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "/how-it-works" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Refund Policy", href: "/refund-policy" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/feezyapp" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/feezyapp" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/feezyapp" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/feezy" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              Track commission-based income with clarity. Built for Indian
              teachers, trainers, freelancers, and agents.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                support@feezy.in
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Mumbai, India
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-semibold mb-4 capitalize">{section}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Feezy. Made with ❤️ in India.
          </p>

          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

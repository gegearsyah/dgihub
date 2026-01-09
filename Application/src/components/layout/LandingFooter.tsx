'use client';

import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

const LandingFooter = () => {
  const footerLinks = {
    platform: [
      { name: "Portal Pembelajar", href: "/talenta/dashboard" },
      { name: "Portal Penyedia", href: "/mitra/dashboard" },
      { name: "Portal Pemberi Kerja", href: "/industri/dashboard" },
      { name: "API & Integrasi", href: "#" },
    ],
    resources: [
      { name: "Dokumentasi", href: "#" },
      { name: "Panduan Pengguna", href: "#" },
      { name: "FAQ", href: "#" },
      { name: "Status Sistem", href: "#" },
    ],
    legal: [
      { name: "Kebijakan Privasi", href: "#" },
      { name: "Syarat & Ketentuan", href: "#" },
      { name: "Kepatuhan UU PDP", href: "#" },
      { name: "Keamanan Data", href: "#" },
    ],
    government: [
      { name: "Kemnaker", href: "#", external: true },
      { name: "Kemendikbud", href: "#", external: true },
      { name: "SIPLatih", href: "#", external: true },
      { name: "BNSP", href: "#", external: true },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-primary-foreground/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-lg">D</span>
              </div>
              <div>
                <span className="font-bold text-primary-foreground text-sm">DGIHub</span>
                <span className="block text-[10px] text-primary-foreground/60">Indonesia</span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/60 mb-6">
              Platform ekosistem vokasi dan ketenagakerjaan terintegrasi Indonesia.
            </p>
            <div className="space-y-3">
              <a href="mailto:info@dgihub.go.id" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Mail className="w-4 h-4" />
                info@dgihub.go.id
              </a>
              <a href="tel:1500-XXX" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Phone className="w-4 h-4" />
                1500-XXX
              </a>
              <div className="flex items-start gap-2 text-sm text-primary-foreground/60">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Sumber Daya</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Government Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Pemerintah</h4>
            <ul className="space-y-3">
              {footerLinks.government.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="flex items-center gap-1 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {link.name}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © 2024 DGIHub Indonesia. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-primary-foreground/40">Didukung oleh:</span>
            <div className="flex items-center gap-4 text-xs text-primary-foreground/60">
              <span>Kemnaker RI</span>
              <span>•</span>
              <span>Kemendikbud RI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

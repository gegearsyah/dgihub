'use client';

import { GraduationCap, Building2, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const portals = [
  {
    id: "learner",
    icon: GraduationCap,
    title: "Portal Pembelajar",
    subtitle: "Siswa & Profesional",
    description: "Paspor pembelajaran seumur hidup dengan kredensial digital terverifikasi",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    href: "/talenta/dashboard",
    features: [
      "Profil kompetensi berbasis SKKNI/KKNI",
      "Wallet kredensial digital terverifikasi",
      "Peta jalur karier personal",
      "Rekomendasi pelatihan AI-powered",
      "Ekspor ke LinkedIn & Europass",
    ],
  },
  {
    id: "provider",
    icon: Building2,
    title: "Portal Penyedia",
    subtitle: "LPK, SMK & Universitas",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    href: "/mitra/dashboard",
    description: "Manajemen program pelatihan terintegrasi dengan sistem pemerintah",
    features: [
      "Integrasi SIPLatih & akreditasi",
      "Learning Management System (LMS)",
      "Penerbitan badge & sertifikat digital",
      "Tracking kehadiran GPS & biometric",
      "Laporan kompetensi real-time",
    ],
  },
  {
    id: "employer",
    icon: Briefcase,
    title: "Portal Pemberi Kerja",
    subtitle: "Industri & BUMN",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    href: "/industri/dashboard",
    description: "Rekrutmen berbasis kompetensi dengan insentif Super Tax Deduction",
    features: [
      "Pencarian talent skill-based",
      "Verifikasi kredensial instan",
      "Klaim Super Tax Deduction 200%",
      "Program magang Teaching Factory",
      "Analitik tenaga kerja",
    ],
  },
];

const PortalsSection = () => {
  return (
    <section id="portals" className="py-20 md:py-32 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Tiga Portal Terintegrasi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Satu Ekosistem untuk Semua Stakeholder
          </h2>
          <p className="text-lg text-muted-foreground">
            Platform multi-tenant yang dirancang untuk kebutuhan spesifik setiap pemangku kepentingan
            dalam ekosistem vokasi Indonesia.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {portals.map((portal, index) => (
            <div
              key={portal.id}
              className={`group relative rounded-2xl border ${portal.borderColor} bg-card p-8 hover:shadow-card-hover transition-all duration-300 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <portal.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <div className="mb-6">
                <span className="text-sm text-muted-foreground">{portal.subtitle}</span>
                <h3 className="text-xl font-bold text-foreground mt-1 mb-3">{portal.title}</h3>
                <p className="text-muted-foreground text-sm">{portal.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {portal.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button asChild variant="outline" className="w-full group/btn">
                <Link href={portal.href}>
                  Jelajahi Portal
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortalsSection;

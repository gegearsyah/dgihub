'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Award, Briefcase } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const getDashboardPath = () => {
    return '/dashboard';
  };

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-60" />
      <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container relative pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">
              Terintegrasi dengan NIK & SIPLatih
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            <span className="text-foreground">Paspor Pembelajaran{" "}</span>
            <span className="text-secondary">Seumur Hidup</span>{" "}
            <span className="text-foreground">untuk Tenaga Kerja{" "}</span>
            <span className="text-secondary">Indonesia</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-foreground/90">
              Platform digital terpadu yang menghubungkan pendidikan vokasi, industri, dan pemerintah. 
              Verifikasi kredensial, lacak kompetensi, dan akses peluang kerja dalam satu ekosistem.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {isAuthenticated ? (
              <>
                <Button 
                  asChild 
                  variant="default" 
                  size="lg" 
                  className="bg-secondary hover:bg-secondary/90 text-primary font-semibold"
                >
                  <Link href={getDashboardPath()}>
                    Masuk ke Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-foreground/20 text-foreground hover:bg-background/50 backdrop-blur-sm"
                >
                  <Link href="/profile">
                    Lihat Profil
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="default" size="lg" className="bg-secondary hover:bg-secondary/90 text-primary font-semibold">
                  <Link href="/register">
                    Mulai Sekarang
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-foreground/20 text-foreground hover:bg-background/50 backdrop-blur-sm">
                  <Link href="/login">
                    Masuk
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">2.5M+</div>
              <div className="text-sm text-foreground/80">Pembelajar Terdaftar</div>
            </div>
            <div className="text-center border-x border-foreground/20">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">15K+</div>
              <div className="text-sm text-foreground/80">Lembaga Pelatihan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">8K+</div>
              <div className="text-sm text-foreground/80">Mitra Industri</div>
            </div>
          </div>
        </div>

        {/* Feature Cards Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
          {[
            {
              icon: Award,
              title: "Kredensial Digital",
              description: "Sertifikat terverifikasi dengan standar Open Badges 3.0 & W3C",
            },
            {
              icon: Briefcase,
              title: "Pencocokan Kerja",
              description: "AI-powered job matching berdasarkan kompetensi SKKNI/KKNI",
            },
            {
              icon: Shield,
              title: "Keamanan Data",
              description: "Kepatuhan penuh terhadap UU PDP No. 27/2022",
            },
          ].map((feature, index) => (
            <Link
              key={feature.title}
              href="/"
              className="group p-6 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 hover:bg-background/90 hover:border-border transition-all duration-300 animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-secondary/30 transition-all">
                <feature.icon className="w-6 h-6 text-secondary group-hover:text-secondary/90" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-secondary transition-colors">{feature.title}</h3>
              <p className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;

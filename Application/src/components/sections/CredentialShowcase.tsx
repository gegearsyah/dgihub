'use client';

import { Shield, ExternalLink, QrCode, CheckCircle2, Award, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CredentialShowcase = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/50">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Kredensial Digital Terverifikasi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Sertifikat dengan Standar{" "}
              <span className="text-gradient-gold">Internasional</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Setiap kredensial diterbitkan mengikuti standar Open Badges 3.0 dan W3C Verifiable Credentials,
              memungkinkan verifikasi instan dan interoperabilitas global.
            </p>

            {/* Standards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: "Open Badges 3.0", status: "Compliant" },
                { label: "W3C VC/DID", status: "Supported" },
                { label: "AQRF Level", status: "Mapped" },
                { label: "SKKNI/KKNI", status: "Aligned" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.status}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/talenta/certificates">
                  Lihat Demo Verifikasi
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#">
                  Dokumentasi API
                </Link>
              </Button>
            </div>
          </div>

          {/* Right - Credential Preview */}
          <div className="relative">
            {/* Main Credential Card */}
            <div className="relative bg-card rounded-3xl shadow-card-hover p-8 border border-border animate-float">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Sertifikat Kompetensi</h4>
                    <p className="text-sm text-muted-foreground">Teknisi Jaringan Level III</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10">
                  <Shield className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs font-medium text-success">Terverifikasi</span>
                </div>
              </div>

              {/* Holder Info */}
              <div className="p-4 rounded-xl bg-muted/50 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-gold flex items-center justify-center">
                    <span className="text-2xl font-bold text-secondary-foreground">AP</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Ahmad Pratama</h5>
                    <p className="text-sm text-muted-foreground">NIK: ****-****-****-1234</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Penerbit</div>
                    <div className="text-sm font-medium text-foreground">LSP Telematika</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Diterbitkan</div>
                    <div className="text-sm font-medium text-foreground">15 Des 2024</div>
                  </div>
                </div>
              </div>

              {/* KKNI Level */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent border border-accent-foreground/10">
                <div>
                  <div className="text-xs text-muted-foreground">KKNI Level</div>
                  <div className="text-lg font-bold text-accent-foreground">Level 3 • AQRF 3</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-foreground" />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -left-4 p-3 rounded-xl bg-card shadow-card border border-border animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">OB</span>
                </div>
                <span className="text-xs font-medium text-foreground">Open Badge</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 p-3 rounded-xl bg-card shadow-card border border-border animate-fade-in" style={{ animationDelay: "0.7s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600">W3C</span>
                </div>
                <span className="text-xs font-medium text-foreground">Verifiable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CredentialShowcase;

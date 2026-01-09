'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export default function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
  className
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className={cn(
        "h-full shadow-sm hover:shadow-card-hover transition-all duration-300",
        "group-hover:border-primary/50",
        className
      )}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

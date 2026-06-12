import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("py-16 md:py-24 lg:py-32", className)}
    >
      {children}
    </section>
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}

export function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 lg:px-8",
        {
          "max-w-7xl": size === "default",
          "max-w-4xl": size === "narrow",
          "max-w-[1600px]": size === "wide",
        },
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl mb-12 lg:mb-16",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {label && (
        <span className="inline-block text-primary text-sm font-medium tracking-widest uppercase mb-4">
          {label}
        </span>
      )}
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
          {description}
        </p>
      )}
    </div>
  );
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  label?: string;
  backgroundImage?: string;
  children?: ReactNode;
}

export function PageHero({
  title,
  subtitle,
  label,
  backgroundImage,
  children,
}: PageHeroProps) {
  return (
    <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-charcoal-dark">
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/55 to-background" />
        <div className="absolute inset-0 bg-noise pointer-events-none" />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[36rem] h-[20rem] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-36 pb-24 text-center">
        <Divider ornament className="mb-7" />
        {label && (
          <span className="inline-block text-primary text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-4">
            {label}
          </span>
        )}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto text-pretty leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

interface DividerProps {
  className?: string;
  ornament?: boolean;
}

export function Divider({ className, ornament = false }: DividerProps) {
  if (ornament) {
    return (
      <div className={cn("flex items-center justify-center gap-4", className)}>
        <div className="h-px w-12 bg-border" />
        <div className="w-2 h-2 rotate-45 bg-primary" />
        <div className="h-px w-12 bg-border" />
      </div>
    );
  }

  return <div className={cn("h-px bg-border", className)} />;
}

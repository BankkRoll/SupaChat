import ComponentShowcase from "@/components/landing/showcase";
import Hero from "@/components/landing/hero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <ComponentShowcase />
    </div>
  );
}

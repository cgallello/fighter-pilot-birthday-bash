import heroImage from "@assets/generated_images/F-35_fighter_jet_hero_image_65bc1793.png";
import { Plane } from "lucide-react";

interface HeroSectionProps {
  title: string;
  description: string;
}

export default function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-jet-gray/40 via-jet-gray/20 to-transparent" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Plane className="w-12 h-12 text-cloud-white" />
          <h1 className="font-display font-bold text-6xl md:text-7xl text-cloud-white tracking-wide uppercase">
            {title}
          </h1>
          <Plane className="w-12 h-12 text-cloud-white transform scale-x-[-1]" />
        </div>
        
        <p className="text-xl md:text-2xl text-cloud-white/95 font-medium mb-8 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

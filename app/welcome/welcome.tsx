import { Link } from "react-router";
import { Zap, Scale, BookOpen } from "lucide-react";

export function Welcome() {
  return (
    <div className="divide-y divide-foreground">
      <header className="pt-12 pb-2 md:pt-15 md:pb-15">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-8 px-9 flex flex-col justify-end mb-6 lg:mb-0">
            <h1 className="font-serif font-black text-5xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter uppercase italic text-center lg:text-left">
              Culinary <br />
              <span className="text-accent not-italic">Archive.</span>
            </h1>
          </div>
          <div className="lg:col-span-4 border-t-4 lg:border-t-0 lg:border-l-4 border-foreground p-8 pb-6">
            <p className="font-serif text-lg lg:text-xl leading-snug">
              <span className="text-7xl md:text-8xl float-left mr-4 leading-[0.7] font-black text-accent relative -top-2 md:-top-3">T</span>
              he definitive repository for the modern kitchen. Save, scale, and organize your private collection with editorial precision and unwavering clarity.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-foreground">
        <div className="p-8 py-14 space-y-4 hard-shadow-hover bg-background flex flex-col justify-center">
          <Zap className="text-accent" size={32} strokeWidth={1.5} />
          <h3 className="font-serif font-bold text-2xl uppercase italic">Smart Import</h3>
          <p className="text-sm leading-relaxed text-neutral-600">
            Paste any culinary text or digital manuscript. Our engine parses raw data into a structured record instantly.
          </p>
        </div>
        <div className="p-8 py-14 space-y-4 hard-shadow-hover bg-background flex flex-col justify-center">
          <Scale className="text-accent" size={32} strokeWidth={1.5} />
          <h3 className="font-serif font-bold text-2xl uppercase italic">Auto Scaling</h3>
          <p className="text-sm leading-relaxed text-neutral-600">
            Recalculate ratios with geometric precision. Serving adjustments reflect across all ingredients without error.
          </p>
        </div>
        <div className="p-8 py-14 space-y-4 hard-shadow-hover bg-background flex flex-col justify-center">
          <BookOpen className="text-accent" size={32} strokeWidth={1.5} />
          <h3 className="font-serif font-bold text-2xl uppercase italic">Organized</h3>
          <p className="text-sm leading-relaxed text-neutral-600">
            A library cataloged by cuisine and type. Find the specific record you require in a high-density column layout.
          </p>
        </div>
      </div>
    </div>
  );
}

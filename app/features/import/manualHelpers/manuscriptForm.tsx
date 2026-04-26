import { useEffect } from "react";
import { CATEGORIES, CUISINES } from "../importUtils";

interface ManuscriptFormProps {
  title: string;
  setTitle: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  cuisine: string;
  setCuisine: (val: string) => void;
  image: string | null;
  setImage: (val: string | null) => void;
  totalTime: string;
  setTotalTime: (val: string) => void;
  sourceUrl: string;
  setSourceUrl: (val: string) => void;
  servings: number | "";
  setServings: (val: number | "") => void;
  rawIngredients: string;
  setRawIngredients: (val: string) => void;
  rawInstructions: string;
  setRawInstructions: (val: string) => void;
  onParse: () => void;
  errors?: string[];
}

export function ManuscriptForm({ 
  title, setTitle, category, setCategory, cuisine, setCuisine, 
  image, setImage, totalTime, setTotalTime, sourceUrl, setSourceUrl, servings, setServings, 
  rawIngredients, setRawIngredients, rawInstructions, setRawInstructions, onParse, errors 
}: ManuscriptFormProps) {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [setImage]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Recipe Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent border-b-2 border-foreground py-2 font-serif text-2xl outline-none" placeholder="Untitled Record" />
        </div>
        <div>
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Recipe Image</label>
          <div className="flex items-center gap-4">
             <div className="flex-1 px-4 py-2 border-2 border-dashed border-foreground/30 font-mono text-[10px] uppercase text-neutral-400 select-none">
               {image ? (
                 <span className="text-accent font-bold italic tracking-tighter">Image Data Captured.</span>
               ) : (
                 "Paste Image (Ctrl+V)"
               )}
             </div>
          </div>
        </div>
        <div>
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Prep and Cook Time</label>
          <input type="text" value={totalTime} onChange={(e) => setTotalTime(e.target.value)} className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm outline-none" placeholder="e.g., 1h 30m or 45m" />
        </div>
        <div>
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Category</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm outline-none cursor-pointer rounded-none appearance-none"
          >
            <option value="" disabled>Select Category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Cuisine</label>
          <select 
            value={cuisine} 
            onChange={(e) => setCuisine(e.target.value)} 
            className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm outline-none cursor-pointer rounded-none appearance-none"
          >
            <option value="">None / General</option>
            {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Source URL</label>
          <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm outline-none" placeholder="https://..." />
        </div>
        <div>
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Serving Base (1-50)</label>
          <input 
            type="number" 
            value={servings} 
            onChange={(e) => {
              const val = e.target.value;
              setServings(val === "" ? "" : parseInt(val));
            }}
            className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            placeholder="1" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block">Ingredients Manuscript</label>
          <textarea rows={10} value={rawIngredients} onChange={(e) => setRawIngredients(e.target.value)} className="w-full bg-transparent border-2 border-foreground p-4 font-mono text-[16px] md:text-sm outline-none resize-none" placeholder="1 cup flour..." />
        </div>
        <div className="space-y-2">
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block">Instructions Manuscript</label>
          <textarea rows={10} value={rawInstructions} onChange={(e) => setRawInstructions(e.target.value)} className="w-full bg-transparent border-2 border-foreground p-4 font-mono text-[16px] md:text-sm outline-none resize-none" placeholder="Preheat oven..." />
        </div>
      </div>

      {errors && errors.length > 0 && (
        <div className="p-6 border-2 border-accent bg-accent/5 font-mono text-[10px] uppercase text-accent space-y-1">
          <p className="font-black mb-2">Submission Rejections:</p>
          <ul className="list-disc list-inside">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={onParse} 
        className="w-full py-4 bg-foreground text-background font-black uppercase text-xs cursor-pointer hover:bg-accent transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
      >
        Smart Parse Manuscript
      </button>
    </div>
  );
}
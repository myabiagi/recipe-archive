import { formatAmount } from "../importUtils";
import type { Ingredient } from "~/types/recipe";

interface ReviewEditorProps {
  title: string;
  category: string;
  cuisine: string;
  image: string | null;
  servings: number;
  totalTime: string;
  sourceUrl: string;
  ingredients: Ingredient[];
  setIngredients: (ings: Ingredient[]) => void;
  instructions: string[];
  setInstructions: (insts: string[]) => void;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveError: string | null;
}

export function ReviewEditor({ 
  title, category, cuisine, image, servings, totalTime, sourceUrl,
  ingredients, setIngredients, instructions, setInstructions, 
  onBack, onSave, isSaving, saveError 
}: ReviewEditorProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col md:flex-row gap-6 border-b-2 border-foreground pb-4">
        {image && (
          <img src={image} alt={title} className="w-32 h-32 object-cover border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
        )}
        <div>
          <h2 className="font-serif font-black text-3xl uppercase italic">{title || "Untitled"}</h2>
          <p className="font-mono text-[10px] uppercase text-neutral-500">{category}{cuisine ? ` — ${cuisine}` : ""} — {totalTime} — {servings} Servings</p>
          {sourceUrl && (
            <p className="font-mono text-[9px] uppercase text-neutral-400 mt-2 truncate max-w-xs">Source: {sourceUrl}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section>
          <h3 className="font-black uppercase text-[10px] tracking-widest border-b border-foreground/20 pb-2 mb-4">Ingredients</h3>
          {ingredients.map((ing: any, i: number) => (
            <div key={i} className="flex gap-2 font-mono text-xs border-b border-dotted border-neutral-300 pb-1 mb-2">
              <input 
                className="w-12 font-bold bg-transparent border-none outline-none" 
                value={formatAmount(ing.amount)} 
                onChange={e => setIngredients(ingredients.map((item, idx) => idx === i ? { ...item, amount: parseFloat(e.target.value) || 0 } : item))} 
              />
              <input 
                className="w-16 italic bg-transparent border-none outline-none" 
                value={ing.unit} 
                onChange={e => setIngredients(ingredients.map((item, idx) => idx === i ? { ...item, unit: e.target.value } : item))} 
              />
              <input 
                className="flex-1 bg-transparent border-none outline-none" 
                value={ing.item} 
                onChange={e => setIngredients(ingredients.map((item, idx) => idx === i ? { ...item, item: e.target.value } : item))} 
              />
            </div>
          ))}
        </section>
        <section>
          <h3 className="font-black uppercase text-[10px] tracking-widest border-b border-foreground/20 pb-2 mb-4">Instructions</h3>
          {instructions.map((inst: string, i: number) => (
            <textarea key={i} rows={2} className="w-full font-serif text-sm italic mb-4 p-2 bg-neutral-50 border-l-2 border-accent outline-none" value={inst} onChange={e => {
              const n = [...instructions]; n[i] = e.target.value; setInstructions(n);
            }} />
          ))}
        </section>
      </div>

      {saveError && (
        <div className="p-4 bg-accent/10 border-l-4 border-accent font-mono text-[10px] uppercase text-accent animate-pulse">
          Error: {saveError}
        </div>
      )}

      <div className="flex gap-4 pt-8 border-t-2 border-foreground">
        <button onClick={onBack} className="px-8 py-4 border-2 border-foreground font-black uppercase text-xs cursor-pointer">Edit Manuscript</button>
        <button onClick={onSave} disabled={isSaving} className="flex-1 py-4 bg-foreground text-background font-black uppercase text-xs cursor-pointer hover:bg-accent disabled:opacity-50">
          {isSaving ? "Archiving..." : "Commit to Archive"}
        </button>
      </div>
    </div>
  );
}
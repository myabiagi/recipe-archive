import { formatAmount } from "./importUtils";
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
  
  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    setIngredients(ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col md:flex-row gap-6 border-b-2 border-foreground pb-4">
        {image && (
          <img src={image} alt={title} className="w-32 h-32 object-cover border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
        )}
        <div>
          <h2 className="font-serif font-black text-3xl uppercase italic">{title || "Untitled"}</h2>
          <p className="font-mono text-[10px] uppercase text-neutral-500">
            {category}
            {cuisine ? ` — ${cuisine}` : ""}
            {totalTime ? ` — ${totalTime}` : ""}
            {` — ${servings} Servings`}
          </p>
          {sourceUrl && (
            <p className="font-mono text-[9px] uppercase text-neutral-400 mt-2 truncate max-w-xs">Source: {sourceUrl}</p>
          )}
        </div>
      </div>

      <div className="bg-accent/5 border-l-2 border-accent px-4 py-2 mb-8">
        <p className="font-mono text-[9px] uppercase text-accent font-bold tracking-tighter">Editorial Mode: Fields below are editable for final precision.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section>
          <h3 className="font-black uppercase text-[10px] tracking-widest border-b border-foreground/20 pb-2 mb-4">Ingredients</h3>
          {ingredients.map((ing: any, i: number) => (
            <div key={i} className="flex gap-2 font-mono text-[16px] md:text-xs border-b border-dotted border-neutral-300 pb-1 mb-2 hover:bg-neutral-50 transition-colors group">
              <input 
                className="w-12 font-bold bg-transparent border-none outline-none" 
                value={formatAmount(ing.amount)}
                onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
              />
              <input 
                className="w-20 italic bg-transparent border-none outline-none" 
                value={ing.unit} 
                onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
              />
              <input 
                className="flex-1 bg-transparent border-none outline-none min-w-0" 
                value={ing.item} 
                onChange={(e) => updateIngredient(i, 'item', e.target.value)}
              />
            </div>
          ))}
        </section>
        <section>
          <h3 className="font-black uppercase text-[10px] tracking-widest border-b border-foreground/20 pb-2 mb-4">Instructions</h3>
          {instructions.map((inst: string, i: number) => (
            <textarea 
              key={i} 
              rows={Math.max(2, Math.ceil(inst.length / 50))} 
              className="w-full font-serif text-[16px] md:text-sm mb-4 p-2 bg-neutral-50 border-l-2 border-accent outline-none focus:bg-white focus:shadow-inner transition-all resize-none" 
              value={inst} 
              onChange={e => {
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
        <button onClick={onBack} className="flex-1 py-4 border-2 border-foreground font-black uppercase text-[10px] md:text-xs cursor-pointer truncate px-1">Edit</button>
        <button onClick={onSave} disabled={isSaving} className="flex-[3] py-4 bg-foreground text-background font-black uppercase text-[10px] md:text-xs cursor-pointer hover:bg-accent disabled:opacity-50 px-1">
          {isSaving ? "Archiving..." : "Commit to Archive"}
        </button>
      </div>
    </div>
  );
}
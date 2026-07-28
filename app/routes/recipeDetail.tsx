import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Check, ChevronLeft, Edit3, SlidersHorizontal } from "lucide-react";
import { supabase } from "~/lib/supabase";
import type { Ingredient, Recipe } from "~/types/recipe";
import { CATEGORIES, CUISINES, formatAmount, parseAmount, smartParseLine } from "~/features/import/importHelpers/importUtils";

const SCALE_OPTIONS = [0.25, 0.5, 1, 2, 3, 4];

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [servingsBase, setServingsBase] = useState(1);
  const [totalTime, setTotalTime] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [instructionsText, setInstructionsText] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);

  const fetchRecipe = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (!error && data) {
      const nextRecipe = data as Recipe;
      setRecipe(nextRecipe);
      setTitle(nextRecipe.title);
      setCategory(nextRecipe.category || "");
      setCuisine(nextRecipe.cuisine || "");
      setServingsBase(nextRecipe.servings_base || 1);
      setTotalTime(nextRecipe.total_time || "");
      setSourceUrl(nextRecipe.source_url || "");
      setIngredientsText(nextRecipe.ingredients.map((item) => `${formatAmount(item.amount)} ${item.unit ? `${item.unit} ` : ""}${item.item}`.trim()).join("\n"));
      setInstructionsText(nextRecipe.instructions.join("\n"));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchRecipe();
    setSelectedIngredients([]);
  }, [id]);

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];

    const sourceIngredients = isEditing
      ? ingredientsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => smartParseLine(line))
          .filter((value): value is Ingredient => value !== null)
      : recipe.ingredients;

    return sourceIngredients.map((ingredient) => ({
      ...ingredient,
      amount: Number((ingredient.amount * scaleFactor).toFixed(2)),
    }));
  }, [recipe, scaleFactor, isEditing, ingredientsText]);

  const displayInstructions = useMemo(() => {
    if (!recipe) return [];
    if (!isEditing) return recipe.instructions;
    return instructionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [recipe, isEditing, instructionsText]);

  const displayValue = (value?: string | null) => (value && value.trim() ? value : "N/A");

  const toggleIngredientSelection = (index: number) => {
    setSelectedIngredients((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );
  };

  const handleSave = async () => {
    if (!recipe) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("You need to be signed in to update this recipe.");

      const parsedIngredients = ingredientsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => smartParseLine(line))
        .filter((value): value is Ingredient => value !== null)
        .map((value) => ({ ...value, amount: typeof value.amount === "string" ? parseAmount(String(value.amount)) : value.amount }));

      const parsedInstructions = instructionsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("recipes")
        .update({
          title: title.trim(),
          category,
          cuisine: cuisine.trim() || null,
          servings_base: Number(servingsBase),
          total_time: totalTime.trim() || null,
          source_url: sourceUrl.trim() || null,
          ingredients: parsedIngredients,
          instructions: parsedInstructions,
        })
        .eq("id", recipe.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setRecipe((current) =>
        current
          ? {
              ...current,
              title: title.trim(),
              category,
              cuisine: cuisine.trim() || null,
              servings_base: Number(servingsBase),
              total_time: totalTime.trim() || null,
              source_url: sourceUrl.trim() || null,
              ingredients: parsedIngredients,
              instructions: parsedInstructions,
            }
          : null
      );
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save your changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500">Loading the column...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-6 md:p-12">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600">
          <ChevronLeft size={14} /> Back to archive
        </Link>
        <div className="mt-8 border-2 border-dashed border-neutral-200 bg-white/70 p-10 text-center">
          <p className="font-serif text-xl italic text-neutral-400">This recipe could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b-4 border-foreground pb-4">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600">
          <ChevronLeft size={14} /> Back to archive
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing((value) => !value)}
            className="flex items-center gap-2 border-2 border-foreground bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em]"
          >
            <Edit3 size={14} /> {isEditing ? "Cancel edit" : "Edit recipe"}
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden border-2 border-foreground bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,0,0,0.03),_transparent_35%)]" />
        <div className="relative">
          <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500">
                {displayValue(recipe.category || "Archive")} • {displayValue(recipe.cuisine)}
              </p>
              {isEditing ? (
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full border-b-2 border-foreground bg-transparent pb-2 font-serif text-4xl font-black uppercase italic outline-none"
                />
              ) : (
                <h1 className="mt-2 font-serif text-4xl font-black uppercase italic leading-tight md:text-5xl">
                  {recipe.title}
                </h1>
              )}
            </div>
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.title} className="h-48 w-full max-w-[260px] border-2 border-foreground object-cover" />
            ) : (
              <div className="flex h-48 w-full max-w-[260px] items-center justify-center border-2 border-dashed border-neutral-300 bg-neutral-50 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                No image captured
              </div>
            )}
          </div>

          <div className="mb-8 grid gap-4 border-y border-foreground/20 py-4 md:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Meal Type</p>
              {isEditing ? (
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full border border-foreground bg-white px-2 py-2 font-sans text-sm outline-none">
                  <option value="">Select a meal type</option>
                  {CATEGORIES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 font-serif text-lg">{displayValue(recipe.category)}</p>
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Cuisine</p>
              {isEditing ? (
                <select value={cuisine} onChange={(event) => setCuisine(event.target.value)} className="mt-1 w-full border border-foreground bg-white px-2 py-2 font-sans text-sm outline-none">
                  <option value="">Select a cuisine</option>
                  {CUISINES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 font-serif text-lg">{displayValue(recipe.cuisine)}</p>
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Time</p>
              {isEditing ? (
                <input value={totalTime} onChange={(event) => setTotalTime(event.target.value)} className="mt-1 w-full border border-foreground bg-white px-2 py-2 font-sans text-sm outline-none" />
              ) : (
                <p className="mt-1 font-serif text-lg">{displayValue(recipe.total_time)}</p>
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Servings</p>
              {isEditing ? (
                <input type="number" min="1" value={servingsBase} onChange={(event) => setServingsBase(Number(event.target.value))} className="mt-1 w-full border border-foreground bg-white px-2 py-2 font-sans text-sm outline-none" />
              ) : (
                <p className="mt-1 font-serif text-lg">{displayValue(String(recipe.servings_base))}</p>
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Source</p>
              {isEditing ? (
                <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} className="mt-1 w-full border border-foreground bg-white px-2 py-2 font-sans text-sm outline-none" />
              ) : recipe.source_url ? (
                <a href={recipe.source_url} target="_blank" rel="noreferrer" className="mt-1 block font-serif text-lg text-accent underline break-all">
                  {displayValue(recipe.source_url)}
                </a>
              ) : (
                <p className="mt-1 font-serif text-lg">N/A</p>
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Scale</p>
              <div className="mt-2 flex items-center gap-2">
                {SCALE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setScaleFactor(option)}
                    className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${scaleFactor === option ? "border-foreground bg-foreground text-background" : "border-foreground/20 bg-white text-foreground"}`}
                  >
                    {option === 1 ? "1x" : `${option}x`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="border-r border-foreground/20 pr-0 lg:pr-8">
              <div className="mb-6 flex items-center gap-2 border-b border-foreground/20 pb-2">
                <SlidersHorizontal size={16} />
                <h2 className="font-mono text-[10px] uppercase tracking-[0.3em]">Ingredients</h2>
              </div>
              <div className="space-y-2">
                {scaledIngredients.map((ingredient, index) => {
                  const isChecked = selectedIngredients.includes(index);
                  return (
                    <button
                      key={`${ingredient.item}-${index}`}
                      type="button"
                      onClick={() => toggleIngredientSelection(index)}
                      className="flex w-full items-start gap-2 border-b border-dotted border-neutral-300 pb-2 text-left"
                    >
                      <span className={`mt-1 flex h-5 w-5 items-center justify-center border border-foreground ${isChecked ? "bg-foreground text-background" : "bg-white"}`}>
                        {isChecked && <Check size={12} />}
                      </span>
                      <p className={`font-serif text-lg leading-relaxed ${isChecked ? "text-neutral-500 line-through" : ""}`}>
                        <span className="font-semibold">{formatAmount(ingredient.amount)}</span>{ingredient.unit ? ` ${ingredient.unit}` : ""} {ingredient.item}
                      </p>
                    </button>
                  );
                })}
              </div>
              {isEditing && (
                <div className="mt-6">
                  <textarea value={ingredientsText} onChange={(event) => setIngredientsText(event.target.value)} rows={10} className="w-full border border-foreground bg-neutral-50 p-3 font-sans text-sm outline-none" />
                </div>
              )}
            </article>

            <aside>
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2 border-b border-foreground/20 pb-2">
                  <Check size={14} />
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.3em]">Instructions</h2>
                </div>
                <div className="space-y-3">
                  {displayInstructions.map((instruction, index) => (
                    <div key={`${instruction}-${index}`} className="rounded-none border border-foreground/20 bg-white p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Step {index + 1}</p>
                      <p className="mt-1 font-serif text-base leading-relaxed">{instruction}</p>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="mt-6">
                    <textarea value={instructionsText} onChange={(event) => setInstructionsText(event.target.value)} rows={10} className="w-full border border-foreground bg-neutral-50 p-3 font-sans text-sm outline-none" />
                  </div>
                )}
              </div>
            </aside>
          </div>

          {saveError && (
            <div className="mb-6 border-l-4 border-accent bg-accent/10 p-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              {saveError}
            </div>
          )}

          {isEditing && (
            <div className="flex flex-wrap gap-3 border-t border-foreground pt-6">
              <button type="button" onClick={() => setIsEditing(false)} className="border-2 border-foreground bg-white px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em]">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={isSaving} className="border-2 border-foreground bg-foreground px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-background disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

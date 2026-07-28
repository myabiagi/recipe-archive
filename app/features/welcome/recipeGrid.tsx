import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Check, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { supabase } from "~/lib/supabase";
import type { Recipe } from "~/types/recipe";
import { CATEGORIES, CUISINES } from "~/features/import/importHelpers/importUtils";

export function RecipeGrid() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [openSection, setOpenSection] = useState<"cuisine" | "mealType" | null>("cuisine");

  const availableCuisines = useMemo(() => {
    const values = new Set<string>();
    recipes.forEach((recipe) => {
      if (recipe.cuisine) values.add(recipe.cuisine);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [recipes]);

  const availableMealTypes = useMemo(() => {
    const values = new Set<string>();
    recipes.forEach((recipe) => {
      if (recipe.category) values.add(recipe.category);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCuisine =
        selectedCuisines.length === 0 || (recipe.cuisine ? selectedCuisines.includes(recipe.cuisine) : false);
      const matchesMealType =
        selectedMealTypes.length === 0 || (recipe.category ? selectedMealTypes.includes(recipe.category) : false);
      return matchesCuisine && matchesMealType;
    });
  }, [recipes, selectedCuisines, selectedMealTypes]);

  const fetchRecipes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRecipes(data as Recipe[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRecipes();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchRecipes();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleSelection = (
    value: string,
    current: string[],
    setter: (next: string[]) => void
  ) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-12 flex justify-center">
        <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Accessing Records...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12">
      <header className="mb-10 border-b-4 border-foreground pb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500">Editorial Archive</p>
          <h1 className="font-serif font-black text-5xl md:text-6xl uppercase italic tracking-tighter">
            My Book.
          </h1>
        </div>
        <span className="font-mono text-[10px] uppercase text-neutral-500 pb-2">
          Total Records: {recipes.length}
        </span>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-2 border-foreground bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 border-b border-foreground/20 pb-3 mb-4">
            <SlidersHorizontal size={16} />
            <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.25em]">Filters</h2>
          </div>

          <div className="space-y-3">
            <div className="border border-foreground/20">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.25em]"
                onClick={() => setOpenSection(openSection === "cuisine" ? null : "cuisine")}
              >
                <span>Cuisine</span>
                {openSection === "cuisine" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {openSection === "cuisine" && (
                <div className="border-t border-foreground/20 p-2 space-y-2">
                  {([...CUISINES.filter((option) => availableCuisines.includes(option)), ...availableCuisines.filter((option) => !CUISINES.includes(option))]).length > 0 ? [...CUISINES.filter((option) => availableCuisines.includes(option)), ...availableCuisines.filter((option) => !CUISINES.includes(option))] : CUISINES).map((option) => {
                    const active = selectedCuisines.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleSelection(option, selectedCuisines, setSelectedCuisines)}
                        className={`flex w-full items-center justify-between border px-2 py-2 text-left text-sm transition-colors ${active ? "border-foreground bg-foreground text-background" : "border-foreground/20 bg-white text-foreground hover:bg-neutral-50"}`}
                      >
                        <span>{option}</span>
                        {active && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border border-foreground/20">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.25em]"
                onClick={() => setOpenSection(openSection === "mealType" ? null : "mealType")}
              >
                <span>Meal Type</span>
                {openSection === "mealType" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {openSection === "mealType" && (
                <div className="border-t border-foreground/20 p-2 space-y-2">
                  {([...CATEGORIES.filter((option) => availableMealTypes.includes(option)), ...availableMealTypes.filter((option) => !CATEGORIES.includes(option))]).length > 0 ? [...CATEGORIES.filter((option) => availableMealTypes.includes(option)), ...availableMealTypes.filter((option) => !CATEGORIES.includes(option))] : CATEGORIES).map((option) => {
                    const active = selectedMealTypes.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleSelection(option, selectedMealTypes, setSelectedMealTypes)}
                        className={`flex w-full items-center justify-between border px-2 py-2 text-left text-sm transition-colors ${active ? "border-foreground bg-foreground text-background" : "border-foreground/20 bg-white text-foreground hover:bg-neutral-50"}`}
                      >
                        <span>{option}</span>
                        {active && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        <section>
          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  to={`/recipes/${recipe.id}`}
                  className="group block border-2 border-foreground bg-white transition-transform hover:-translate-y-1"
                >
                  <div className="aspect-square w-full overflow-hidden border-b-2 border-foreground bg-neutral-100">
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-4 text-center font-mono text-[10px] uppercase text-neutral-400">
                        No Image Captured
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="font-serif font-black text-sm uppercase leading-tight transition-all group-hover:italic">
                      {recipe.title}
                    </h2>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                      {recipe.category || "Archive"}
                      {recipe.cuisine ? ` • ${recipe.cuisine}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-neutral-200 bg-white/70 p-10 text-center">
              <p className="font-serif text-xl italic text-neutral-400">No records match the selected filters.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

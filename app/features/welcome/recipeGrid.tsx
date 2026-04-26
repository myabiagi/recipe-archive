import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import type { Recipe } from "~/types/recipe";

export function RecipeGrid() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRecipes(data);
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

  if (isLoading) {
    return (
      <div className="p-6 md:p-12 flex justify-center">
        <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Accessing Records...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12">
      <header className="mb-12 border-b-4 border-foreground pb-4 flex justify-between items-end">
        <h1 className="font-serif font-black text-5xl md:text-6xl uppercase italic tracking-tighter">
          My Book.
        </h1>
        <span className="font-mono text-[10px] uppercase text-neutral-500 pb-2">
          Total Records: {recipes.length}
        </span>
      </header>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="group cursor-pointer border-2 border-foreground bg-white transition-transform hover:-translate-y-1">
              <div className="aspect-square w-full overflow-hidden border-b-2 border-foreground bg-neutral-100">
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase text-neutral-400 text-center px-4">No Image Captured</div>
                )}
              </div>
              <div className="p-3">
                <h2 className="font-serif font-black uppercase text-sm leading-tight line-clamp-2 group-hover:italic transition-all">
                  {recipe.title}
                </h2>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-neutral-200">
          <p className="font-serif italic text-xl text-neutral-400">The archive is currently empty.</p>
        </div>
      )}
    </div>
  );
}
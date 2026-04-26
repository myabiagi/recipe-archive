import type { Route } from "./+types/home";
import { Welcome } from "~/features/welcome/welcome";
import { RecipeGrid } from "~/features/welcome/recipeGrid";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Recipe Archive" },
    { name: "description", content: "The modern way to save, scale, and organize your favorite recipes in one seamless vault." },
  ];
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Authenticating...</p>
      </div>
    );
  }

  return isAuthenticated ? <RecipeGrid /> : <Welcome />;
}

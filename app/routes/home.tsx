import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
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

  if (isLoading) return null; // Or a loading spinner

  if (!isAuthenticated) {
    return <Welcome />;
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Your Recipe Book</h1>
      <p className="text-gray-600 dark:text-gray-400">You haven't added any recipes yet. Try importing one!</p>
    </div>
  );
}

import { useState } from "react";
import { supabase } from "~/lib/supabase";
import { UrlForm } from "./importHelpers/urlForm";
import { CATEGORIES, CUISINES } from "./importHelpers/importUtils";

export function UrlImport({ onExtracted }: { onExtracted: (data: any) => void }) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveError(null);

    try {
      // This calls your Supabase Edge Function (we'll name it 'scrape-recipe')
      const { data, error } = await supabase.functions.invoke('scrape-recipe', {
        body: { url }
      });

      if (error) {
        console.error("Supabase Invoke Error:", error);
        throw new Error(error.message);
      }
      if (data?.error) throw new Error(data.error);
      if (!data) throw new Error("No data returned from the archive dispatch.");

      // Improved Category/Cuisine matching logic
      const findMatch = (list: string[], val: string) => 
        list.find(item => val?.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(val?.toLowerCase()));

      const payload = {
        title: data.title || "",
        image: data.image || null,
        totalTime: data.totalTime || "",
        servings: data.servings || 1,
        category: findMatch(CATEGORIES, data.category) || "",
        cuisine: findMatch(CUISINES, data.cuisine) || "",
        sourceUrl: url,
        ingredients: data.ingredients || [],
        instructions: data.instructions || []
      };
      
      onExtracted(payload);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Scrape failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <UrlForm 
        url={url} setUrl={setUrl} 
        onSubmit={handleUrlSubmit} 
        isLoading={isLoading} 
      />
      {saveError && (
        <div className="p-4 bg-accent/5 border-l-2 border-accent font-mono text-[10px] uppercase text-accent">
          Extraction Error: {saveError}
        </div>
      )}
    </div>
  );
}
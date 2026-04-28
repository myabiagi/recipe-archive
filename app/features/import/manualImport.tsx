import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { useNavigate } from "react-router";
import type { Ingredient } from "~/types/recipe";
import { smartParseLine, parseAmount, CATEGORIES, CUISINES } from "./importHelpers/importUtils";
import { ManuscriptForm } from "./importHelpers/manuscriptForm";
import { ReviewEditor } from "./importHelpers/reviewEditor";

export function ManualImport({ initialData }: { initialData?: any }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [servingsBase, setServingsBase] = useState<number | "">("");
  const [rawIngredients, setRawIngredients] = useState("");
  const [rawInstructions, setRawInstructions] = useState("");
  
  const [isReviewing, setIsReviewing] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  
  const navigate = useNavigate();

  // If data comes in from a URL scrape, pre-populate and enter review mode
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setCuisine(initialData.cuisine);
      setImage(initialData.image);
      setTotalTime(initialData.totalTime);
      setSourceUrl(initialData.sourceUrl);
      setRawIngredients(initialData.ingredients.join('\n'));
      setRawInstructions(initialData.instructions.join('\n'));
      
      // Auto-parse into Review Mode
      const ings = (initialData.ingredients as string[])
        .map(line => smartParseLine(line))
        .filter((ing): ing is Ingredient => ing !== null);
      
      setIngredients(ings);
      setInstructions(initialData.instructions);
      setIsReviewing(true);
    }
  }, [initialData]);

  const parseManuscript = () => {
    const errors: string[] = [];
    if (!title.trim()) errors.push("A recipe title is mandatory.");
    if (!CATEGORIES.includes(category)) errors.push("Please select a valid Category from the archive list.");
    if (cuisine.trim() && !CUISINES.includes(cuisine)) {
      errors.push("Please select a valid Cuisine from the archive list or leave it blank.");
    }
    
    const timeRegex = /^(?:\d+h\s*[0-5]?\dm|\d+h|[0-5]?\dm)$/i;
    if (totalTime.trim() && !timeRegex.test(totalTime.trim())) {
      errors.push("Time must be in a concise format (e.g., '1h 30m', '45m').");
    }

    if (!rawIngredients.trim()) errors.push("The Ingredients manuscript cannot be empty.");
    if (!rawInstructions.trim()) errors.push("The Instructions manuscript cannot be empty.");
    if (servingsBase === "" || servingsBase < 1 || servingsBase > 50) {
      errors.push("Servings must be a number between 1 and 50.");
    }

    setParseErrors(errors);
    if (errors.length > 0) return;

    const ingLines = rawIngredients.split("\n").filter(l => l.trim() !== "");
    const instLines = rawInstructions.split("\n").filter(l => l.trim() !== "");

    const ings = ingLines
      .map(line => smartParseLine(line))
      .filter((ing): ing is Ingredient => ing !== null);

    const insts = instLines.map(line => line.trim());

    setIngredients(ings);
    setInstructions(insts);
    setIsReviewing(true);
  };

  const handleSave = async () => {
    try {
      setSaveError(null);
      
      // Final safety check (though parseManuscript handles this)
      if (servingsBase === "") throw new Error("Servings are required.");

      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Unauthorized");

      const { error } = await supabase.from("recipes").insert([{
        user_id: session.user.id,
        title: title.trim(),
        image: image,
        category,
        cuisine: cuisine.trim() || null,
        // Normalize amounts for database storage
        // Final parse ensures any edited strings (like "1/2") are converted to numbers before saving
        ingredients: ingredients.map(ing => ({
          ...ing,
          amount: typeof ing.amount === 'string' ? parseAmount(ing.amount) : ing.amount
        })),
        instructions,
        servings_base: Number(servingsBase),
        source_url: sourceUrl.trim() || null,
        total_time: totalTime.trim() ? totalTime.trim().toLowerCase() : null
      }]);

      if (error) {
        console.error("Archive Rejection Details:", error);
        if (error.code === '23505') {
          // Check if the error was triggered by the URL or the Title
          if (error.message?.toLowerCase().includes('source_url')) {
            throw new Error("This specific dispatch URL has already been logged in your archive.");
          }
          if (error.message?.toLowerCase().includes('title') || error.message?.toLowerCase().includes('case_insensitive')) {
            throw new Error(`A record titled "${title.trim()}" (or a very similar variation) already exists.`);
          }
          throw new Error("A duplicate record was detected in the archive.");
        }
        throw new Error(error.message);
      }

      navigate("/");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isReviewing) {
    return (
      <ReviewEditor 
        title={title} category={category} cuisine={cuisine} 
        image={image} servings={servingsBase === "" ? 0 : Number(servingsBase)} sourceUrl={sourceUrl} totalTime={totalTime}
        ingredients={ingredients} setIngredients={setIngredients}
        instructions={instructions} setInstructions={setInstructions}
        onBack={() => setIsReviewing(false)}
        onSave={handleSave}
        isSaving={isSaving}
        saveError={saveError}
      />
    );
  }

  return (
    <ManuscriptForm 
      title={title} setTitle={setTitle}
      category={category} setCategory={setCategory}
      cuisine={cuisine} setCuisine={setCuisine}
      image={image} setImage={setImage} totalTime={totalTime} setTotalTime={setTotalTime}
      sourceUrl={sourceUrl} setSourceUrl={setSourceUrl}
      servings={servingsBase} setServings={setServingsBase}
      rawIngredients={rawIngredients} setRawIngredients={setRawIngredients}
      rawInstructions={rawInstructions} setRawInstructions={setRawInstructions}
      onParse={parseManuscript}
      errors={parseErrors}
    />
  );
}
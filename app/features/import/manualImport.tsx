import { useState } from "react";
import { supabase } from "~/lib/supabase";
import { useNavigate } from "react-router";
import type { Ingredient } from "~/types/recipe";
import { smartParseLine, CATEGORIES, CUISINES } from "./importUtils";
import { ManuscriptForm } from "./manualHelpers/manuscriptForm";
import { ReviewEditor } from "./manualHelpers/reviewEditor";

export function ManualImport() {
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
        ingredients,
        instructions,
        servings_base: Number(servingsBase),
        source_url: sourceUrl.trim() || null,
        total_time: totalTime.trim() ? totalTime.trim().toLowerCase() : null
      }]);

      if (error) {
        console.error("Archive Rejection Details:", error);
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
        image={image} servings={Number(servingsBase)} sourceUrl={sourceUrl} totalTime={totalTime}
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
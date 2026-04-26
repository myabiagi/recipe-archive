/// <reference lib="deno.ns" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!response.ok) throw new Error("Failed to fetch the website manuscript.");
    const html = await response.text();

    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let match;
    let recipeData = null;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const items = Array.isArray(data) ? data : (data['@graph'] || [data]);
        
        recipeData = items.find((item: any) => 
          item['@type'] === 'Recipe' || 
          (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
        );

        if (recipeData) break;
      } catch (e) { continue; }
    }

    if (!recipeData) throw new Error("The archive cannot find a digital manuscript (JSON-LD) on this page.");

    const parseDuration = (iso: string) => {
      if (!iso) return "";
      const reg = /PT(?:(\d+)H)?(?:(\d+)M)?/;
      const m = iso.match(reg);
      if (!m) return iso;
      return `${m[1] ? m[1] + 'h' : ''} ${m[2] ? m[2] + 'm' : ''}`.trim();
    };

    // Extremely defensive normalization of instructions
    const normalizeInstructions = (input: any): string[] => {
      const raw = Array.isArray(input) ? input : [input];
      return raw.flatMap((i: any) => {
        if (!i) return [];
        if (typeof i === 'string') return i;
        if (i.text) return i.text;
        if (i.itemListElement) return i.itemListElement.map((step: any) => step.text);
        if (Array.isArray(i)) return normalizeInstructions(i);
        return [];
      }).filter(Boolean);
    };

    const payload = {
      title: recipeData.name || "Untitled Scraped Recipe",
      image: Array.isArray(recipeData.image) ? recipeData.image[0] : (recipeData.image?.url || recipeData.image || null),
      ingredients: Array.isArray(recipeData.recipeIngredient) ? recipeData.recipeIngredient : [],
      instructions: normalizeInstructions(recipeData.recipeInstructions),
      // Handle servings that might be strings like "4-6 servings"
      servings: (() => {
        const yieldData = Array.isArray(recipeData.recipeYield) ? recipeData.recipeYield[0] : recipeData.recipeYield;
        const match = String(yieldData || "").match(/\d+/);
        return match ? parseInt(match[0]) : 1;
      })(),
      // Prioritize Total Time, then Cook, then Prep
      totalTime: parseDuration(recipeData.totalTime || recipeData.cookTime || recipeData.prepTime),
      category: Array.isArray(recipeData.recipeCategory) ? recipeData.recipeCategory[0] : (recipeData.recipeCategory || null),
      cuisine: Array.isArray(recipeData.recipeCuisine) ? recipeData.recipeCuisine[0] : (recipeData.recipeCuisine || null),
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    // Return a 200 with an error object so the frontend can easily read the message
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
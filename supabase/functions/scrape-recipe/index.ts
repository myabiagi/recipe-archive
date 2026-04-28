/// <reference lib="deno.ns" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request): Promise<Response> => {
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

    const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
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

    const decode = (str: any): string => {
      if (!str || typeof str !== 'string') return str || "";
      return str.replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, " ");
    };

    const parseDuration = (iso: string) => {
      if (!iso) return "";
      const reg = /PT(?:(\d+)H)?(?:(\d+)M)?/i;
      const m = String(iso).match(reg);
      if (!m) return iso;
      return `${m[1] ? m[1].toLowerCase() + 'h' : ''} ${m[2] ? m[2].toLowerCase() + 'm' : ''}`.trim();
    };

    const normalizeInstructions = (input: any): string[] => {
      const raw = Array.isArray(input) ? input : [input];
      return raw.flatMap((i: any) => {
        if (!i) return [];
        if (typeof i === 'string') return decode(i);
        if (i.text) return decode(i.text);
        if (i.itemListElement) {
          const elements = Array.isArray(i.itemListElement) ? i.itemListElement : [i.itemListElement];
          return elements.map((step: any) => decode(step.text || step.name || (typeof step === 'string' ? step : '')));
        }
        return [];
      }).filter(Boolean);
    };

    return new Response(JSON.stringify({
      title: decode(recipeData.name) || "Untitled Scraped Recipe",
      image: Array.isArray(recipeData.image) ? recipeData.image[0] : (recipeData.image?.url || recipeData.image || null),
      ingredients: (Array.isArray(recipeData.recipeIngredient) ? recipeData.recipeIngredient : []).map((ing: any) => decode(ing)),
      instructions: normalizeInstructions(recipeData.recipeInstructions),
      servings: (() => {
        const extractNumbers = (obj: any): number[] => {
          if (!obj) return [];
          if (typeof obj === 'number') return [obj];
          if (typeof obj === 'string') {
            return (obj.match(/\d+/g) || []).map(n => parseInt(n, 10));
          }
          if (Array.isArray(obj)) return obj.flatMap(extractNumbers);
          if (typeof obj === 'object') {
            // Check common sub-properties
            return extractNumbers(obj.text || obj.value || obj.amount || obj.name || "");
          }
          return [];
        };

        const allNums = [
          ...extractNumbers(recipeData.recipeYield),
          ...extractNumbers(recipeData.yield),
          ...extractNumbers(recipeData.yields)
        ].filter(n => n > 0);

        if (allNums.length === 0) return 0;
        // Calculate median of the range found
        return Math.floor((allNums[0] + allNums[allNums.length - 1]) / 2);
      })(),
      totalTime: (() => {
        const t = (recipeData.totalTime && String(recipeData.totalTime).length > 2) ? recipeData.totalTime :
                  (recipeData.cookTime && String(recipeData.cookTime).length > 2) ? recipeData.cookTime :
                  (recipeData.prepTime && String(recipeData.prepTime).length > 2) ? recipeData.prepTime : "";
        return parseDuration(t);
      })(),
      category: Array.isArray(recipeData.recipeCategory) ? recipeData.recipeCategory.join(", ") : (recipeData.recipeCategory || ""),
      cuisine: Array.isArray(recipeData.recipeCuisine) ? recipeData.recipeCuisine[0] : (recipeData.recipeCuisine || null),
    }), {
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
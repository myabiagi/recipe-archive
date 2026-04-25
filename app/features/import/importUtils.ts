import type { Ingredient } from "~/types/recipe";

const UNIT_KEYWORDS = [
  "cup", "cups", "tbsp", "tsp", "oz", "g", "kg", "ml", "l", "lb", "lbs", 
  "can", "clove", "cloves", "pinch", "dash", "slice", "slices", "bag", "package"
];

const IGNORE_KEYWORDS = [
  "ingredients", "instructions", "directions", "method", "cook mode", 
  "units", "usm", "prevent your screen", "prep time", "cook time"
];

/**
 * Converts a decimal number to a clean fraction string for the UI.
 */
export function formatAmount(amount: number): string {
  if (!amount) return "";
  if (Number.isInteger(amount)) return amount.toString();

  const tolerance = 0.01;
  const fractions: [number, string][] = [
    [0.2, "1/5"], [0.25, "1/4"], [0.33, "1/3"], [0.4, "2/5"],
    [0.5, "1/2"], [0.6, "3/5"], [0.66, "2/3"], [0.75, "3/4"], [0.8, "4/5"]
  ];

  const decimal = amount % 1;
  const whole = Math.floor(amount);

  for (const [val, str] of fractions) {
    if (Math.abs(decimal - val) < tolerance) {
      return whole > 0 ? `${whole} ${str}` : str;
    }
  }

  // Fallback to 2 decimal places if no common fraction matches
  return amount.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Attempts to extract amount, unit, and item from a raw string line.
 */
export function smartParseLine(line: string): Ingredient | null {
  const cleanLine = line.trim().toLowerCase();
  
  // Skip headers and noise
  if (IGNORE_KEYWORDS.some(k => cleanLine.includes(k)) || cleanLine.length < 2) {
    return null;
  }

  // Regex to capture: (Number or Fraction) (Optional Unit) (The rest of the string)
  const regex = /^([\d\/\.\s\-]+)?\s*([a-zA-Z]{1,10}\.?\b)?\s*(.*)$/;
  const match = line.trim().match(regex);

  if (!match) return null;

  const rawAmount = match[1]?.trim();
  const unitCandidate = match[2]?.trim() || "";
  const itemCandidate = match[3]?.trim() || "";
  
  const hasNumber = !!rawAmount && /[\d]/.test(rawAmount);
  let unit = ""; 
  let item = "";

  if (UNIT_KEYWORDS.includes(unitCandidate.toLowerCase())) {
    unit = unitCandidate.toLowerCase();
    item = itemCandidate;
  } else {
    unit = "";
    item = itemCandidate ? `${unitCandidate} ${itemCandidate}` : unitCandidate;
  }

  if ((!hasNumber && !unit) || !item) return null;

  // Basic fraction evaluator (e.g., "1 1/2" -> 1.5)
  const parseAmount = (val: string): number => {
    const cleanVal = val.replace(/\s+/g, ' ').trim();
    if (cleanVal.includes('/') && !cleanVal.includes(':')) {
      const parts = cleanVal.split(' ');
      if (parts.length > 1) return parseFloat(parts[0]) + (eval(parts[1]) || 0);
      return eval(cleanVal) || 1;
    }
    const num = parseFloat(val);
    return isNaN(num) ? 1 : num;
  };

  return {
    amount: hasNumber ? parseAmount(rawAmount!) : 1,
    unit: unit,
    item: item,
  };
}

export const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Appetizers", "Desserts", "Drinks", "Salads", "Soups", "Side Dishes", "Baking", "Sauces"];
export const CUISINES = ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "French", "Greek", "Thai", "Spanish", "Mediterranean", "American", "Middle Eastern", "Vietnamese", "Korean", "Brazilian", "African", "Caribbean", "German", "Russian", "Turkish", "Moroccan", "British", "Peruvian", "Filipino", "Fusion"];
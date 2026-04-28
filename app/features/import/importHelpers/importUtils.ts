import type { Ingredient } from "~/types/recipe";

const UNIT_CONVERSIONS: Record<string, string> = {
  "tablespoon": "tbsp",
  "tablespoons": "tbsp",
  "teaspoon": "tsp",
  "teaspoons": "tsp",
  "ounce": "oz",
  "ounces": "oz",
  "pound": "lb",
  "pounds": "lb",
  "gram": "g",
  "grams": "g",
  "kilogram": "kg",
  "kilograms": "kg",
  "milliliter": "ml",
  "milliliters": "ml",
  "liter": "l",
  "liters": "l"
};

const UNIT_KEYWORDS = [
  "cup", "cups", "tbsp", "tsp", "oz", "g", "kg", "ml", "l", "lb", "lbs", 
  "can", "clove", "cloves", "pinch", "dash", "slice", "slices", "bag", "package",
  ...Object.keys(UNIT_CONVERSIONS)
];

const IGNORE_KEYWORDS = [
  "ingredients", "instructions", "directions", "method", "cook mode", 
  "units", "usm", "prevent your screen", "prep time", "cook time"
];

const UNICODE_FRACTIONS: Record<string, string> = {
  '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4',
  '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5', '⅙': '1/6', '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8'
};

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
  // Normalize unicode fractions before parsing
  const normalizedLine = line.trim().replace(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, (m) => UNICODE_FRACTIONS[m] || m);
  const cleanLine = normalizedLine.toLowerCase();
  
  if (IGNORE_KEYWORDS.some(k => cleanLine.includes(k)) || cleanLine.length < 2) {
    return null;
  }

  // Regex to capture: (Number or Fraction) (Optional Unit) (The rest of the string)
  const regex = /^([\d\/\.\s\-]+)?\s*([a-zA-Z]{1,10}\.?\b)?\s*(.*)$/;
  const match = normalizedLine.match(regex);

  if (!match) return null;

  const rawAmount = match[1]?.trim();
  const unitCandidate = match[2]?.trim() || "";
  const itemCandidate = match[3]?.trim() || "";
  
  const hasNumber = !!rawAmount && /[\d]/.test(rawAmount);
  const isOptional = cleanLine.includes("optional");
  let unit = ""; 
  let item = "";

  const lowerUnitCandidate = unitCandidate.toLowerCase();
  if (UNIT_KEYWORDS.includes(lowerUnitCandidate)) {
    unit = UNIT_CONVERSIONS[lowerUnitCandidate] || lowerUnitCandidate;
    item = itemCandidate;
  } else {
    unit = "";
    item = itemCandidate ? `${unitCandidate} ${itemCandidate}` : unitCandidate;
  }

  // Decode common HTML entities often found in scraper metadata or raw pastes
  item = item.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#039;/g, "'")
             .replace(/&#39;/g, "'");

  // Clean up redundant punctuation and double brackets often found in scraper metadata
  item = item.replace(/\(\s*\(/g, '(').replace(/\)\s*\)/g, ')').replace(/,\s*\(/g, ' (').trim();

  if ((!hasNumber && !unit && !isOptional) || !item) return null;

  return {
    amount: hasNumber ? parseAmount(rawAmount!) : 1,
    unit: unit,
    item: item,
  };
}

/**
 * Safely parses strings and fractions (e.g., "1 1/2" -> 1.5) without using eval.
 */
export function parseAmount(val: string): number {
  const cleanVal = val.replace(/\s+/g, ' ').trim();
  if (cleanVal.includes('/') && !cleanVal.includes(':')) {
    const parts = cleanVal.split(' ');
    if (parts.length > 1) {
      const fraction = parts[1].split('/');
      return parseFloat(parts[0]) + (parseFloat(fraction[0]) / (parseFloat(fraction[1]) || 1));
    }
    const fraction = cleanVal.split('/');
    return parseFloat(fraction[0]) / (parseFloat(fraction[1]) || 1);
  }
  const num = parseFloat(val);
  return isNaN(num) ? 1 : num;
}

export const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Appetizers", "Desserts", "Drinks", "Salads", "Soups", "Side Dishes", "Baking", "Sauces"];
export const CUISINES = ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "French", "Greek", "Thai", "Spanish", "Mediterranean", "American", "Middle Eastern", "Vietnamese", "Korean", "Brazilian", "African", "Caribbean", "German", "Russian", "Turkish", "Moroccan", "British", "Peruvian", "Filipino", "Fusion"];
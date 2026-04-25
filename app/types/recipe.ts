export interface Ingredient {
  item: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  image: string | null;
  servings_base: number;
  category: string | null;
  cuisine: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  source_url: string | null;
  total_time: string | null;
}

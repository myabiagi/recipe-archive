import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("recipes/:id", "routes/recipeDetail.tsx"),
  route("import", "routes/importRecipe.tsx"),
  route("auth", "routes/auth.tsx"),
] satisfies RouteConfig;

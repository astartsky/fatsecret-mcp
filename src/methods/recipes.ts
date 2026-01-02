import { makeApiRequest } from "../oauth/request.js";
import type {
  FatSecretConfig,
  RecipeSearchResponse,
  RecipeDetailResponse,
  SearchRecipesOptions,
} from "../types.js";

/**
 * Search for recipes in the FatSecret database
 */
export async function searchRecipes(
  config: FatSecretConfig,
  searchExpression: string,
  options: SearchRecipesOptions = {}
): Promise<RecipeSearchResponse> {
  const params: Record<string, string> = {
    method: "recipes.search",
    search_expression: searchExpression,
    page_number: (options.pageNumber ?? 0).toString(),
    max_results: (options.maxResults ?? 20).toString(),
  };

  if (options.recipeType) {
    params.recipe_type = options.recipeType;
  }

  return makeApiRequest("GET", params, config, false) as Promise<RecipeSearchResponse>;
}

/**
 * Get detailed information about a specific recipe
 */
export async function getRecipe(
  config: FatSecretConfig,
  recipeId: string
): Promise<RecipeDetailResponse> {
  if (!recipeId) {
    throw new Error("Recipe ID is required");
  }

  return makeApiRequest(
    "GET",
    {
      method: "recipe.get",
      recipe_id: recipeId,
    },
    config,
    false
  ) as Promise<RecipeDetailResponse>;
}

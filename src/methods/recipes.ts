import { makeApiRequest } from "../oauth/request.js";
import {
  RecipeSearchResponseSchema,
  RecipeDetailResponseSchema,
  type RecipeSearchResponseParsed,
  type RecipeDetailResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig, SearchRecipesOptions, GetRecipeOptions } from "../types.js";

/**
 * Search for recipes in the FatSecret database
 */
export async function searchRecipes(
  config: FatSecretConfig,
  searchExpression: string,
  options: SearchRecipesOptions = {}
): Promise<RecipeSearchResponseParsed> {
  const params: Record<string, string> = {
    method: "recipes.search",
    search_expression: searchExpression,
    page_number: (options.pageNumber ?? 0).toString(),
    max_results: (options.maxResults ?? 20).toString(),
  };

  if (options.recipeTypes) {
    params.recipe_types = options.recipeTypes;
  }
  if (options.recipeTypesMatchAll !== undefined) {
    params.recipe_types_matchall = options.recipeTypesMatchAll ? "true" : "false";
  }
  if (options.mustHaveImages) {
    params.must_have_images = "true";
  }
  if (options.caloriesFrom !== undefined) {
    params["calories.from"] = options.caloriesFrom.toString();
  }
  if (options.caloriesTo !== undefined) {
    params["calories.to"] = options.caloriesTo.toString();
  }
  if (options.carbPercentageFrom !== undefined) {
    params["carb_percentage.from"] = options.carbPercentageFrom.toString();
  }
  if (options.carbPercentageTo !== undefined) {
    params["carb_percentage.to"] = options.carbPercentageTo.toString();
  }
  if (options.proteinPercentageFrom !== undefined) {
    params["protein_percentage.from"] = options.proteinPercentageFrom.toString();
  }
  if (options.proteinPercentageTo !== undefined) {
    params["protein_percentage.to"] = options.proteinPercentageTo.toString();
  }
  if (options.fatPercentageFrom !== undefined) {
    params["fat_percentage.from"] = options.fatPercentageFrom.toString();
  }
  if (options.fatPercentageTo !== undefined) {
    params["fat_percentage.to"] = options.fatPercentageTo.toString();
  }
  if (options.prepTimeFrom !== undefined) {
    params["prep_time.from"] = options.prepTimeFrom.toString();
  }
  if (options.prepTimeTo !== undefined) {
    params["prep_time.to"] = options.prepTimeTo.toString();
  }
  if (options.sortBy) {
    params.sort_by = options.sortBy;
  }
  if (options.region) {
    params.region = options.region;
  }

  return makeApiRequest("GET", params, config, false, RecipeSearchResponseSchema);
}

/**
 * Get detailed information about a specific recipe
 */
export async function getRecipe(
  config: FatSecretConfig,
  recipeId: string,
  options: GetRecipeOptions = {}
): Promise<RecipeDetailResponseParsed> {
  if (!recipeId) {
    throw new Error("Recipe ID is required");
  }

  const params: Record<string, string> = {
    method: "recipe.get",
    recipe_id: recipeId,
  };

  if (options.region) {
    params.region = options.region;
  }
  if (options.language) {
    params.language = options.language;
  }

  return makeApiRequest("GET", params, config, false, RecipeDetailResponseSchema);
}

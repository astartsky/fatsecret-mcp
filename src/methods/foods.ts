import { makeApiRequest } from "../oauth/request.js";
import {
  FoodSearchResponseSchema,
  FoodDetailResponseSchema,
  type FoodSearchResponseParsed,
  type FoodDetailResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig } from "../types.js";

/**
 * Search for foods in the FatSecret database
 */
export async function searchFoods(
  config: FatSecretConfig,
  searchExpression: string,
  pageNumber: number = 0,
  maxResults: number = 20
): Promise<FoodSearchResponseParsed> {
  return makeApiRequest(
    "GET",
    {
      method: "foods.search",
      search_expression: searchExpression,
      page_number: pageNumber.toString(),
      max_results: maxResults.toString(),
    },
    config,
    false,
    FoodSearchResponseSchema
  );
}

/**
 * Get detailed information about a specific food
 */
export async function getFood(
  config: FatSecretConfig,
  foodId: string
): Promise<FoodDetailResponseParsed> {
  if (!foodId) {
    throw new Error("Food ID is required");
  }

  return makeApiRequest(
    "GET",
    {
      method: "food.get",
      food_id: foodId,
    },
    config,
    false,
    FoodDetailResponseSchema
  );
}

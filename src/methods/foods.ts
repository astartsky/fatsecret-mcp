import { makeApiRequest } from "../oauth/request.js";
import type { FatSecretConfig, FoodSearchResponse, FoodDetailResponse } from "../types.js";

/**
 * Search for foods in the FatSecret database
 */
export async function searchFoods(
  config: FatSecretConfig,
  searchExpression: string,
  pageNumber: number = 0,
  maxResults: number = 20
): Promise<FoodSearchResponse> {
  return makeApiRequest(
    "GET",
    {
      method: "foods.search",
      search_expression: searchExpression,
      page_number: pageNumber.toString(),
      max_results: maxResults.toString(),
    },
    config,
    false
  ) as Promise<FoodSearchResponse>;
}

/**
 * Get detailed information about a specific food
 */
export async function getFood(
  config: FatSecretConfig,
  foodId: string
): Promise<FoodDetailResponse> {
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
    false
  ) as Promise<FoodDetailResponse>;
}

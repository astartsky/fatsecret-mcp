import { makeApiRequest } from "../oauth/request.js";
import { dateToFatSecretFormat } from "../utils/date.js";
import {
  FoodEntriesResponseSchema,
  FoodEntryCreateResponseSchema,
  type FoodEntriesResponseParsed,
  type FoodEntryCreateResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig, CreateFoodEntryParams } from "../types.js";

/**
 * Get user's food diary entries for a specific date
 */
export async function getFoodEntries(
  config: FatSecretConfig,
  date?: string
): Promise<FoodEntriesResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  return makeApiRequest(
    "GET",
    {
      method: "food_entries.get",
      date: dateToFatSecretFormat(date),
    },
    config,
    true,
    FoodEntriesResponseSchema
  );
}

/**
 * Add a food entry to the user's diary
 */
export async function createFoodEntry(
  config: FatSecretConfig,
  params: CreateFoodEntryParams
): Promise<FoodEntryCreateResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (params.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  return makeApiRequest(
    "POST",
    {
      method: "food_entry.create",
      food_id: params.foodId,
      food_entry_name: params.foodName,
      serving_id: params.servingId,
      number_of_units: params.quantity.toString(),
      meal: params.mealType,
      date: dateToFatSecretFormat(params.date),
    },
    config,
    true,
    FoodEntryCreateResponseSchema
  );
}

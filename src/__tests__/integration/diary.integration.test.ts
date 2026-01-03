import { describe, it, expect } from "vitest";
import { hasAuthTokens, authConfig, API_TIMEOUT } from "./setup.js";
import { getFoodEntries, createFoodEntry } from "../../methods/diary.js";

describe.skipIf(!hasAuthTokens)("Diary Integration Tests", () => {
  describe("getFoodEntries", () => {
    it(
      "should return food entries for today",
      async () => {
        const result = await getFoodEntries(authConfig);

        expect(result).toBeDefined();
        expect(result.food_entries).toBeDefined();
        // food_entry should be an array (possibly empty)
        expect(result.food_entries.food_entry).toBeDefined();
        expect(Array.isArray(result.food_entries.food_entry)).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should return food entries for specific date",
      async () => {
        // Use a date format that the API accepts (YYYY-MM-DD)
        const date = "2024-01-15";
        const result = await getFoodEntries(authConfig, date);

        expect(result).toBeDefined();
        expect(result.food_entries).toBeDefined();
        expect(Array.isArray(result.food_entries.food_entry)).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should return empty array for date with no entries",
      async () => {
        // Use an old date unlikely to have entries
        const date = "2010-01-01";
        const result = await getFoodEntries(authConfig, date);

        expect(result.food_entries).toBeDefined();
        expect(result.food_entries.food_entry).toEqual([]);
      },
      API_TIMEOUT
    );

    it(
      "should return valid food entry structure when entries exist",
      async () => {
        const result = await getFoodEntries(authConfig);

        if (result.food_entries.food_entry.length > 0) {
          const entry = result.food_entries.food_entry[0];

          // Required fields
          expect(entry.food_entry_id).toBeDefined();
          expect(entry.food_id).toBeDefined();
          expect(entry.food_entry_name).toBeDefined();
          expect(entry.serving_id).toBeDefined();
          expect(entry.number_of_units).toBeDefined();
          expect(entry.meal).toBeDefined();
          expect(entry.date_int).toBeDefined();

          // Meal should be one of the valid types (API returns capitalized)
          expect(["breakfast", "lunch", "dinner", "other"]).toContain(entry.meal.toLowerCase());
        }
      },
      API_TIMEOUT
    );

    it(
      "should return nutritional data when entries exist",
      async () => {
        const result = await getFoodEntries(authConfig);

        if (result.food_entries.food_entry.length > 0) {
          const entry = result.food_entries.food_entry[0];

          // Nutritional data should be valid if present
          if (entry.calories) {
            expect(parseFloat(entry.calories)).toBeGreaterThanOrEqual(0);
          }
          if (entry.protein) {
            expect(parseFloat(entry.protein)).toBeGreaterThanOrEqual(0);
          }
          if (entry.fat) {
            expect(parseFloat(entry.fat)).toBeGreaterThanOrEqual(0);
          }
          if (entry.carbohydrate) {
            expect(parseFloat(entry.carbohydrate)).toBeGreaterThanOrEqual(0);
          }
        }
      },
      API_TIMEOUT
    );
  });

  describe("createFoodEntry", () => {
    // Skip createFoodEntry tests by default to avoid modifying user data
    // Uncomment and configure if you want to test creation

    it(
      "should create a food entry",
      async () => {
        // First get a valid food_id and serving_id from search
        const { searchFoods, getFood } = await import("../../methods/foods.js");
        const searchResult = await searchFoods(authConfig, "apple", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const foodDetails = await getFood(authConfig, foodId);
        const servingId = foodDetails.food.servings.serving[0].serving_id;

        const params = {
          foodId,
          foodName: "Apple - Integration Test",
          servingId,
          quantity: 1,
          mealType: "other" as const,
        };

        const result = await createFoodEntry(authConfig, params);

        expect(result).toBeDefined();
        expect(result.food_entry_id).toBeDefined();
        expect(result.food_entry_id.value).toBeDefined();
        expect(parseInt(result.food_entry_id.value)).toBeGreaterThan(0);
      },
      API_TIMEOUT
    );

    it(
      "should create food entry with specific date",
      async () => {
        // Get a valid food_id and serving_id
        const { searchFoods, getFood } = await import("../../methods/foods.js");
        const searchResult = await searchFoods(authConfig, "banana", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const foodDetails = await getFood(authConfig, foodId);
        const servingId = foodDetails.food.servings.serving[0].serving_id;

        const params = {
          foodId,
          foodName: "Banana - Date Test",
          servingId,
          quantity: 0.5,
          mealType: "breakfast" as const,
          date: "2024-12-25",
        };

        const result = await createFoodEntry(authConfig, params);

        expect(result).toBeDefined();
        expect(result.food_entry_id).toBeDefined();
        expect(result.food_entry_id.value).toBeDefined();
      },
      API_TIMEOUT
    );
  });
});

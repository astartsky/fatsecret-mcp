import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchRecipes, getRecipe } from "../../methods/recipes.js";
import type { FatSecretConfig, RecipeSearchResponse, RecipeDetailResponse } from "../../types.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeApiRequest: vi.fn(),
}));

describe("searchRecipes", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;
  const testConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should search for recipes with default options", async () => {
    const mockResponse: RecipeSearchResponse = {
      recipes: {
        recipe: [
          {
            recipe_id: "123",
            recipe_name: "Chicken Salad",
            recipe_description: "A healthy chicken salad",
          },
        ],
        max_results: "20",
        page_number: "0",
        total_results: "1",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await searchRecipes(testConfig, "chicken");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "recipes.search",
        search_expression: "chicken",
        page_number: "0",
        max_results: "20",
      },
      testConfig,
      false
    );
    expect(result).toEqual(mockResponse);
  });

  it("should search with custom page number", async () => {
    mockMakeApiRequest.mockResolvedValue({ recipes: { recipe: [] } });

    await searchRecipes(testConfig, "pasta", { pageNumber: 3 });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        page_number: "3",
      }),
      testConfig,
      false
    );
  });

  it("should search with custom max results", async () => {
    mockMakeApiRequest.mockResolvedValue({ recipes: { recipe: [] } });

    await searchRecipes(testConfig, "pasta", { maxResults: 50 });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        max_results: "50",
      }),
      testConfig,
      false
    );
  });

  it("should search with recipe type filter", async () => {
    mockMakeApiRequest.mockResolvedValue({ recipes: { recipe: [] } });

    await searchRecipes(testConfig, "soup", { recipeType: "Main Dish" });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        recipe_type: "Main Dish",
      }),
      testConfig,
      false
    );
  });

  it("should search with all options", async () => {
    mockMakeApiRequest.mockResolvedValue({ recipes: { recipe: [] } });

    await searchRecipes(testConfig, "salad", {
      pageNumber: 1,
      maxResults: 30,
      recipeType: "Side Dish",
    });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "recipes.search",
        search_expression: "salad",
        page_number: "1",
        max_results: "30",
        recipe_type: "Side Dish",
      },
      testConfig,
      false
    );
  });

  it("should not include recipe_type when not provided", async () => {
    mockMakeApiRequest.mockResolvedValue({ recipes: { recipe: [] } });

    await searchRecipes(testConfig, "test", {});

    const callArgs = mockMakeApiRequest.mock.calls[0][1];
    expect(callArgs).not.toHaveProperty("recipe_type");
  });

  it("should use useAccessToken=false for public search", async () => {
    mockMakeApiRequest.mockResolvedValue({ recipes: { recipe: [] } });

    await searchRecipes(testConfig, "test");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      testConfig,
      false
    );
  });

  it("should handle empty options object", async () => {
    mockMakeApiRequest.mockResolvedValue({ recipes: { recipe: [] } });

    await searchRecipes(testConfig, "test", {});

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "recipes.search",
        search_expression: "test",
        page_number: "0",
        max_results: "20",
      },
      testConfig,
      false
    );
  });
});

describe("getRecipe", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;
  const testConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should get recipe details by ID", async () => {
    const mockResponse: RecipeDetailResponse = {
      recipe: {
        recipe_id: "12345",
        recipe_name: "Grilled Chicken",
        recipe_description: "Delicious grilled chicken recipe",
        ingredients: {
          ingredient: [
            {
              food_id: "1",
              food_name: "Chicken breast",
              number_of_units: "2",
            },
          ],
        },
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getRecipe(testConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "recipe.get",
        recipe_id: "12345",
      },
      testConfig,
      false
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when recipe ID is empty", async () => {
    await expect(getRecipe(testConfig, "")).rejects.toThrow("Recipe ID is required");
  });

  it("should use useAccessToken=false for public recipe details", async () => {
    mockMakeApiRequest.mockResolvedValue({ recipe: {} });

    await getRecipe(testConfig, "123");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      testConfig,
      false
    );
  });

  it("should handle recipe without ingredients", async () => {
    const mockResponse: RecipeDetailResponse = {
      recipe: {
        recipe_id: "123",
        recipe_name: "Simple Recipe",
        recipe_description: "A recipe without detailed ingredients",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getRecipe(testConfig, "123");

    expect(result.recipe.ingredients).toBeUndefined();
  });

  it("should not make API call when recipe ID is missing", async () => {
    try {
      await getRecipe(testConfig, "");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle recipe with multiple ingredients", async () => {
    const mockResponse: RecipeDetailResponse = {
      recipe: {
        recipe_id: "456",
        recipe_name: "Complex Recipe",
        recipe_description: "A recipe with many ingredients",
        ingredients: {
          ingredient: [
            { food_id: "1", food_name: "Salt", number_of_units: "1" },
            { food_id: "2", food_name: "Pepper", number_of_units: "1" },
            { food_id: "3", food_name: "Olive oil", number_of_units: "2" },
          ],
        },
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getRecipe(testConfig, "456");

    expect(result.recipe.ingredients?.ingredient).toHaveLength(3);
  });
});

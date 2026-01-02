import type { RequestInit } from "node-fetch";

// Config
export interface FatSecretConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  accessTokenSecret?: string;
  userId?: string;
}

// OAuth
export interface OAuthParams {
  oauth_consumer_key: string;
  oauth_nonce: string;
  oauth_signature_method: string;
  oauth_timestamp: string;
  oauth_version: string;
  oauth_token?: string;
  oauth_signature?: string;
}

// API Responses
export interface FoodItem {
  food_id: string;
  food_name: string;
  food_type: string;
  food_description: string;
  brand_name?: string;
  food_url?: string;
}

export interface FoodSearchResponse {
  foods: {
    food: FoodItem[];
    max_results: string;
    page_number: string;
    total_results: string;
  };
}

export interface Serving {
  serving_id: string;
  serving_description: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  calories: string;
  fat: string;
  carbohydrate: string;
  protein: string;
}

export interface FoodDetailResponse {
  food: {
    food_id: string;
    food_name: string;
    food_type: string;
    food_url?: string;
    servings: {
      serving: Serving | Serving[];
    };
  };
}

export interface RecipeItem {
  recipe_id: string;
  recipe_name: string;
  recipe_description: string;
  recipe_image?: string;
}

export interface RecipeSearchResponse {
  recipes: {
    recipe: RecipeItem[];
    max_results: string;
    page_number: string;
    total_results: string;
  };
}

export interface RecipeDetailResponse {
  recipe: {
    recipe_id: string;
    recipe_name: string;
    recipe_description: string;
    recipe_url?: string;
    ingredients?: {
      ingredient: Array<{
        food_id: string;
        food_name: string;
        number_of_units: string;
      }>;
    };
  };
}

export interface ProfileResponse {
  profile: {
    user_id: string;
    first_name?: string;
    last_name?: string;
    height_measure?: string;
    weight_measure?: string;
  };
}

export interface FoodEntry {
  food_entry_id: string;
  food_id: string;
  food_entry_name: string;
  serving_id: string;
  number_of_units: string;
  meal: string;
  date_int: string;
  calories?: string;
}

export interface FoodEntriesResponse {
  food_entries: {
    food_entry?: FoodEntry | FoodEntry[];
  };
}

export interface FoodEntryCreateResponse {
  food_entry_id: {
    value: string;
  };
}

export interface WeightEntry {
  date_int: string;
  weight_kg?: string;
  weight_lbs?: string;
}

export interface WeightMonthResponse {
  month: {
    day?: WeightEntry | WeightEntry[];
  };
}

export interface OAuthTokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_callback_confirmed?: string;
}

export interface AccessTokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
  user_id?: string;
}

// Method params
export interface CreateFoodEntryParams {
  foodId: string;
  foodName: string;
  servingId: string;
  quantity: number;
  mealType: string;
  date?: string;
}

export interface SearchRecipesOptions {
  recipeType?: string;
  pageNumber?: number;
  maxResults?: number;
}

// Request context for OAuth
export interface OAuthContext {
  config: FatSecretConfig;
  baseUrl: string;
}

export type HttpMethod = "GET" | "POST";

export interface FetchOptions extends RequestInit {
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

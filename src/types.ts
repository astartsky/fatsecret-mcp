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

// Method params
export interface CreateFoodEntryParams {
  foodId: string;
  foodName: string;
  servingId: string;
  quantity: number;
  mealType: string;
  date?: string;
}

export interface SearchFoodsOptions {
  pageNumber?: number;
  maxResults?: number;
  includeSubCategories?: boolean;
  includeFoodImages?: boolean;
  includeFoodAttributes?: boolean;
  flagDefaultServing?: boolean;
  region?: string;
  language?: string;
}

export interface GetFoodOptions {
  includeSubCategories?: boolean;
  includeFoodImages?: boolean;
  includeFoodAttributes?: boolean;
  flagDefaultServing?: boolean;
  region?: string;
  language?: string;
}

export interface SearchRecipesOptions {
  pageNumber?: number;
  maxResults?: number;
  recipeTypes?: string;
  recipeTypesMatchAll?: boolean;
  mustHaveImages?: boolean;
  caloriesFrom?: number;
  caloriesTo?: number;
  carbPercentageFrom?: number;
  carbPercentageTo?: number;
  proteinPercentageFrom?: number;
  proteinPercentageTo?: number;
  fatPercentageFrom?: number;
  fatPercentageTo?: number;
  prepTimeFrom?: number;
  prepTimeTo?: number;
  sortBy?: 'newest' | 'oldest' | 'caloriesPerServingAscending' | 'caloriesPerServingDescending';
  region?: string;
}

export interface GetRecipeOptions {
  region?: string;
  language?: string;
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

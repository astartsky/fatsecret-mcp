import type {
  FatSecretConfig,
  FoodSearchResponse,
  FoodDetailResponse,
  RecipeSearchResponse,
  RecipeDetailResponse,
  ProfileResponse,
  FoodEntriesResponse,
  FoodEntryCreateResponse,
  WeightMonthResponse,
  OAuthTokenResponse,
  AccessTokenResponse,
  CreateFoodEntryParams,
  SearchRecipesOptions,
} from "./types.js";

import * as methods from "./methods/index.js";
import { AUTHORIZE_URL } from "./methods/auth.js";

export class FatSecretClient {
  private config: FatSecretConfig;
  readonly authorizeUrl = AUTHORIZE_URL;

  constructor(config: FatSecretConfig) {
    this.config = config;
  }

  updateConfig(updates: Partial<FatSecretConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getConfig(): FatSecretConfig {
    return { ...this.config };
  }

  hasCredentials(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }

  hasAccessToken(): boolean {
    return !!(this.config.accessToken && this.config.accessTokenSecret);
  }

  // Foods
  searchFoods(
    searchExpression: string,
    pageNumber?: number,
    maxResults?: number
  ): Promise<FoodSearchResponse> {
    return methods.searchFoods(this.config, searchExpression, pageNumber, maxResults);
  }

  getFood(foodId: string): Promise<FoodDetailResponse> {
    return methods.getFood(this.config, foodId);
  }

  // Recipes
  searchRecipes(
    searchExpression: string,
    options?: SearchRecipesOptions
  ): Promise<RecipeSearchResponse> {
    return methods.searchRecipes(this.config, searchExpression, options);
  }

  getRecipe(recipeId: string): Promise<RecipeDetailResponse> {
    return methods.getRecipe(this.config, recipeId);
  }

  // Profile
  getProfile(): Promise<ProfileResponse> {
    return methods.getProfile(this.config);
  }

  // Food Diary
  getFoodEntries(date?: string): Promise<FoodEntriesResponse> {
    return methods.getFoodEntries(this.config, date);
  }

  createFoodEntry(params: CreateFoodEntryParams): Promise<FoodEntryCreateResponse> {
    return methods.createFoodEntry(this.config, params);
  }

  // Weight
  getWeightMonth(date?: string): Promise<WeightMonthResponse> {
    return methods.getWeightMonth(this.config, date);
  }

  // OAuth
  getRequestToken(callbackUrl?: string): Promise<OAuthTokenResponse> {
    return methods.getRequestToken(this.config, callbackUrl);
  }

  getAccessToken(
    requestToken: string,
    requestTokenSecret: string,
    verifier: string
  ): Promise<AccessTokenResponse> {
    return methods.getAccessToken(this.config, requestToken, requestTokenSecret, verifier);
  }
}

// Re-export types
export type { FatSecretConfig } from "./types.js";

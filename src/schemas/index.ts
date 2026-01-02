// Utils
export { normalizeToArray, singleOrArray, optionalSingleOrArray } from "./utils.js";

// OAuth schemas
export {
  OAuthTokenResponseSchema,
  AccessTokenResponseSchema,
  type OAuthTokenResponseParsed,
  type AccessTokenResponseParsed,
} from "./oauth.js";

// Food schemas
export {
  FoodSearchResponseSchema,
  FoodDetailResponseSchema,
  type FoodSearchResponseParsed,
  type FoodDetailResponseParsed,
  type FoodItem,
  type Serving,
} from "./foods.js";

// Recipe schemas
export {
  RecipeSearchResponseSchema,
  RecipeDetailResponseSchema,
  type RecipeSearchResponseParsed,
  type RecipeDetailResponseParsed,
  type RecipeItem,
  type Ingredient,
} from "./recipes.js";

// Profile schemas
export {
  ProfileResponseSchema,
  type ProfileResponseParsed,
} from "./profile.js";

// Diary schemas
export {
  FoodEntriesResponseSchema,
  FoodEntryCreateResponseSchema,
  type FoodEntriesResponseParsed,
  type FoodEntryCreateResponseParsed,
  type FoodEntry,
} from "./diary.js";

// Weight schemas
export {
  WeightMonthResponseSchema,
  type WeightMonthResponseParsed,
  type WeightEntry,
} from "./weight.js";

// Error handling
export { ApiErrorSchema, ApiValidationError, FatSecretApiError } from "./error.js";

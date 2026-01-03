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
  FoodEntryEditResponseSchema,
  FoodEntryDeleteResponseSchema,
  FoodEntriesMonthResponseSchema,
  type FoodEntriesResponseParsed,
  type FoodEntryCreateResponseParsed,
  type FoodEntryEditResponseParsed,
  type FoodEntryDeleteResponseParsed,
  type FoodEntriesMonthResponseParsed,
  type FoodEntry,
  type DaySummary,
} from "./diary.js";

// Weight schemas
export {
  WeightMonthResponseSchema,
  WeightUpdateResponseSchema,
  type WeightMonthResponseParsed,
  type WeightUpdateResponseParsed,
  type WeightEntry,
} from "./weight.js";

// Error handling
export { ApiErrorSchema, ApiValidationError, FatSecretApiError } from "./error.js";

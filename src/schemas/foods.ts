import { z } from "zod";
import { singleOrArray, optionalSingleOrArray } from "./utils.js";

const FoodItemSchema = z.object({
  food_id: z.string(),
  food_name: z.string(),
  food_type: z.string(),
  food_description: z.string(),
  brand_name: z.string().optional(),
  food_url: z.string().optional(),
});

const ServingSchema = z.object({
  serving_id: z.string(),
  serving_description: z.string(),
  metric_serving_amount: z.string().optional(),
  metric_serving_unit: z.string().optional(),
  number_of_units: z.string().optional(),
  measurement_description: z.string().optional(),
  calories: z.string(),
  fat: z.string(),
  carbohydrate: z.string(),
  protein: z.string(),
  saturated_fat: z.string().optional(),
  polyunsaturated_fat: z.string().optional(),
  monounsaturated_fat: z.string().optional(),
  trans_fat: z.string().optional(),
  cholesterol: z.string().optional(),
  sodium: z.string().optional(),
  potassium: z.string().optional(),
  fiber: z.string().optional(),
  sugar: z.string().optional(),
  vitamin_a: z.string().optional(),
  vitamin_c: z.string().optional(),
  calcium: z.string().optional(),
  iron: z.string().optional(),
});

export const FoodSearchResponseSchema = z.object({
  foods: z.object({
    food: optionalSingleOrArray(FoodItemSchema),
    max_results: z.string(),
    page_number: z.string(),
    total_results: z.string(),
  }),
});

export const FoodDetailResponseSchema = z.object({
  food: z.object({
    food_id: z.string(),
    food_name: z.string(),
    food_type: z.string(),
    food_url: z.string().optional(),
    brand_name: z.string().optional(),
    servings: z.object({
      serving: singleOrArray(ServingSchema),
    }),
  }),
});

export type FoodSearchResponseParsed = z.infer<typeof FoodSearchResponseSchema>;
export type FoodDetailResponseParsed = z.infer<typeof FoodDetailResponseSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type Serving = z.infer<typeof ServingSchema>;

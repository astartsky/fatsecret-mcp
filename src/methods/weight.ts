import { makeApiRequest } from "../oauth/request.js";
import { dateToFatSecretFormat } from "../utils/date.js";
import {
  WeightMonthResponseSchema,
  type WeightMonthResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig } from "../types.js";

/**
 * Get user's weight entries for a specific month
 */
export async function getWeightMonth(
  config: FatSecretConfig,
  date?: string
): Promise<WeightMonthResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  return makeApiRequest(
    "GET",
    {
      method: "weights.get_month",
      date: dateToFatSecretFormat(date),
    },
    config,
    true,
    WeightMonthResponseSchema
  );
}

import { makeApiRequest } from "../oauth/request.js";
import type { FatSecretConfig, ProfileResponse } from "../types.js";

/**
 * Get the authenticated user's profile
 */
export async function getProfile(
  config: FatSecretConfig
): Promise<ProfileResponse> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  return makeApiRequest(
    "GET",
    { method: "profile.get" },
    config,
    true
  ) as Promise<ProfileResponse>;
}

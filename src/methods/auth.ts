import { makeOAuthRequest } from "../oauth/request.js";
import type {
  FatSecretConfig,
  OAuthTokenResponse,
  AccessTokenResponse,
} from "../types.js";

const REQUEST_TOKEN_URL = "https://authentication.fatsecret.com/oauth/request_token";
const ACCESS_TOKEN_URL = "https://authentication.fatsecret.com/oauth/access_token";
export const AUTHORIZE_URL = "https://authentication.fatsecret.com/oauth/authorize";

/**
 * Get OAuth request token to start the authentication flow
 */
export async function getRequestToken(
  config: FatSecretConfig,
  callbackUrl: string = "oob"
): Promise<OAuthTokenResponse> {
  return makeOAuthRequest(
    "POST",
    REQUEST_TOKEN_URL,
    { oauth_callback: callbackUrl },
    config
  ) as Promise<OAuthTokenResponse>;
}

/**
 * Exchange request token and verifier for access token
 */
export async function getAccessToken(
  config: FatSecretConfig,
  requestToken: string,
  requestTokenSecret: string,
  verifier: string
): Promise<AccessTokenResponse> {
  return makeOAuthRequest(
    "GET",
    ACCESS_TOKEN_URL,
    { oauth_verifier: verifier },
    config,
    requestToken,
    requestTokenSecret
  ) as Promise<AccessTokenResponse>;
}

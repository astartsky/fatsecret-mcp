import fetch from "node-fetch";
import querystring from "querystring";
import { z } from "zod";
import { buildOAuthParams, generateSignature } from "./signature.js";
import { encodeParams } from "../utils/encoding.js";
import { ApiValidationError, ApiErrorSchema, FatSecretApiError } from "../schemas/index.js";
import type { FatSecretConfig, HttpMethod, FetchOptions } from "../types.js";

const BASE_URL = "https://platform.fatsecret.com/rest/server.api";

/**
 * Checks if the response is an API error and throws FatSecretApiError if so.
 */
function checkForApiError(data: unknown): void {
  const errorResult = ApiErrorSchema.safeParse(data);
  if (errorResult.success) {
    throw new FatSecretApiError(
      errorResult.data.error.code,
      errorResult.data.error.message
    );
  }
}

/**
 * Validates response data against a Zod schema.
 * Throws ApiValidationError with detailed information on failure.
 */
function validateResponse<T>(
  schema: z.ZodType<T>,
  data: unknown
): T {
  // First check if response is an API error
  checkForApiError(data);

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiValidationError(result.error, data);
  }
  return result.data;
}

/**
 * Make an OAuth 1.0 authenticated request
 */
export async function makeOAuthRequest<T>(
  method: HttpMethod,
  url: string,
  params: Record<string, string>,
  config: FatSecretConfig,
  token: string | undefined,
  tokenSecret: string | undefined,
  schema: z.ZodType<T>
): Promise<T> {
  const oauthParams = buildOAuthParams(config.clientId, token);
  const allParams = { ...params, ...oauthParams };

  const signature = generateSignature(
    method,
    url,
    allParams,
    config.clientSecret,
    tokenSecret
  );

  allParams.oauth_signature = signature;

  const options: FetchOptions = {
    method,
    headers: {},
  };

  let requestUrl = url;
  if (method === "GET") {
    requestUrl += "?" + encodeParams(allParams);
  } else {
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = encodeParams(allParams);
  }

  const response = await fetch(requestUrl, options);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`OAuth error: ${response.status} - ${text}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = querystring.parse(text);
  }

  return validateResponse(schema, data);
}

/**
 * Make an API request to FatSecret
 */
export async function makeApiRequest<T>(
  method: HttpMethod,
  params: Record<string, string>,
  config: FatSecretConfig,
  useAccessToken: boolean,
  schema: z.ZodType<T>
): Promise<T> {
  const token = useAccessToken ? config.accessToken : undefined;
  const tokenSecret = useAccessToken ? config.accessTokenSecret : undefined;

  const oauthParams = buildOAuthParams(config.clientId, token);

  // Don't mutate the original params
  const allParams: Record<string, string> = { ...params, format: "json", ...oauthParams };

  const signature = generateSignature(
    method,
    BASE_URL,
    allParams,
    config.clientSecret,
    tokenSecret
  );

  allParams.oauth_signature = signature;

  const options: FetchOptions = {
    method,
    headers: {},
  };

  let requestUrl = BASE_URL;
  if (method === "GET") {
    requestUrl += "?" + encodeParams(allParams);
  } else {
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = encodeParams(allParams);
  }

  const response = await fetch(requestUrl, options);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`FatSecret API error: ${response.status} - ${text}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = querystring.parse(text);
  }

  return validateResponse(schema, data);
}

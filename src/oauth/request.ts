import fetch from "node-fetch";
import querystring from "querystring";
import { buildOAuthParams, generateSignature } from "./signature.js";
import { encodeParams } from "../utils/encoding.js";
import type { FatSecretConfig, HttpMethod, FetchOptions } from "../types.js";

const BASE_URL = "https://platform.fatsecret.com/rest/server.api";

/**
 * Make an OAuth 1.0 authenticated request
 */
export async function makeOAuthRequest(
  method: HttpMethod,
  url: string,
  params: Record<string, string>,
  config: FatSecretConfig,
  token?: string,
  tokenSecret?: string
): Promise<unknown> {
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

  try {
    return JSON.parse(text);
  } catch {
    return querystring.parse(text);
  }
}

/**
 * Make an API request to FatSecret
 */
export async function makeApiRequest(
  method: HttpMethod,
  params: Record<string, string>,
  config: FatSecretConfig,
  useAccessToken: boolean = true
): Promise<unknown> {
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

  try {
    return JSON.parse(text);
  } catch {
    return querystring.parse(text);
  }
}

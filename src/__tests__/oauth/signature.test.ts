import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createSignatureBaseString,
  createSigningKey,
  generateSignature,
  generateNonce,
  generateTimestamp,
  buildOAuthParams,
} from "../../oauth/signature.js";

describe("createSignatureBaseString", () => {
  it("should sort params and encode per OAuth 1.0 spec", () => {
    const result = createSignatureBaseString(
      "GET",
      "https://api.example.com/resource",
      { z: "3", a: "1", m: "2" }
    );

    expect(result).toBe(
      "GET&https%3A%2F%2Fapi.example.com%2Fresource&a%3D1%26m%3D2%26z%3D3"
    );
  });

  it("should handle POST method", () => {
    const result = createSignatureBaseString(
      "POST",
      "https://api.example.com/resource",
      { param: "value" }
    );

    expect(result).toContain("POST&");
  });

  it("should handle lowercase method by converting to uppercase", () => {
    const result = createSignatureBaseString(
      "get",
      "https://api.example.com/resource",
      { param: "value" }
    );

    expect(result).toContain("GET&");
  });

  it("should encode special characters in params", () => {
    const result = createSignatureBaseString(
      "GET",
      "https://api.example.com",
      { "test!": "value*" }
    );

    // Parameters are percent-encoded, then the entire string is percent-encoded again
    // So ! becomes %21 then %2521, and * becomes %2A then %252A
    expect(result).toContain("test%2521%3Dvalue%252A");
  });

  it("should handle empty params", () => {
    const result = createSignatureBaseString(
      "GET",
      "https://api.example.com",
      {}
    );

    expect(result).toBe("GET&https%3A%2F%2Fapi.example.com&");
  });

  it("should handle OAuth-style parameters", () => {
    const result = createSignatureBaseString(
      "GET",
      "https://api.example.com/resource",
      {
        oauth_consumer_key: "key123",
        oauth_nonce: "nonce123",
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: "1234567890",
        oauth_version: "1.0",
      }
    );

    expect(result).toContain("oauth_consumer_key%3Dkey123");
    expect(result).toContain("oauth_nonce%3Dnonce123");
  });
});

describe("createSigningKey", () => {
  it("should create key with client secret and empty token secret", () => {
    const result = createSigningKey("clientSecret123", "");
    expect(result).toBe("clientSecret123&");
  });

  it("should create key with client secret and token secret", () => {
    const result = createSigningKey("clientSecret", "tokenSecret");
    expect(result).toBe("clientSecret&tokenSecret");
  });

  it("should create key with default empty token secret", () => {
    const result = createSigningKey("clientSecret");
    expect(result).toBe("clientSecret&");
  });

  it("should encode special characters in secrets", () => {
    const result = createSigningKey("client&secret", "token&secret");
    expect(result).toBe("client%26secret&token%26secret");
  });

  it("should handle empty client secret", () => {
    const result = createSigningKey("", "tokenSecret");
    expect(result).toBe("&tokenSecret");
  });

  it("should handle RFC 3986 special characters", () => {
    const result = createSigningKey("secret!'()*", "token!'()*");
    expect(result).toBe("secret%21%27%28%29%2A&token%21%27%28%29%2A");
  });
});

describe("generateSignature", () => {
  it("should generate valid HMAC-SHA1 signature", () => {
    const signature = generateSignature(
      "GET",
      "https://api.example.com/resource",
      { param: "value" },
      "clientSecret",
      "tokenSecret"
    );

    // Signature should be base64 encoded
    expect(signature).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("should generate consistent signature for same inputs", () => {
    const params = { a: "1", b: "2" };
    const sig1 = generateSignature("GET", "https://api.example.com", params, "secret", "token");
    const sig2 = generateSignature("GET", "https://api.example.com", params, "secret", "token");

    expect(sig1).toBe(sig2);
  });

  it("should generate different signatures for different params", () => {
    const sig1 = generateSignature("GET", "https://api.example.com", { a: "1" }, "secret", "token");
    const sig2 = generateSignature("GET", "https://api.example.com", { a: "2" }, "secret", "token");

    expect(sig1).not.toBe(sig2);
  });

  it("should generate different signatures for different secrets", () => {
    const sig1 = generateSignature("GET", "https://api.example.com", { a: "1" }, "secret1", "");
    const sig2 = generateSignature("GET", "https://api.example.com", { a: "1" }, "secret2", "");

    expect(sig1).not.toBe(sig2);
  });

  it("should work without token secret", () => {
    const signature = generateSignature(
      "GET",
      "https://api.example.com",
      { param: "value" },
      "clientSecret"
    );

    expect(signature).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("should generate different signatures for different methods", () => {
    const sig1 = generateSignature("GET", "https://api.example.com", { a: "1" }, "secret", "");
    const sig2 = generateSignature("POST", "https://api.example.com", { a: "1" }, "secret", "");

    expect(sig1).not.toBe(sig2);
  });
});

describe("generateNonce", () => {
  it("should generate 32-character hex string", () => {
    const nonce = generateNonce();

    expect(nonce).toHaveLength(32);
    expect(nonce).toMatch(/^[0-9a-f]+$/);
  });

  it("should generate unique values", () => {
    const nonces = new Set<string>();
    for (let i = 0; i < 100; i++) {
      nonces.add(generateNonce());
    }

    expect(nonces.size).toBe(100);
  });

  it("should only contain lowercase hex characters", () => {
    const nonce = generateNonce();
    expect(nonce).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe("generateTimestamp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return Unix timestamp as string", () => {
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));

    const timestamp = generateTimestamp();

    expect(timestamp).toBe("1705320000");
  });

  it("should return current time in seconds", () => {
    const now = 1700000000000; // milliseconds
    vi.setSystemTime(now);

    const timestamp = generateTimestamp();

    expect(timestamp).toBe("1700000000");
  });

  it("should floor fractional seconds", () => {
    vi.setSystemTime(1700000000999); // .999 seconds

    const timestamp = generateTimestamp();

    expect(timestamp).toBe("1700000000");
  });

  it("should return string type", () => {
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    const timestamp = generateTimestamp();

    expect(typeof timestamp).toBe("string");
  });
});

describe("buildOAuthParams", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should build basic OAuth params without token", () => {
    const params = buildOAuthParams("myClientId");

    expect(params.oauth_consumer_key).toBe("myClientId");
    expect(params.oauth_signature_method).toBe("HMAC-SHA1");
    expect(params.oauth_version).toBe("1.0");
    expect(params.oauth_timestamp).toBe("1705320000");
    expect(params.oauth_nonce).toHaveLength(32);
    expect(params.oauth_token).toBeUndefined();
  });

  it("should include token when provided", () => {
    const params = buildOAuthParams("myClientId", "myToken");

    expect(params.oauth_consumer_key).toBe("myClientId");
    expect(params.oauth_token).toBe("myToken");
  });

  it("should not include oauth_token when token is undefined", () => {
    const params = buildOAuthParams("myClientId", undefined);

    expect(params).not.toHaveProperty("oauth_token");
  });

  it("should not include oauth_token when token is empty string", () => {
    const params = buildOAuthParams("myClientId", "");

    expect(params).not.toHaveProperty("oauth_token");
  });

  it("should generate unique nonce for each call", () => {
    const params1 = buildOAuthParams("clientId");
    const params2 = buildOAuthParams("clientId");

    expect(params1.oauth_nonce).not.toBe(params2.oauth_nonce);
  });

  it("should have all required OAuth 1.0 fields", () => {
    const params = buildOAuthParams("clientId");

    const requiredFields = [
      "oauth_consumer_key",
      "oauth_nonce",
      "oauth_signature_method",
      "oauth_timestamp",
      "oauth_version",
    ];

    for (const field of requiredFields) {
      expect(params).toHaveProperty(field);
    }
  });
});

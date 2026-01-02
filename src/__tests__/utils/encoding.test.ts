import { describe, it, expect } from "vitest";
import { percentEncode, encodeParams } from "../../utils/encoding.js";

describe("percentEncode", () => {
  it("should encode per RFC 3986", () => {
    expect(percentEncode("hello world")).toBe("hello%20world");
    expect(percentEncode("test!*'()")).toBe("test%21%2A%27%28%29");
    expect(percentEncode("abc-_.~123")).toBe("abc-_.~123");
  });

  it("should encode empty string", () => {
    expect(percentEncode("")).toBe("");
  });

  it("should encode special characters", () => {
    expect(percentEncode("@#$%^&")).toBe("%40%23%24%25%5E%26");
    expect(percentEncode("=+")).toBe("%3D%2B");
  });

  it("should preserve unreserved characters", () => {
    expect(percentEncode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~"))
      .toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~");
  });

  it("should encode unicode characters", () => {
    expect(percentEncode("cafe")).toBe("cafe");
  });
});

describe("encodeParams", () => {
  it("should encode simple key-value pairs", () => {
    const result = encodeParams({ foo: "bar", baz: "qux" });
    expect(result).toBe("foo=bar&baz=qux");
  });

  it("should encode empty object", () => {
    expect(encodeParams({})).toBe("");
  });

  it("should encode single parameter", () => {
    expect(encodeParams({ key: "value" })).toBe("key=value");
  });

  it("should encode parameters with special characters", () => {
    const result = encodeParams({ "search query": "hello world" });
    expect(result).toBe("search%20query=hello%20world");
  });

  it("should encode OAuth parameters correctly", () => {
    const result = encodeParams({
      oauth_consumer_key: "key123",
      oauth_signature_method: "HMAC-SHA1",
    });
    expect(result).toBe("oauth_consumer_key=key123&oauth_signature_method=HMAC-SHA1");
  });

  it("should encode parameters with empty values", () => {
    const result = encodeParams({ key: "" });
    expect(result).toBe("key=");
  });

  it("should encode RFC 3986 special characters in values", () => {
    const result = encodeParams({ test: "!*'()" });
    expect(result).toBe("test=%21%2A%27%28%29");
  });
});

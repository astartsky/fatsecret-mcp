import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWeightMonth } from "../../methods/weight.js";
import type { FatSecretConfig } from "../../types.js";
import type { WeightMonthResponseParsed } from "../../schemas.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeApiRequest: vi.fn(),
}));

// Mock the date utility
vi.mock("../../utils/date.js", () => ({
  dateToFatSecretFormat: vi.fn((date?: string) => {
    if (date === "2024-01-15") return "19737";
    if (date === "2024-02-01") return "19754";
    return "19737"; // default for undefined (today)
  }),
}));

describe("getWeightMonth", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should get weight entries for a specific month", async () => {
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [
          {
            date_int: "19737",
            weight_kg: "75.5",
            weight_lbs: "166.4",
          },
          {
            date_int: "19738",
            weight_kg: "75.3",
            weight_lbs: "166.0",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig, "2024-01-15");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "weights.get_month",
        date: "19737",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get weight entries for current month when no date provided", async () => {
    mockMakeApiRequest.mockResolvedValue({ month: { day: [] } });

    await getWeightMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "weights.get_month",
        date: "19737",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(getWeightMonth(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when access token secret is missing", async () => {
    const configWithoutSecret: FatSecretConfig = {
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      accessToken: "test_access_token",
    };

    await expect(getWeightMonth(configWithoutSecret)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ month: { day: [] } });

    await getWeightMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should use GET method", async () => {
    mockMakeApiRequest.mockResolvedValue({ month: { day: [] } });

    await getWeightMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should handle empty weight data", async () => {
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig);

    expect(result.month.day).toEqual([]);
  });

  it("should handle single day weight entry normalized to array", async () => {
    // Note: With schema validation, single entries are normalized to arrays
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [
          {
            date_int: "19737",
            weight_kg: "80.0",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig);

    expect(result.month.day).toBeDefined();
    expect(Array.isArray(result.month.day)).toBe(true);
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getWeightMonth(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should call weights.get_month method", async () => {
    mockMakeApiRequest.mockResolvedValue({ month: { day: [] } });

    await getWeightMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        method: "weights.get_month",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should handle weight entries with only kg", async () => {
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [
          {
            date_int: "19737",
            weight_kg: "75.5",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig);

    expect(result.month.day).toHaveLength(1);
  });

  it("should handle weight entries with only lbs", async () => {
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [
          {
            date_int: "19737",
            weight_lbs: "166.4",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig);

    expect(result.month.day).toHaveLength(1);
  });
});

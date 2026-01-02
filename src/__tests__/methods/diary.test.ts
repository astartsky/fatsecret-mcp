import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFoodEntries, createFoodEntry } from "../../methods/diary.js";
import type {
  FatSecretConfig,
  FoodEntriesResponse,
  FoodEntryCreateResponse,
  CreateFoodEntryParams,
} from "../../types.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeApiRequest: vi.fn(),
}));

// Mock the date utility
vi.mock("../../utils/date.js", () => ({
  dateToFatSecretFormat: vi.fn((date?: string) => {
    if (date === "2024-01-15") return "19737";
    if (date === "2024-01-01") return "19723";
    return "19737"; // default for undefined (today)
  }),
}));

describe("getFoodEntries", () => {
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

  it("should get food entries for a specific date", async () => {
    const mockResponse: FoodEntriesResponse = {
      food_entries: {
        food_entry: [
          {
            food_entry_id: "123",
            food_id: "456",
            food_entry_name: "Apple",
            serving_id: "1",
            number_of_units: "1",
            meal: "breakfast",
            date_int: "19737",
            calories: "95",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntries(authenticatedConfig, "2024-01-15");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "food_entries.get",
        date: "19737",
      },
      authenticatedConfig,
      true
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get food entries for today when no date provided", async () => {
    mockMakeApiRequest.mockResolvedValue({ food_entries: {} });

    await getFoodEntries(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "food_entries.get",
        date: "19737",
      },
      authenticatedConfig,
      true
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(getFoodEntries(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ food_entries: {} });

    await getFoodEntries(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true
    );
  });

  it("should handle empty food entries", async () => {
    const mockResponse: FoodEntriesResponse = {
      food_entries: {},
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntries(authenticatedConfig);

    expect(result.food_entries.food_entry).toBeUndefined();
  });

  it("should handle single food entry (not array)", async () => {
    const mockResponse: FoodEntriesResponse = {
      food_entries: {
        food_entry: {
          food_entry_id: "123",
          food_id: "456",
          food_entry_name: "Banana",
          serving_id: "1",
          number_of_units: "1",
          meal: "snack",
          date_int: "19737",
        },
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntries(authenticatedConfig);

    expect(result.food_entries.food_entry).toBeDefined();
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getFoodEntries(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });
});

describe("createFoodEntry", () => {
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

  const validParams: CreateFoodEntryParams = {
    foodId: "12345",
    foodName: "Apple",
    servingId: "1",
    quantity: 1,
    mealType: "breakfast",
    date: "2024-01-15",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should create food entry with valid params", async () => {
    const mockResponse: FoodEntryCreateResponse = {
      food_entry_id: {
        value: "98765",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await createFoodEntry(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food_entry.create",
        food_id: "12345",
        food_entry_name: "Apple",
        serving_id: "1",
        number_of_units: "1",
        meal: "breakfast",
        date: "19737",
      },
      authenticatedConfig,
      true
    );
    expect(result).toEqual(mockResponse);
  });

  it("should create food entry without date (use today)", async () => {
    const paramsWithoutDate: CreateFoodEntryParams = {
      foodId: "12345",
      foodName: "Banana",
      servingId: "2",
      quantity: 2,
      mealType: "snack",
    };

    mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "111" } });

    await createFoodEntry(authenticatedConfig, paramsWithoutDate);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        food_id: "12345",
        food_entry_name: "Banana",
        number_of_units: "2",
        meal: "snack",
      }),
      authenticatedConfig,
      true
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(createFoodEntry(unauthenticatedConfig, validParams)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when quantity is zero", async () => {
    const invalidParams: CreateFoodEntryParams = {
      ...validParams,
      quantity: 0,
    };

    await expect(createFoodEntry(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should throw error when quantity is negative", async () => {
    const invalidParams: CreateFoodEntryParams = {
      ...validParams,
      quantity: -1,
    };

    await expect(createFoodEntry(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "123" } });

    await createFoodEntry(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true
    );
  });

  it("should convert quantity to string", async () => {
    const paramsWithFloat: CreateFoodEntryParams = {
      ...validParams,
      quantity: 1.5,
    };

    mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "123" } });

    await createFoodEntry(authenticatedConfig, paramsWithFloat);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        number_of_units: "1.5",
      }),
      authenticatedConfig,
      true
    );
  });

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "123" } });

    await createFoodEntry(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await createFoodEntry(unauthenticatedConfig, validParams);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when quantity is invalid", async () => {
    try {
      await createFoodEntry(authenticatedConfig, { ...validParams, quantity: 0 });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle different meal types", async () => {
    const mealTypes = ["breakfast", "lunch", "dinner", "other"];

    for (const mealType of mealTypes) {
      vi.clearAllMocks();
      mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "123" } });

      await createFoodEntry(authenticatedConfig, { ...validParams, mealType });

      expect(mockMakeApiRequest).toHaveBeenCalledWith(
        "POST",
        expect.objectContaining({ meal: mealType }),
        authenticatedConfig,
        true
      );
    }
  });
});

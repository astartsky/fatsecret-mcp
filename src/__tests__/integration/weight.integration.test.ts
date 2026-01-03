import { describe, it, expect } from "vitest";
import { hasAuthTokens, authConfig, API_TIMEOUT } from "./setup.js";
import { getWeightMonth } from "../../methods/weight.js";

describe.skipIf(!hasAuthTokens)("Weight Integration Tests", () => {
  describe("getWeightMonth", () => {
    it(
      "should return weight entries for current month",
      async () => {
        const result = await getWeightMonth(authConfig);

        expect(result).toBeDefined();
        expect(result.month).toBeDefined();
        // day should be an array (possibly empty)
        expect(result.month.day).toBeDefined();
        expect(Array.isArray(result.month.day)).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should return weight entries for specific date",
      async () => {
        // Use a specific date to get that month's entries
        const date = "2024-06-15";
        const result = await getWeightMonth(authConfig, date);

        expect(result).toBeDefined();
        expect(result.month).toBeDefined();
        expect(Array.isArray(result.month.day)).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should return date range for the month",
      async () => {
        const result = await getWeightMonth(authConfig);

        // Date range may be present
        if (result.month.from_date_int) {
          const fromDate = parseInt(result.month.from_date_int);
          expect(Number.isInteger(fromDate)).toBe(true);
          expect(fromDate).toBeGreaterThan(0);
        }

        if (result.month.to_date_int) {
          const toDate = parseInt(result.month.to_date_int);
          expect(Number.isInteger(toDate)).toBe(true);
          expect(toDate).toBeGreaterThan(0);
        }

        // If both are present, to_date should be >= from_date
        if (result.month.from_date_int && result.month.to_date_int) {
          const fromDate = parseInt(result.month.from_date_int);
          const toDate = parseInt(result.month.to_date_int);
          expect(toDate).toBeGreaterThanOrEqual(fromDate);
        }
      },
      API_TIMEOUT
    );

    it(
      "should return empty array for month with no entries",
      async () => {
        // Use an old date unlikely to have entries
        const date = "2010-01-01";
        const result = await getWeightMonth(authConfig, date);

        expect(result.month).toBeDefined();
        expect(result.month.day).toEqual([]);
      },
      API_TIMEOUT
    );

    it(
      "should return valid weight entry structure when entries exist",
      async () => {
        const result = await getWeightMonth(authConfig);

        if (result.month.day.length > 0) {
          const entry = result.month.day[0];

          // date_int is required
          expect(entry.date_int).toBeDefined();
          const dateInt = parseInt(entry.date_int);
          expect(Number.isInteger(dateInt)).toBe(true);
          expect(dateInt).toBeGreaterThan(0);

          // Weight values should be valid if present
          if (entry.weight_kg) {
            const weightKg = parseFloat(entry.weight_kg);
            expect(weightKg).toBeGreaterThan(0);
            expect(weightKg).toBeLessThan(1000); // Sanity check
          }

          if (entry.weight_lbs) {
            const weightLbs = parseFloat(entry.weight_lbs);
            expect(weightLbs).toBeGreaterThan(0);
            expect(weightLbs).toBeLessThan(2200); // Sanity check
          }
        }
      },
      API_TIMEOUT
    );

    it(
      "should return weight comment when available",
      async () => {
        const result = await getWeightMonth(authConfig);

        // Just verify the structure - comment is optional
        if (result.month.day.length > 0) {
          const entryWithComment = result.month.day.find((d) => d.weight_comment);
          if (entryWithComment) {
            expect(typeof entryWithComment.weight_comment).toBe("string");
          }
        }
      },
      API_TIMEOUT
    );

    it(
      "should return consistent kg and lbs values",
      async () => {
        const result = await getWeightMonth(authConfig);

        if (result.month.day.length > 0) {
          for (const entry of result.month.day) {
            if (entry.weight_kg && entry.weight_lbs) {
              const weightKg = parseFloat(entry.weight_kg);
              const weightLbs = parseFloat(entry.weight_lbs);

              // 1 kg = 2.20462 lbs (with some tolerance for rounding)
              const expectedLbs = weightKg * 2.20462;
              const tolerance = 0.5; // Allow 0.5 lbs tolerance

              expect(weightLbs).toBeGreaterThan(expectedLbs - tolerance);
              expect(weightLbs).toBeLessThan(expectedLbs + tolerance);
            }
          }
        }
      },
      API_TIMEOUT
    );
  });
});

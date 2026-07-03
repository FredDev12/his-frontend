import { describe, expect, it } from "vitest";

import {
  clearCsrfToken,
  getCsrfToken,
  setCsrfToken
} from "../shared/services/api";

describe("api csrf token memory", () => {
  it("stores and clears csrf token", () => {
    setCsrfToken("token-test");

    expect(getCsrfToken()).toBe("token-test");

    clearCsrfToken();

    expect(getCsrfToken()).toBe(null);
  });
});

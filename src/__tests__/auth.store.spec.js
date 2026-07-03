import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useAuthStore } from "../modules/auth/stores/auth.store";

describe("auth store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("stores user, csrf token and permissions", () => {
    const auth = useAuthStore();

    auth.setSession({
      data: {
        csrfToken: "csrf-test",
        user: {
          firstName: "Frederic",
          lastName: "Betukumesu",
          email: "admin@his.local",
          role: {
            code: "ADMIN",
            name: "Administrateur"
          },
          permissions: ["dashboard:read", "reception:read"]
        }
      }
    });

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.fullName).toBe("Frederic Betukumesu");
    expect(auth.roleCode).toBe("ADMIN");
    expect(auth.hasPermission("dashboard:read")).toBe(true);
    expect(auth.hasPermission("audit:read")).toBe(false);
  });

  it("clears session", () => {
    const auth = useAuthStore();

    auth.setSession({
      data: {
        csrfToken: "csrf-test",
        user: {
          firstName: "Test",
          permissions: ["dashboard:read"]
        }
      }
    });

    auth.clearSession();

    expect(auth.isAuthenticated).toBe(false);
    expect(auth.permissions).toEqual([]);
  });
});

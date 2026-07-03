import { useAuthStore } from "@/modules/auth/stores/auth.store";

export async function applyAuthGuard(to) {
  const auth = useAuthStore();

  if (!auth.initialized) {
    try {
      await auth.loadCurrentUser();
    } catch {
      if (to.meta?.requiresAuth !== false) {
        return {
          path: "/login",
          query: {
            redirect: to.fullPath
          }
        };
      }
    }
  }

  if (to.meta?.requiresAuth === false) {
    return true;
  }

  if (!auth.isAuthenticated) {
    return {
      path: "/login",
      query: {
        redirect: to.fullPath
      }
    };
  }

  const permission = to.meta?.permission;

  if (permission && !auth.hasPermission(permission)) {
    return {
      path: "/unauthorized"
    };
  }

  return true;
}

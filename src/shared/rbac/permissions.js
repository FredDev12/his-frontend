export function hasPermission(user, permission) {
  if (!permission) return true;
  return Array.isArray(user?.permissions) && user.permissions.includes(permission);
}

export function hasAnyPermission(user, permissions = []) {
  if (!permissions.length) return true;
  return permissions.some((permission) => hasPermission(user, permission));
}

export function filterAuthorizedServices(services, user) {
  return services.filter((service) => hasPermission(user, service.permission));
}

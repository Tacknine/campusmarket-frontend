import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const user = authService.getUser();
  if (!user || !user.roles) {
    router.navigate(['/login']);
    return false;
  }

  const hasRole = requiredRoles.some(role => user.roles.includes(role));
  if (hasRole) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

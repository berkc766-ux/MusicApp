import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for session check to finish before deciding
  await authService.waitForSession();

  if (authService.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/login');
};

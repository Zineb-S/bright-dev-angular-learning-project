import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getLoggedInUser()) {
    return true; // Allow access
  } else {
    router.navigate(['/login']); // Redirect to login if not authenticated
    return false; // Deny access
  }
};

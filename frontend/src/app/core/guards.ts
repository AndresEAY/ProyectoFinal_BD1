import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from './models';
import { NotificacionService } from './notificacion.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado() ? true : inject(Router).createUrlTree(['/login']);
};

export const rolGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const roles = route.data['roles'] as Rol[];
  if (auth.tieneRol(roles)) {
    return true;
  }
  inject(NotificacionService).error('No tiene permiso para acceder a esa pantalla.');
  return inject(Router).createUrlTree(['/inicio']);
};

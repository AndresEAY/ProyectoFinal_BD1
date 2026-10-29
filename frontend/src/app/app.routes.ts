import { Routes } from '@angular/router';
import { authGuard, rolGuard } from './core/guards';
import { Layout } from './core/layout/layout';
import { PERSONAL } from './core/models';
import { Login } from './features/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio) },
      { path: 'libros', loadComponent: () => import('./features/libros/libros').then((m) => m.Libros) },
      { path: 'ejemplares', loadComponent: () => import('./features/ejemplares/ejemplares').then((m) => m.Ejemplares) },
      { path: 'catalogos', loadComponent: () => import('./features/catalogos/catalogos').then((m) => m.Catalogos) },
      { path: 'historial', loadComponent: () => import('./features/historial/historial').then((m) => m.Historial) },
      {
        path: 'usuarios',
        canActivate: [rolGuard],
        data: { roles: PERSONAL },
        loadComponent: () => import('./features/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'prestamos',
        canActivate: [rolGuard],
        data: { roles: PERSONAL },
        loadComponent: () => import('./features/prestamos/prestamos').then((m) => m.Prestamos),
      },
      {
        path: 'devoluciones',
        canActivate: [rolGuard],
        data: { roles: PERSONAL },
        loadComponent: () => import('./features/devoluciones/devoluciones').then((m) => m.Devoluciones),
      },
      {
        path: 'reportes',
        canActivate: [rolGuard],
        data: { roles: PERSONAL },
        loadComponent: () => import('./features/reportes/reportes').then((m) => m.Reportes),
      },
      {
        path: 'bitacora',
        canActivate: [rolGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/bitacora/bitacora').then((m) => m.Bitacora),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth.service';
import { PERSONAL, Rol } from '../models';

interface OpcionMenu {
  ruta: string;
  texto: string;
  icono: string;
  roles: Rol[];
}

const TODOS: Rol[] = ['ADMIN', 'BIBLIOTECARIO', 'PROFESOR', 'ESTUDIANTE'];

const MENU: OpcionMenu[] = [
  { ruta: '/inicio', texto: 'Inicio', icono: 'home', roles: TODOS },
  { ruta: '/libros', texto: 'Libros', icono: 'menu_book', roles: TODOS },
  { ruta: '/ejemplares', texto: 'Ejemplares', icono: 'qr_code', roles: TODOS },
  { ruta: '/catalogos', texto: 'Catálogos', icono: 'category', roles: TODOS },
  { ruta: '/usuarios', texto: 'Usuarios', icono: 'group', roles: PERSONAL },
  { ruta: '/prestamos', texto: 'Préstamos', icono: 'outbox', roles: PERSONAL },
  { ruta: '/devoluciones', texto: 'Devoluciones', icono: 'move_to_inbox', roles: PERSONAL },
  { ruta: '/historial', texto: 'Mi historial', icono: 'history', roles: TODOS },
  { ruta: '/reportes', texto: 'Reportes', icono: 'bar_chart', roles: PERSONAL },
  { ruta: '/bitacora', texto: 'Bitácora', icono: 'manage_search', roles: ['ADMIN'] },
];

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar class="barra">
      <button mat-icon-button (click)="menu.toggle()"><mat-icon>menu</mat-icon></button>
      <span>Biblioteca Universitaria</span>
      <span class="espacio"></span>
      <span class="usuario">{{ sesion()?.nombre }} · {{ sesion()?.rol }}</span>
      <button mat-icon-button (click)="auth.logout()" aria-label="Cerrar sesión"><mat-icon>logout</mat-icon></button>
    </mat-toolbar>
    <mat-sidenav-container class="contenedor">
      <mat-sidenav #menu mode="side" opened class="menu">
        <mat-nav-list>
          @for (opcion of opciones(); track opcion.ruta) {
            <a mat-list-item [routerLink]="opcion.ruta" routerLinkActive="activo">
              <mat-icon matListItemIcon>{{ opcion.icono }}</mat-icon>
              <span matListItemTitle>{{ opcion.texto }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="contenido">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class Layout {
  readonly auth = inject(AuthService);
  readonly sesion = this.auth.sesion;
  readonly opciones = computed(() => {
    const rol = this.sesion()?.rol;
    return MENU.filter((o) => rol && o.roles.includes(rol));
  });
}

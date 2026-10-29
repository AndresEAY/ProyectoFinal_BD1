import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { PERSONAL, Rol, Sesion } from './models';

const CLAVE = 'biblioteca_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sesionActual = signal<Sesion | null>(this.leer());

  readonly sesion = this.sesionActual.asReadonly();
  readonly esPersonal = computed(() => this.tieneRol(PERSONAL));

  login(username: string, password: string): Observable<Sesion> {
    return this.http.post<Sesion>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((sesion) => {
        localStorage.setItem(CLAVE, JSON.stringify(sesion));
        this.sesionActual.set(sesion);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(CLAVE);
    this.sesionActual.set(null);
    this.router.navigate(['/login']);
  }

  autenticado(): boolean {
    const sesion = this.sesionActual();
    if (!sesion) {
      return false;
    }
    if (this.expirado(sesion.token)) {
      this.logout();
      return false;
    }
    return true;
  }

  tieneRol(roles: Rol[]): boolean {
    const sesion = this.sesionActual();
    return !!sesion && roles.includes(sesion.rol);
  }

  private expirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private leer(): Sesion | null {
    const guardada = localStorage.getItem(CLAVE);
    return guardada ? (JSON.parse(guardada) as Sesion) : null;
  }
}

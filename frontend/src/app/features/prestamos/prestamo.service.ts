import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prestamo } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class PrestamoService {
  private readonly http = inject(HttpClient);

  listar(soloAbiertos = false): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${environment.apiUrl}/prestamos`, { params: { soloAbiertos } });
  }

  registrar(idUsuario: number, idEjemplar: number): Observable<Prestamo> {
    return this.http.post<Prestamo>(`${environment.apiUrl}/prestamos`, { idUsuario, idEjemplar });
  }

  historial(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${environment.apiUrl}/historial`);
  }
}

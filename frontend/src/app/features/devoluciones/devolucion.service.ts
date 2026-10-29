import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Devolucion } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class DevolucionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/devoluciones`;

  listar(): Observable<Devolucion[]> {
    return this.http.get<Devolucion[]>(this.url);
  }

  registrar(idPrestamo: number, observaciones: string, estadoEjemplar: string): Observable<Devolucion> {
    return this.http.post<Devolucion>(this.url, { idPrestamo, observaciones: observaciones || null, estadoEjemplar });
  }
}

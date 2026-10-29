import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fila } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reportes`;

  resumen(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.url}/resumen`);
  }

  consultar(nombre: string): Observable<Fila[]> {
    return this.http.get<Fila[]>(`${this.url}/${nombre}`);
  }

  exportar(nombre: string, formato: 'csv' | 'xlsx'): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.url}/${nombre}/export`, {
      params: { formato },
      responseType: 'blob',
      observe: 'response',
    });
  }
}

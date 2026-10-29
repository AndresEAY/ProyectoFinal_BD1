import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export abstract class CrudService<T, R = T> {
  protected readonly http = inject(HttpClient);
  protected readonly url: string;

  protected constructor(recurso: string) {
    this.url = `${environment.apiUrl}/${recurso}`;
  }

  listar(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }

  crear(dato: R): Observable<T> {
    return this.http.post<T>(this.url, dato);
  }

  actualizar(id: number, dato: R): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, dato);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

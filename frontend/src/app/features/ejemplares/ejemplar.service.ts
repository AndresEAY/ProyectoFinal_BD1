import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from '../../core/crud.service';
import { Ejemplar, EjemplarRequest } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class EjemplarService extends CrudService<Ejemplar, EjemplarRequest> {
  constructor() {
    super('ejemplares');
  }

  buscar(filtros: { idLibro?: number; estado?: string }): Observable<Ejemplar[]> {
    const params: Record<string, string | number> = {};
    if (filtros.idLibro) {
      params['idLibro'] = filtros.idLibro;
    }
    if (filtros.estado) {
      params['estado'] = filtros.estado;
    }
    return this.http.get<Ejemplar[]>(this.url, { params });
  }
}

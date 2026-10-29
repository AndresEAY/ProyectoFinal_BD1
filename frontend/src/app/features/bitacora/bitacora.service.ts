import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bitacora, Pagina } from '../../core/models';

export interface FiltrosBitacora {
  tabla: string;
  operacion: string;
  usuario: string;
  desde: string;
  hasta: string;
}

@Injectable({ providedIn: 'root' })
export class BitacoraService {
  private readonly http = inject(HttpClient);

  buscar(filtros: FiltrosBitacora, pagina: number, tamanio: number): Observable<Pagina<Bitacora>> {
    const params: Record<string, string | number> = { pagina, tamanio };
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor) {
        params[clave] = valor;
      }
    });
    return this.http.get<Pagina<Bitacora>>(`${environment.apiUrl}/bitacora`, { params });
  }
}

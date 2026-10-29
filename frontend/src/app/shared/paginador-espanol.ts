import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginadorEspanol extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Filas por página';
  override nextPageLabel = 'Siguiente';
  override previousPageLabel = 'Anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';
  override getRangeLabel = (pagina: number, tamanio: number, total: number): string => {
    if (total === 0) {
      return `0 de ${total}`;
    }
    const inicio = pagina * tamanio;
    return `${inicio + 1} – ${Math.min(inicio + tamanio, total)} de ${total}`;
  };
}

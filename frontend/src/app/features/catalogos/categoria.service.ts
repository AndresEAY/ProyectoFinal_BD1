import { Injectable } from '@angular/core';
import { CrudService } from '../../core/crud.service';
import { Categoria } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class CategoriaService extends CrudService<Categoria> {
  constructor() {
    super('categorias');
  }
}

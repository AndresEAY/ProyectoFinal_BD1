import { Injectable } from '@angular/core';
import { CrudService } from '../../core/crud.service';
import { Libro, LibroRequest } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class LibroService extends CrudService<Libro, LibroRequest> {
  constructor() {
    super('libros');
  }
}

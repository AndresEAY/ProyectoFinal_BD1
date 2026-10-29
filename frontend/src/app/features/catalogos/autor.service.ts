import { Injectable } from '@angular/core';
import { CrudService } from '../../core/crud.service';
import { Autor } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class AutorService extends CrudService<Autor> {
  constructor() {
    super('autores');
  }
}

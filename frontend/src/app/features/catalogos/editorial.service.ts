import { Injectable } from '@angular/core';
import { CrudService } from '../../core/crud.service';
import { Editorial } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class EditorialService extends CrudService<Editorial> {
  constructor() {
    super('editoriales');
  }
}

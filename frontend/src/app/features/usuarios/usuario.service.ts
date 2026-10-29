import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from '../../core/crud.service';
import { RolDto, Usuario } from '../../core/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends CrudService<Usuario> {
  constructor() {
    super('usuarios');
  }

  roles(): Observable<RolDto[]> {
    return this.http.get<RolDto[]>(`${environment.apiUrl}/roles`);
  }
}

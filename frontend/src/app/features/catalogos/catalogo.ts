import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';
import { CrudService } from '../../core/crud.service';
import { NotificacionService } from '../../core/notificacion.service';
import { ConfirmacionDialog } from '../../shared/confirmacion-dialog';
import { Accion, Columna, Tabla } from '../../shared/tabla';
import { Campo, CatalogoDialog } from './catalogo-dialog';

interface Registro {
  id?: number;
}

@Component({
  selector: 'app-catalogo',
  imports: [Tabla, MatButtonModule, MatIconModule],
  template: `
    @if (puedeEditar) {
      <div class="encabezado">
        <span></span>
        <button mat-flat-button (click)="abrir(null)"><mat-icon>add</mat-icon> Agregar {{ titulo() }}</button>
      </div>
    }
    <app-tabla [columnas]="columnas()" [datos]="registros()" [acciones]="acciones" [cargando]="cargando()" />
  `,
})
export class Catalogo implements OnInit {
  readonly titulo = input.required<string>();
  readonly campos = input.required<Campo[]>();
  readonly servicio = input.required<CrudService<Registro>>();

  private readonly dialog = inject(MatDialog);
  private readonly notificacion = inject(NotificacionService);
  readonly puedeEditar = inject(AuthService).esPersonal();
  readonly registros = signal<Registro[]>([]);
  readonly cargando = signal(false);

  readonly acciones: Accion<Registro>[] = this.puedeEditar
    ? [
        { icono: 'edit', texto: 'Editar', ejecutar: (r) => this.abrir(r) },
        { icono: 'delete', texto: 'Eliminar', ejecutar: (r) => this.eliminar(r) },
      ]
    : [];

  columnas(): Columna<Registro>[] {
    return this.campos().map((c) => ({ clave: c.clave, titulo: c.etiqueta }));
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio().listar().subscribe({
      next: (r) => {
        this.registros.set(r);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.cargando.set(false);
      },
    });
  }

  abrir(registro: Registro | null): void {
    this.dialog
      .open(CatalogoDialog, { data: { titulo: this.titulo(), campos: this.campos(), servicio: this.servicio(), registro: registro as Record<string, unknown> | null }, width: '480px' })
      .afterClosed()
      .subscribe((ok) => ok && this.cargar());
  }

  eliminar(registro: Registro): void {
    this.dialog
      .open(ConfirmacionDialog, { data: { titulo: `Eliminar ${this.titulo()}`, mensaje: '¿Seguro que desea eliminar este registro?', textoAceptar: 'Eliminar' } })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.servicio().eliminar(registro.id!).subscribe({
            next: () => {
              this.notificacion.exito('Registro eliminado.');
              this.cargar();
            },
            error: (e) => this.notificacion.errorApi(e),
          });
        }
      });
  }
}

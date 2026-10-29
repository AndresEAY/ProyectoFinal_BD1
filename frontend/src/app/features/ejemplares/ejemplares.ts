import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Ejemplar, Libro } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { ConfirmacionDialog } from '../../shared/confirmacion-dialog';
import { fecha } from '../../shared/formato';
import { Accion, Columna, Tabla } from '../../shared/tabla';
import { LibroService } from '../libros/libro.service';
import { EjemplarDialog } from './ejemplar-dialog';
import { EjemplarService } from './ejemplar.service';

@Component({
  selector: 'app-ejemplares',
  imports: [Tabla, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule],
  template: `
    <div class="encabezado">
      <h1>Ejemplares</h1>
      @if (puedeEditar) {
        <button mat-flat-button (click)="abrir(null)"><mat-icon>add</mat-icon> Agregar ejemplar</button>
      }
    </div>
    <div class="filtros">
      <mat-form-field appearance="outline">
        <mat-label>Libro</mat-label>
        <mat-select [(ngModel)]="idLibro" (selectionChange)="cargar()">
          <mat-option [value]="null">Todos</mat-option>
          @for (l of libros(); track l.id) {
            <mat-option [value]="l.id">{{ l.titulo }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Estado</mat-label>
        <mat-select [(ngModel)]="estado" (selectionChange)="cargar()">
          <mat-option [value]="null">Todos</mat-option>
          @for (e of estados; track e) {
            <mat-option [value]="e">{{ e }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>
    <app-tabla [columnas]="columnas" [datos]="ejemplares()" [acciones]="acciones" [cargando]="cargando()" [claseFila]="claseFila" />
  `,
})
export class Ejemplares implements OnInit {
  private readonly servicio = inject(EjemplarService);
  private readonly libroService = inject(LibroService);
  private readonly dialog = inject(MatDialog);
  private readonly notificacion = inject(NotificacionService);
  readonly puedeEditar = inject(AuthService).esPersonal();
  readonly estados = ['DISPONIBLE', 'PRESTADO', 'DANADO', 'PERDIDO', 'INACTIVO'];
  readonly ejemplares = signal<Ejemplar[]>([]);
  readonly libros = signal<Libro[]>([]);
  readonly cargando = signal(false);
  idLibro: number | null = Number(inject(ActivatedRoute).snapshot.queryParamMap.get('idLibro')) || null;
  estado: string | null = null;

  readonly columnas: Columna<Ejemplar>[] = [
    { clave: 'codigoBarras', titulo: 'Código de barras' },
    { clave: 'titulo', titulo: 'Libro' },
    { clave: 'isbn', titulo: 'ISBN' },
    { clave: 'estado', titulo: 'Estado' },
    { clave: 'fechaAdquisicion', titulo: 'Adquisición', valor: (e) => fecha(e.fechaAdquisicion) },
  ];

  readonly acciones: Accion<Ejemplar>[] = this.puedeEditar
    ? [
        { icono: 'edit', texto: 'Editar', ejecutar: (e) => this.abrir(e) },
        { icono: 'block', texto: 'Dar de baja', ejecutar: (e) => this.darDeBaja(e), visible: (e) => e.estado !== 'INACTIVO' && e.estado !== 'PRESTADO' },
      ]
    : [];

  readonly claseFila = (e: Ejemplar) => (e.estado === 'DISPONIBLE' ? '' : e.estado === 'PRESTADO' ? 'fila-alerta' : 'fila-inactiva');

  ngOnInit(): void {
    this.libroService.listar().subscribe((l) => this.libros.set(l));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.buscar({ idLibro: this.idLibro ?? undefined, estado: this.estado ?? undefined }).subscribe({
      next: (e) => {
        this.ejemplares.set(e);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.cargando.set(false);
      },
    });
  }

  abrir(ejemplar: Ejemplar | null): void {
    this.dialog
      .open(EjemplarDialog, { data: { ejemplar, idLibro: this.idLibro }, width: '520px' })
      .afterClosed()
      .subscribe((ok) => ok && this.cargar());
  }

  darDeBaja(ejemplar: Ejemplar): void {
    this.dialog
      .open(ConfirmacionDialog, { data: { titulo: 'Dar de baja', mensaje: `¿Dar de baja el ejemplar ${ejemplar.codigoBarras}?`, textoAceptar: 'Dar de baja' } })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.servicio.eliminar(ejemplar.id).subscribe({
            next: () => {
              this.notificacion.exito('Ejemplar dado de baja.');
              this.cargar();
            },
            error: (e) => this.notificacion.errorApi(e),
          });
        }
      });
  }
}

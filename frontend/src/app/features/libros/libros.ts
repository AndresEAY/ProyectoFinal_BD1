import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Libro } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { ConfirmacionDialog } from '../../shared/confirmacion-dialog';
import { Accion, Columna, Tabla } from '../../shared/tabla';
import { LibroDialog } from './libro-dialog';
import { LibroService } from './libro.service';

@Component({
  selector: 'app-libros',
  imports: [Tabla, MatButtonModule, MatIconModule],
  template: `
    <div class="encabezado">
      <h1>Libros</h1>
      @if (puedeEditar) {
        <button mat-flat-button (click)="abrir(null)"><mat-icon>add</mat-icon> Agregar libro</button>
      }
    </div>
    <app-tabla [columnas]="columnas" [datos]="libros()" [acciones]="acciones" [cargando]="cargando()" [claseFila]="claseFila" />
  `,
})
export class Libros implements OnInit {
  private readonly servicio = inject(LibroService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);
  readonly puedeEditar = inject(AuthService).esPersonal();
  readonly libros = signal<Libro[]>([]);
  readonly cargando = signal(false);

  readonly columnas: Columna<Libro>[] = [
    { clave: 'isbn', titulo: 'ISBN' },
    { clave: 'titulo', titulo: 'Título' },
    { clave: 'autores', titulo: 'Autores', valor: (l) => l.autores.map((a) => `${a.nombres} ${a.apellidos}`).join(', ') },
    { clave: 'editorial', titulo: 'Editorial' },
    { clave: 'categoria', titulo: 'Categoría' },
    { clave: 'anioPublicacion', titulo: 'Año' },
    { clave: 'disponibles', titulo: 'Disponibles', valor: (l) => `${l.disponibles} de ${l.totalEjemplares}` },
    { clave: 'estado', titulo: 'Estado', valor: (l) => (l.estado === 'A' ? 'Activo' : 'Inactivo') },
  ];

  readonly acciones: Accion<Libro>[] = [
    { icono: 'qr_code', texto: 'Ver ejemplares', ejecutar: (l) => this.router.navigate(['/ejemplares'], { queryParams: { idLibro: l.id } }) },
    ...(this.puedeEditar
      ? [
          { icono: 'edit', texto: 'Editar', ejecutar: (l: Libro) => this.abrir(l) },
          { icono: 'block', texto: 'Desactivar', ejecutar: (l: Libro) => this.desactivar(l), visible: (l: Libro) => l.estado === 'A' },
        ]
      : []),
  ];

  readonly claseFila = (l: Libro) => (l.estado === 'I' ? 'fila-inactiva' : '');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (l) => {
        this.libros.set(l);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.cargando.set(false);
      },
    });
  }

  abrir(libro: Libro | null): void {
    this.dialog.open(LibroDialog, { data: libro, width: '720px' }).afterClosed().subscribe((ok) => ok && this.cargar());
  }

  desactivar(libro: Libro): void {
    this.dialog
      .open(ConfirmacionDialog, { data: { titulo: 'Desactivar libro', mensaje: `¿Desactivar "${libro.titulo}"? No se podrá prestar, pero se conserva su historial.`, textoAceptar: 'Desactivar' } })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.servicio.eliminar(libro.id).subscribe({
            next: () => {
              this.notificacion.exito('Libro desactivado.');
              this.cargar();
            },
            error: (e) => this.notificacion.errorApi(e),
          });
        }
      });
  }
}

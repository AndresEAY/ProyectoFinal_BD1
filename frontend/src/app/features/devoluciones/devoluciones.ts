import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { Devolucion, Prestamo } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { fecha } from '../../shared/formato';
import { Accion, Columna, Tabla } from '../../shared/tabla';
import { PrestamoService } from '../prestamos/prestamo.service';
import { DevolucionDialog } from './devolucion-dialog';
import { DevolucionService } from './devolucion.service';

@Component({
  selector: 'app-devoluciones',
  imports: [MatTabsModule, MatCardModule, Tabla],
  template: `
    <h1>Devoluciones</h1>
    @if (ultima(); as d) {
      <mat-card class="tarjeta" [class.tarjeta-exito]="d.aTiempo === 'S'" [class.tarjeta-error]="d.aTiempo === 'N'">
        <mat-card-content>
          Devolución registrada de <strong>{{ d.titulo }}</strong> ({{ d.usuario }}):
          @if (d.aTiempo === 'S') {
            <strong>a tiempo</strong>.
          } @else {
            <strong>con {{ d.diasRetraso }} día(s) de retraso</strong>.
          }
          Estado del ejemplar: {{ d.estadoEjemplar }}.
        </mat-card-content>
      </mat-card>
    }
    <mat-tab-group>
      <mat-tab label="Préstamos pendientes de devolver">
        <app-tabla [columnas]="columnasPrestamo" [datos]="pendientes()" [acciones]="acciones" [cargando]="cargando()" [claseFila]="clasePrestamo" />
      </mat-tab>
      <mat-tab label="Devoluciones registradas">
        <app-tabla [columnas]="columnasDevolucion" [datos]="devoluciones()" [claseFila]="claseDevolucion" />
      </mat-tab>
    </mat-tab-group>
  `,
})
export class Devoluciones implements OnInit {
  private readonly prestamoService = inject(PrestamoService);
  private readonly servicio = inject(DevolucionService);
  private readonly dialog = inject(MatDialog);
  private readonly notificacion = inject(NotificacionService);
  readonly pendientes = signal<Prestamo[]>([]);
  readonly devoluciones = signal<Devolucion[]>([]);
  readonly ultima = signal<Devolucion | null>(null);
  readonly cargando = signal(false);

  readonly columnasPrestamo: Columna<Prestamo>[] = [
    { clave: 'id', titulo: '#' },
    { clave: 'usuario', titulo: 'Usuario', valor: (p) => `${p.codigoUsuario} · ${p.usuario}` },
    { clave: 'titulo', titulo: 'Libro' },
    { clave: 'codigoBarras', titulo: 'Ejemplar' },
    { clave: 'fechaPrestamo', titulo: 'Préstamo', valor: (p) => fecha(p.fechaPrestamo) },
    { clave: 'fechaDevolucionPrevista', titulo: 'Devolver antes de', valor: (p) => fecha(p.fechaDevolucionPrevista) },
    { clave: 'estado', titulo: 'Estado' },
  ];

  readonly columnasDevolucion: Columna<Devolucion>[] = [
    { clave: 'idPrestamo', titulo: 'Préstamo #' },
    { clave: 'usuario', titulo: 'Usuario' },
    { clave: 'titulo', titulo: 'Libro' },
    { clave: 'fechaDevolucionPrevista', titulo: 'Prevista', valor: (d) => fecha(d.fechaDevolucionPrevista) },
    { clave: 'fechaDevolucionReal', titulo: 'Devuelto', valor: (d) => fecha(d.fechaDevolucionReal) },
    { clave: 'aTiempo', titulo: 'Resultado', valor: (d) => (d.aTiempo === 'S' ? 'A tiempo' : `${d.diasRetraso} día(s) de retraso`) },
    { clave: 'observaciones', titulo: 'Observaciones' },
    { clave: 'bibliotecario', titulo: 'Recibió' },
  ];

  readonly acciones: Accion<Prestamo>[] = [
    { icono: 'move_to_inbox', texto: 'Registrar devolución', ejecutar: (p) => this.devolver(p) },
  ];

  readonly clasePrestamo = (p: Prestamo) => (p.estado === 'VENCIDO' ? 'fila-error' : '');
  readonly claseDevolucion = (d: Devolucion) => (d.aTiempo === 'N' ? 'fila-alerta' : '');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.prestamoService.listar(true).subscribe({
      next: (p) => {
        this.pendientes.set(p);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.cargando.set(false);
      },
    });
    this.servicio.listar().subscribe((d) => this.devoluciones.set(d));
  }

  devolver(prestamo: Prestamo): void {
    this.dialog
      .open(DevolucionDialog, { data: prestamo, width: '520px' })
      .afterClosed()
      .subscribe((devolucion?: Devolucion) => {
        if (devolucion) {
          this.ultima.set(devolucion);
          this.notificacion.exito(devolucion.aTiempo === 'S' ? 'Devolución a tiempo registrada.' : `Devolución con ${devolucion.diasRetraso} día(s) de retraso.`);
          this.cargar();
        }
      });
  }
}

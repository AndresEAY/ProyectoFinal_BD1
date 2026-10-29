import { Component, inject, OnInit, signal } from '@angular/core';
import { Prestamo } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { fecha } from '../../shared/formato';
import { Columna, Tabla } from '../../shared/tabla';
import { PrestamoService } from '../prestamos/prestamo.service';

@Component({
  selector: 'app-historial',
  imports: [Tabla],
  template: `
    <h1>Mi historial de préstamos</h1>
    <p class="leyenda">
      <span class="muestra fila-error"></span> Vencido
      <span class="muestra fila-alerta"></span> Vence en 2 días o menos
    </p>
    <app-tabla [columnas]="columnas" [datos]="prestamos()" [cargando]="cargando()" [claseFila]="claseFila" />
  `,
})
export class Historial implements OnInit {
  private readonly servicio = inject(PrestamoService);
  private readonly notificacion = inject(NotificacionService);
  readonly prestamos = signal<Prestamo[]>([]);
  readonly cargando = signal(false);

  readonly columnas: Columna<Prestamo>[] = [
    { clave: 'titulo', titulo: 'Libro' },
    { clave: 'codigoBarras', titulo: 'Ejemplar' },
    { clave: 'fechaPrestamo', titulo: 'Préstamo', valor: (p) => fecha(p.fechaPrestamo) },
    { clave: 'fechaDevolucionPrevista', titulo: 'Devolver antes de', valor: (p) => fecha(p.fechaDevolucionPrevista) },
    { clave: 'estado', titulo: 'Estado' },
    {
      clave: 'situacion',
      titulo: 'Situación',
      valor: (p) => {
        if (p.estado === 'DEVUELTO') {
          return p.aTiempo === 'S' ? `Devuelto a tiempo el ${fecha(p.fechaDevolucionReal)}` : `Devuelto con ${p.diasRetraso} día(s) de retraso`;
        }
        return p.estado === 'VENCIDO' ? `Vencido hace ${-(p.diasRestantes ?? 0)} día(s)` : `Quedan ${p.diasRestantes} día(s)`;
      },
    },
  ];

  readonly claseFila = (p: Prestamo) => {
    if (p.estado === 'VENCIDO') {
      return 'fila-error';
    }
    return p.estado === 'ACTIVO' && (p.diasRestantes ?? 99) <= 2 ? 'fila-alerta' : '';
  };

  ngOnInit(): void {
    this.cargando.set(true);
    this.servicio.historial().subscribe({
      next: (p) => {
        this.prestamos.set(p);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.cargando.set(false);
      },
    });
  }
}

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Prestamo } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { fecha } from '../../shared/formato';
import { PrestamoService } from '../prestamos/prestamo.service';
import { ReporteService } from '../reportes/reporte.service';

interface Indicador {
  titulo: string;
  valor: number;
  icono: string;
  clase: string;
}

@Component({
  selector: 'app-inicio',
  imports: [MatCardModule, MatIconModule, RouterLink],
  template: `
    <h1>Bienvenido, {{ auth.sesion()?.nombre }}</h1>
    <div class="indicadores">
      @for (indicador of indicadores(); track indicador.titulo) {
        <mat-card class="indicador" [class]="indicador.clase">
          <mat-icon>{{ indicador.icono }}</mat-icon>
          <div>
            <div class="indicador-valor">{{ indicador.valor }}</div>
            <div class="indicador-titulo">{{ indicador.titulo }}</div>
          </div>
        </mat-card>
      }
    </div>
    @if (!auth.esPersonal() && proximos().length) {
      <h2>Libros por devolver</h2>
      <mat-card>
        <mat-card-content>
          @for (p of proximos(); track p.id) {
            <p [class.texto-error]="p.estado === 'VENCIDO'">
              <strong>{{ p.titulo }}</strong> — devolver el {{ fecha(p.fechaDevolucionPrevista) }}
              @if (p.estado === 'VENCIDO') { (vencido) } @else { ({{ p.diasRestantes }} día(s) restantes) }
            </p>
          }
          <a routerLink="/historial">Ver mi historial completo</a>
        </mat-card-content>
      </mat-card>
    }
  `,
})
export class Inicio implements OnInit {
  readonly auth = inject(AuthService);
  private readonly reporteService = inject(ReporteService);
  private readonly prestamoService = inject(PrestamoService);
  private readonly notificacion = inject(NotificacionService);
  private readonly resumen = signal<Record<string, number>>({});
  private readonly historial = signal<Prestamo[]>([]);
  readonly fecha = fecha;

  readonly proximos = computed(() => this.historial().filter((p) => p.estado !== 'DEVUELTO'));

  readonly indicadores = computed<Indicador[]>(() => {
    if (this.auth.esPersonal()) {
      const r = this.resumen();
      return [
        { titulo: 'Préstamos activos', valor: r['PRESTAMOS_ACTIVOS'] ?? 0, icono: 'outbox', clase: 'azul' },
        { titulo: 'Préstamos vencidos', valor: r['PRESTAMOS_VENCIDOS'] ?? 0, icono: 'warning', clase: 'rojo' },
        { titulo: 'Ejemplares disponibles', valor: r['EJEMPLARES_DISPONIBLES'] ?? 0, icono: 'qr_code', clase: 'verde' },
        { titulo: 'Libros activos', valor: r['LIBROS_ACTIVOS'] ?? 0, icono: 'menu_book', clase: 'azul' },
        { titulo: 'Usuarios activos', valor: r['USUARIOS_ACTIVOS'] ?? 0, icono: 'group', clase: 'azul' },
        { titulo: 'Devoluciones (30 días)', valor: r['DEVOLUCIONES_ULTIMOS_30_DIAS'] ?? 0, icono: 'move_to_inbox', clase: 'verde' },
      ];
    }
    const h = this.historial();
    return [
      { titulo: 'Préstamos activos', valor: h.filter((p) => p.estado === 'ACTIVO').length, icono: 'outbox', clase: 'azul' },
      { titulo: 'Préstamos vencidos', valor: h.filter((p) => p.estado === 'VENCIDO').length, icono: 'warning', clase: 'rojo' },
      { titulo: 'Total de préstamos', valor: h.length, icono: 'history', clase: 'verde' },
    ];
  });

  ngOnInit(): void {
    if (this.auth.esPersonal()) {
      this.reporteService.resumen().subscribe({
        next: (r) => this.resumen.set(r),
        error: (e) => this.notificacion.errorApi(e),
      });
    } else {
      this.prestamoService.historial().subscribe({
        next: (h) => this.historial.set(h),
        error: (e) => this.notificacion.errorApi(e),
      });
    }
  }
}

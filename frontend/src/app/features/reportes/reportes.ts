import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Fila } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { Columna, Tabla } from '../../shared/tabla';
import { ReporteService } from './reporte.service';

interface Reporte {
  nombre: string;
  titulo: string;
}

const COLORES = ['#1565c0', '#2e7d32', '#ef6c00', '#6a1b9a', '#c62828', '#00838f', '#5d4037', '#9e9d24'];

@Component({
  selector: 'app-reportes',
  imports: [FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
    BaseChartDirective, Tabla],
  template: `
    <h1>Reportes</h1>
    <div class="graficas">
      <mat-card class="grafica">
        <mat-card-header><mat-card-title>Libros más prestados</mat-card-title></mat-card-header>
        <mat-card-content><canvas baseChart type="bar" [data]="masPrestados()" [options]="opcionesBarras"></canvas></mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="exportar('libros-mas-prestados', 'xlsx')"><mat-icon>download</mat-icon> Excel</button>
          <button mat-button (click)="exportar('libros-mas-prestados', 'csv')"><mat-icon>download</mat-icon> CSV</button>
        </mat-card-actions>
      </mat-card>
      <mat-card class="grafica">
        <mat-card-header><mat-card-title>Préstamos por mes</mat-card-title></mat-card-header>
        <mat-card-content><canvas baseChart type="line" [data]="porMes()" [options]="opcionesLinea"></canvas></mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="exportar('prestamos-por-mes', 'xlsx')"><mat-icon>download</mat-icon> Excel</button>
          <button mat-button (click)="exportar('prestamos-por-mes', 'csv')"><mat-icon>download</mat-icon> CSV</button>
        </mat-card-actions>
      </mat-card>
      <mat-card class="grafica">
        <mat-card-header><mat-card-title>Inventario por categoría (ejemplares)</mat-card-title></mat-card-header>
        <mat-card-content><canvas baseChart type="pie" [data]="inventario()" [options]="opcionesPastel"></canvas></mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="exportar('inventario-por-categoria', 'xlsx')"><mat-icon>download</mat-icon> Excel</button>
          <button mat-button (click)="exportar('inventario-por-categoria', 'csv')"><mat-icon>download</mat-icon> CSV</button>
        </mat-card-actions>
      </mat-card>
      <mat-card class="grafica">
        <mat-card-header><mat-card-title>Devoluciones a tiempo vs. con retraso</mat-card-title></mat-card-header>
        <mat-card-content><canvas baseChart type="doughnut" [data]="devoluciones()" [options]="opcionesPastel"></canvas></mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="exportar('devoluciones-a-tiempo-vs-tarde', 'xlsx')"><mat-icon>download</mat-icon> Excel</button>
          <button mat-button (click)="exportar('devoluciones-a-tiempo-vs-tarde', 'csv')"><mat-icon>download</mat-icon> CSV</button>
        </mat-card-actions>
      </mat-card>
    </div>
    <h2>Detalle</h2>
    <div class="filtros">
      <mat-form-field appearance="outline" class="campo-ancho">
        <mat-label>Reporte</mat-label>
        <mat-select [(ngModel)]="seleccionado" (selectionChange)="cargarTabla()">
          @for (r of reportes; track r.nombre) {
            <mat-option [value]="r.nombre">{{ r.titulo }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <button mat-stroked-button (click)="exportar(seleccionado, 'xlsx')"><mat-icon>download</mat-icon> Exportar Excel</button>
      <button mat-stroked-button (click)="exportar(seleccionado, 'csv')"><mat-icon>download</mat-icon> Exportar CSV</button>
    </div>
    <app-tabla [columnas]="columnasTabla()" [datos]="filasTabla()" />
  `,
})
export class Reportes implements OnInit {
  private readonly servicio = inject(ReporteService);
  private readonly notificacion = inject(NotificacionService);

  readonly reportes: Reporte[] = [
    { nombre: 'prestamos-activos', titulo: 'Préstamos activos' },
    { nombre: 'prestamos-vencidos', titulo: 'Préstamos vencidos' },
    { nombre: 'prestamos-por-usuario', titulo: 'Préstamos por usuario' },
    { nombre: 'libros-mas-prestados', titulo: 'Libros más prestados' },
    { nombre: 'prestamos-por-mes', titulo: 'Préstamos por mes' },
    { nombre: 'inventario-por-categoria', titulo: 'Inventario por categoría' },
    { nombre: 'devoluciones-a-tiempo-vs-tarde', titulo: 'Devoluciones a tiempo vs. tarde' },
  ];
  seleccionado = 'prestamos-activos';

  readonly masPrestados = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  readonly porMes = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  readonly inventario = signal<ChartData<'pie'>>({ labels: [], datasets: [] });
  readonly devoluciones = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });
  readonly filasTabla = signal<Fila[]>([]);
  readonly columnasTabla = signal<Columna<Fila>[]>([]);

  readonly opcionesBarras: ChartOptions<'bar'> = { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { precision: 0 } } } };
  readonly opcionesLinea: ChartOptions<'line'> = { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } };
  readonly opcionesPastel: ChartOptions<'pie' | 'doughnut'> = { plugins: { legend: { position: 'bottom' } } };

  ngOnInit(): void {
    this.servicio.consultar('libros-mas-prestados').subscribe((f) => {
      const top = f.slice(0, 10);
      this.masPrestados.set({
        labels: top.map((x) => String(x['TITULO'])),
        datasets: [{ data: top.map((x) => Number(x['TOTAL_PRESTAMOS'])), label: 'Préstamos', backgroundColor: COLORES[0] }],
      });
    });
    this.servicio.consultar('prestamos-por-mes').subscribe((f) =>
      this.porMes.set({
        labels: f.map((x) => String(x['MES'])),
        datasets: [{ data: f.map((x) => Number(x['TOTAL_PRESTAMOS'])), label: 'Préstamos', borderColor: COLORES[0], backgroundColor: COLORES[0], tension: 0.3 }],
      }),
    );
    this.servicio.consultar('inventario-por-categoria').subscribe((f) =>
      this.inventario.set({
        labels: f.map((x) => String(x['CATEGORIA'])),
        datasets: [{ data: f.map((x) => Number(x['TOTAL_EJEMPLARES'])), backgroundColor: COLORES }],
      }),
    );
    this.servicio.consultar('devoluciones-a-tiempo-vs-tarde').subscribe((f) =>
      this.devoluciones.set({
        labels: f.map((x) => String(x['RESULTADO'])),
        datasets: [{ data: f.map((x) => Number(x['TOTAL'])), backgroundColor: f.map((x) => (x['RESULTADO'] === 'A tiempo' ? COLORES[1] : COLORES[4])) }],
      }),
    );
    this.cargarTabla();
  }

  cargarTabla(): void {
    this.servicio.consultar(this.seleccionado).subscribe({
      next: (filas) => {
        const claves = filas.length ? Object.keys(filas[0]) : [];
        this.columnasTabla.set(claves.map((c) => ({ clave: c, titulo: c.replace(/_/g, ' ') })));
        this.filasTabla.set(filas);
      },
      error: (e) => this.notificacion.errorApi(e),
    });
  }

  exportar(nombre: string, formato: 'csv' | 'xlsx'): void {
    this.servicio.exportar(nombre, formato).subscribe({
      next: (respuesta) => {
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(respuesta.body!);
        enlace.download = `${nombre}.${formato}`;
        enlace.click();
        URL.revokeObjectURL(enlace.href);
      },
      error: (e) => this.notificacion.errorApi(e),
    });
  }
}

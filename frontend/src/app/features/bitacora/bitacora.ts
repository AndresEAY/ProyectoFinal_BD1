import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Bitacora as RegistroBitacora } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { fechaHora } from '../../shared/formato';
import { BitacoraDetalle } from './bitacora-detalle';
import { BitacoraService, FiltrosBitacora } from './bitacora.service';

@Component({
  selector: 'app-bitacora',
  imports: [FormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatDialogModule],
  template: `
    <h1>Bitácora de operaciones</h1>
    <div class="filtros">
      <mat-form-field appearance="outline">
        <mat-label>Tabla</mat-label>
        <mat-select [(ngModel)]="filtros.tabla">
          <mat-option value="">Todas</mat-option>
          @for (t of tablas; track t) { <mat-option [value]="t">{{ t }}</mat-option> }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Operación</mat-label>
        <mat-select [(ngModel)]="filtros.operacion">
          <mat-option value="">Todas</mat-option>
          @for (o of operaciones; track o) { <mat-option [value]="o">{{ o }}</mat-option> }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Usuario</mat-label>
        <input matInput [(ngModel)]="filtros.usuario" (keyup.enter)="buscar(0)" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Desde</mat-label>
        <input matInput type="date" [(ngModel)]="filtros.desde" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Hasta</mat-label>
        <input matInput type="date" [(ngModel)]="filtros.hasta" />
      </mat-form-field>
      <button mat-flat-button (click)="buscar(0)"><mat-icon>search</mat-icon> Buscar</button>
    </div>
    @if (cargando()) { <mat-progress-bar mode="indeterminate" /> }
    <div class="tabla-contenedor">
      <table mat-table [dataSource]="registros()">
        <ng-container matColumnDef="fechaHora">
          <th mat-header-cell *matHeaderCellDef>Fecha y hora</th>
          <td mat-cell *matCellDef="let r">{{ fechaHora(r.fechaHora) }}</td>
        </ng-container>
        <ng-container matColumnDef="usuario">
          <th mat-header-cell *matHeaderCellDef>Usuario</th>
          <td mat-cell *matCellDef="let r">{{ r.usuario }}</td>
        </ng-container>
        <ng-container matColumnDef="tabla">
          <th mat-header-cell *matHeaderCellDef>Tabla</th>
          <td mat-cell *matCellDef="let r">{{ r.tabla }}</td>
        </ng-container>
        <ng-container matColumnDef="operacion">
          <th mat-header-cell *matHeaderCellDef>Operación</th>
          <td mat-cell *matCellDef="let r"><span class="etiqueta" [class]="r.operacion">{{ r.operacion }}</span></td>
        </ng-container>
        <ng-container matColumnDef="idRegistro">
          <th mat-header-cell *matHeaderCellDef>ID registro</th>
          <td mat-cell *matCellDef="let r">{{ r.idRegistro }}</td>
        </ng-container>
        <ng-container matColumnDef="detalle">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let r">
            <button mat-icon-button (click)="verDetalle(r)" aria-label="Ver detalle"><mat-icon>visibility</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columnas"></tr>
        <tr mat-row *matRowDef="let r; columns: columnas"></tr>
        <tr class="mat-row" *matNoDataRow><td class="sin-datos" [attr.colspan]="columnas.length">Sin registros</td></tr>
      </table>
    </div>
    <mat-paginator [length]="total()" [pageIndex]="pagina()" [pageSize]="tamanio()" [pageSizeOptions]="[20, 50, 100]"
                   (page)="cambiarPagina($event)" showFirstLastButtons />
  `,
})
export class Bitacora implements OnInit {
  private readonly servicio = inject(BitacoraService);
  private readonly dialog = inject(MatDialog);
  private readonly notificacion = inject(NotificacionService);
  readonly fechaHora = fechaHora;
  readonly tablas = ['USUARIO', 'LIBRO', 'EJEMPLAR', 'PRESTAMO', 'DEVOLUCION'];
  readonly operaciones = ['INSERT', 'UPDATE', 'DELETE'];
  readonly columnas = ['fechaHora', 'usuario', 'tabla', 'operacion', 'idRegistro', 'detalle'];
  readonly registros = signal<RegistroBitacora[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(0);
  readonly tamanio = signal(20);
  readonly cargando = signal(false);
  filtros: FiltrosBitacora = { tabla: '', operacion: '', usuario: '', desde: '', hasta: '' };

  ngOnInit(): void {
    this.buscar(0);
  }

  buscar(pagina: number): void {
    this.cargando.set(true);
    this.servicio.buscar(this.filtros, pagina, this.tamanio()).subscribe({
      next: (p) => {
        this.registros.set(p.contenido);
        this.total.set(p.total);
        this.pagina.set(p.pagina);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.cargando.set(false);
      },
    });
  }

  cambiarPagina(evento: PageEvent): void {
    this.tamanio.set(evento.pageSize);
    this.buscar(evento.pageIndex);
  }

  verDetalle(registro: RegistroBitacora): void {
    this.dialog.open(BitacoraDetalle, { data: registro, width: '760px' });
  }
}

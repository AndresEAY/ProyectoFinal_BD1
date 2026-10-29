import { Component, effect, input, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Columna<T> {
  clave: string;
  titulo: string;
  valor?: (fila: T) => string | number | null | undefined;
}

export interface Accion<T> {
  icono: string;
  texto: string;
  ejecutar: (fila: T) => void;
  visible?: (fila: T) => boolean;
}

@Component({
  selector: 'app-tabla',
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, MatTooltipModule, MatProgressBarModule],
  template: `
    <mat-form-field class="filtro" appearance="outline" subscriptSizing="dynamic">
      <mat-label>Buscar</mat-label>
      <mat-icon matPrefix>search</mat-icon>
      <input matInput (keyup)="filtrar($event)" />
    </mat-form-field>
    @if (cargando()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="tabla-contenedor">
      <table mat-table [dataSource]="fuente" matSort>
        @for (columna of columnas(); track columna.clave) {
          <ng-container [matColumnDef]="columna.clave">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ columna.titulo }}</th>
            <td mat-cell *matCellDef="let fila">{{ valor(columna, fila) }}</td>
          </ng-container>
        }
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let fila" class="acciones">
            @for (accion of acciones(); track accion.texto) {
              @if (!accion.visible || accion.visible(fila)) {
                <button mat-icon-button [matTooltip]="accion.texto" (click)="accion.ejecutar(fila)">
                  <mat-icon>{{ accion.icono }}</mat-icon>
                </button>
              }
            }
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="claves()"></tr>
        <tr mat-row *matRowDef="let fila; columns: claves()" [class]="claseFila()(fila)"></tr>
        <tr class="mat-row" *matNoDataRow>
          <td class="sin-datos" [attr.colspan]="claves().length">Sin registros</td>
        </tr>
      </table>
    </div>
    <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons />
  `,
})
export class Tabla<T> {
  readonly columnas = input.required<Columna<T>[]>();
  readonly datos = input<T[]>([]);
  readonly acciones = input<Accion<T>[]>([]);
  readonly cargando = input(false);
  readonly claseFila = input<(fila: T) => string>(() => '');

  readonly fuente = new MatTableDataSource<T>([]);
  private readonly paginador = viewChild.required(MatPaginator);
  private readonly orden = viewChild.required(MatSort);

  constructor() {
    this.fuente.filterPredicate = (fila, filtro) =>
      this.columnas().some((c) => String(this.valor(c, fila) ?? '').toLowerCase().includes(filtro));
    this.fuente.sortingDataAccessor = (fila, clave) => {
      const columna = this.columnas().find((c) => c.clave === clave);
      const valor = columna ? this.valor(columna, fila) : '';
      return typeof valor === 'number' ? valor : String(valor ?? '').toLowerCase();
    };
    effect(() => {
      this.fuente.paginator = this.paginador();
      this.fuente.sort = this.orden();
      this.fuente.data = this.datos();
    });
  }

  claves(): string[] {
    const claves = this.columnas().map((c) => c.clave);
    return this.acciones().length ? [...claves, 'acciones'] : claves;
  }

  valor(columna: Columna<T>, fila: T): string | number | null | undefined {
    return columna.valor ? columna.valor(fila) : ((fila as Record<string, unknown>)[columna.clave] as string | number);
  }

  filtrar(evento: Event): void {
    this.fuente.filter = (evento.target as HTMLInputElement).value.trim().toLowerCase();
    this.fuente.paginator?.firstPage();
  }
}

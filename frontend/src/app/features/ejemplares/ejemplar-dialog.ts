import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Ejemplar, EjemplarRequest, EstadoEjemplar, Libro } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { hoyIso } from '../../shared/formato';
import { LibroService } from '../libros/libro.service';
import { EjemplarService } from './ejemplar.service';

export interface DatosEjemplarDialog {
  ejemplar: Ejemplar | null;
  idLibro: number | null;
}

@Component({
  selector: 'app-ejemplar-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ ejemplar ? 'Editar ejemplar' : 'Agregar ejemplar' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="formulario" class="formulario">
        <mat-form-field>
          <mat-label>Libro</mat-label>
          <mat-select formControlName="idLibro">
            @for (l of libros(); track l.id) {
              <mat-option [value]="l.id">{{ l.titulo }} ({{ l.isbn }})</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field><mat-label>Código de barras</mat-label><input matInput formControlName="codigoBarras" /></mat-form-field>
        @if (prestado) {
          <p>Este ejemplar está <strong>PRESTADO</strong>; su estado cambiará al registrar la devolución.</p>
        } @else {
          <mat-form-field>
            <mat-label>Estado</mat-label>
            <mat-select formControlName="estado">
              @for (e of estados; track e) {
                <mat-option [value]="e">{{ e }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
        <mat-form-field><mat-label>Fecha de adquisición</mat-label><input matInput type="date" formControlName="fechaAdquisicion" /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button [disabled]="formulario.invalid || guardando()" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
  `,
})
export class EjemplarDialog implements OnInit {
  private readonly servicio = inject(EjemplarService);
  private readonly libroService = inject(LibroService);
  private readonly notificacion = inject(NotificacionService);
  private readonly ref = inject(MatDialogRef<EjemplarDialog>);
  private readonly datos = inject<DatosEjemplarDialog>(MAT_DIALOG_DATA);
  readonly ejemplar = this.datos.ejemplar;
  readonly prestado = this.ejemplar?.estado === 'PRESTADO';
  readonly estados: EstadoEjemplar[] = ['DISPONIBLE', 'DANADO', 'PERDIDO', 'INACTIVO'];
  readonly libros = signal<Libro[]>([]);
  readonly guardando = signal(false);

  readonly formulario = inject(FormBuilder).group({
    idLibro: [this.ejemplar?.idLibro ?? this.datos.idLibro, Validators.required],
    codigoBarras: [this.ejemplar?.codigoBarras ?? '', [Validators.required, Validators.maxLength(30)]],
    estado: [this.ejemplar?.estado ?? ('DISPONIBLE' as EstadoEjemplar)],
    fechaAdquisicion: [this.ejemplar?.fechaAdquisicion ?? hoyIso()],
  });

  ngOnInit(): void {
    this.libroService.listar().subscribe((l) => this.libros.set(l.filter((x) => x.estado === 'A' || x.id === this.ejemplar?.idLibro)));
  }

  guardar(): void {
    const valor = this.formulario.getRawValue();
    const dato: EjemplarRequest = {
      idLibro: valor.idLibro!,
      codigoBarras: valor.codigoBarras!,
      estado: this.prestado ? null : valor.estado,
      fechaAdquisicion: valor.fechaAdquisicion || null,
    };
    this.guardando.set(true);
    const peticion = this.ejemplar ? this.servicio.actualizar(this.ejemplar.id, dato) : this.servicio.crear(dato);
    peticion.subscribe({
      next: () => {
        this.notificacion.exito('Ejemplar guardado.');
        this.ref.close(true);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.guardando.set(false);
      },
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Prestamo } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { fecha } from '../../shared/formato';
import { DevolucionService } from './devolucion.service';

@Component({
  selector: 'app-devolucion-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Registrar devolución</h2>
    <mat-dialog-content>
      <p><strong>{{ prestamo.titulo }}</strong> ({{ prestamo.codigoBarras }})</p>
      <p>Usuario: {{ prestamo.usuario }} · Devolver antes de: {{ fecha(prestamo.fechaDevolucionPrevista) }}</p>
      <form [formGroup]="formulario" class="formulario">
        <mat-form-field>
          <mat-label>Estado del ejemplar</mat-label>
          <mat-select formControlName="estadoEjemplar">
            <mat-option value="DISPONIBLE">Buen estado (DISPONIBLE)</mat-option>
            <mat-option value="DANADO">Dañado</mat-option>
            <mat-option value="PERDIDO">Perdido</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button [disabled]="formulario.invalid || guardando()" (click)="registrar()">Registrar devolución</button>
    </mat-dialog-actions>
  `,
})
export class DevolucionDialog {
  private readonly servicio = inject(DevolucionService);
  private readonly notificacion = inject(NotificacionService);
  private readonly ref = inject(MatDialogRef<DevolucionDialog>);
  readonly prestamo = inject<Prestamo>(MAT_DIALOG_DATA);
  readonly fecha = fecha;
  readonly guardando = signal(false);
  readonly formulario = inject(FormBuilder).nonNullable.group({
    estadoEjemplar: ['DISPONIBLE', Validators.required],
    observaciones: ['', Validators.maxLength(500)],
  });

  registrar(): void {
    const { estadoEjemplar, observaciones } = this.formulario.getRawValue();
    this.guardando.set(true);
    this.servicio.registrar(this.prestamo.id, observaciones, estadoEjemplar).subscribe({
      next: (d) => this.ref.close(d),
      error: (e) => {
        this.notificacion.errorApi(e);
        this.guardando.set(false);
      },
    });
  }
}

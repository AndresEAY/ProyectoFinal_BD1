import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CrudService } from '../../core/crud.service';
import { NotificacionService } from '../../core/notificacion.service';

export interface Campo {
  clave: string;
  etiqueta: string;
  requerido: boolean;
  maximo: number;
}

export interface DatosCatalogoDialog {
  titulo: string;
  campos: Campo[];
  servicio: CrudService<object>;
  registro: Record<string, unknown> | null;
}

@Component({
  selector: 'app-catalogo-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ datos.registro ? 'Editar' : 'Agregar' }} {{ datos.titulo }}</h2>
    <mat-dialog-content>
      <form [formGroup]="formulario" class="formulario">
        @for (campo of datos.campos; track campo.clave) {
          <mat-form-field>
            <mat-label>{{ campo.etiqueta }}</mat-label>
            <input matInput [formControlName]="campo.clave" />
            @if (formulario.controls[campo.clave].hasError('required')) { <mat-error>Obligatorio</mat-error> }
            @if (formulario.controls[campo.clave].hasError('maxlength')) { <mat-error>Máximo {{ campo.maximo }} caracteres</mat-error> }
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button [disabled]="formulario.invalid || guardando()" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
  `,
})
export class CatalogoDialog {
  readonly datos = inject<DatosCatalogoDialog>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<CatalogoDialog>);
  private readonly notificacion = inject(NotificacionService);
  readonly guardando = signal(false);
  readonly formulario = new FormGroup<Record<string, FormControl<string>>>(
    Object.fromEntries(
      this.datos.campos.map((c) => {
        const validadores: ValidatorFn[] = [Validators.maxLength(c.maximo)];
        if (c.requerido) {
          validadores.push(Validators.required);
        }
        return [c.clave, new FormControl(String(this.datos.registro?.[c.clave] ?? ''), { nonNullable: true, validators: validadores })];
      }),
    ),
  );

  guardar(): void {
    const id = this.datos.registro?.['id'] as number | undefined;
    const valor = this.formulario.getRawValue();
    this.guardando.set(true);
    const peticion = id ? this.datos.servicio.actualizar(id, valor) : this.datos.servicio.crear(valor);
    peticion.subscribe({
      next: () => {
        this.notificacion.exito(`${this.datos.titulo} guardado(a).`);
        this.ref.close(true);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.guardando.set(false);
      },
    });
  }
}

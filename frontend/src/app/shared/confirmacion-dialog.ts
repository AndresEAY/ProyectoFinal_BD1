import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  textoAceptar?: string;
}

@Component({
  selector: 'app-confirmacion-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ datos.titulo }}</h2>
    <mat-dialog-content>{{ datos.mensaje }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button [mat-dialog-close]="true">{{ datos.textoAceptar ?? 'Aceptar' }}</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmacionDialog {
  readonly datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
}

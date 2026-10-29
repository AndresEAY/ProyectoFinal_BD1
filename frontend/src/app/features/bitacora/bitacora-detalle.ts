import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Bitacora } from '../../core/models';
import { fechaHora } from '../../shared/formato';

@Component({
  selector: 'app-bitacora-detalle',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ registro.operacion }} en {{ registro.tabla }} #{{ registro.idRegistro }}</h2>
    <mat-dialog-content>
      <p>{{ fechaHora(registro.fechaHora) }} · {{ registro.usuario }}</p>
      <div class="comparacion">
        <div>
          <h3>Datos anteriores</h3>
          <pre>{{ formatear(registro.datosAnteriores) }}</pre>
        </div>
        <div>
          <h3>Datos nuevos</h3>
          <pre>{{ formatear(registro.datosNuevos) }}</pre>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cerrar</button></mat-dialog-actions>
  `,
})
export class BitacoraDetalle {
  readonly registro = inject<Bitacora>(MAT_DIALOG_DATA);
  readonly fechaHora = fechaHora;

  formatear(json: string | null): string {
    if (!json) {
      return '—';
    }
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  }
}

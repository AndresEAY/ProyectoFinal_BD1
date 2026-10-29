import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth.service';
import { RolDto, Usuario } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuario-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ usuario ? 'Editar usuario' : 'Registrar usuario' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="formulario" class="formulario-grid">
        <mat-form-field><mat-label>Código / carné</mat-label><input matInput formControlName="codigo" /></mat-form-field>
        <mat-form-field>
          <mat-label>Rol</mat-label>
          <mat-select formControlName="idRol">
            @for (rol of roles(); track rol.id) {
              <mat-option [value]="rol.id">{{ rol.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field><mat-label>Nombres</mat-label><input matInput formControlName="nombres" /></mat-form-field>
        <mat-form-field><mat-label>Apellidos</mat-label><input matInput formControlName="apellidos" /></mat-form-field>
        <mat-form-field>
          <mat-label>Correo</mat-label><input matInput formControlName="correo" />
          @if (formulario.controls.correo.hasError('email')) { <mat-error>Correo inválido</mat-error> }
        </mat-form-field>
        <mat-form-field><mat-label>Teléfono</mat-label><input matInput formControlName="telefono" /></mat-form-field>
        <mat-form-field class="ancho-completo"><mat-label>Dirección</mat-label><input matInput formControlName="direccion" /></mat-form-field>
        <mat-form-field><mat-label>Usuario (login)</mat-label><input matInput formControlName="username" /></mat-form-field>
        <mat-form-field>
          <mat-label>{{ usuario ? 'Nueva contraseña (opcional)' : 'Contraseña' }}</mat-label>
          <input matInput type="password" formControlName="password" />
          @if (formulario.controls.password.hasError('minlength')) { <mat-error>Mínimo 6 caracteres</mat-error> }
        </mat-form-field>
        @if (usuario) {
          <mat-form-field>
            <mat-label>Estado</mat-label>
            <mat-select formControlName="estado">
              <mat-option value="A">Activo</mat-option>
              <mat-option value="I">Inactivo</mat-option>
            </mat-select>
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
export class UsuarioDialog implements OnInit {
  private readonly servicio = inject(UsuarioService);
  private readonly auth = inject(AuthService);
  private readonly notificacion = inject(NotificacionService);
  private readonly ref = inject(MatDialogRef<UsuarioDialog>);
  readonly usuario = inject<Usuario | null>(MAT_DIALOG_DATA);
  readonly roles = signal<RolDto[]>([]);
  readonly guardando = signal(false);

  readonly formulario = inject(FormBuilder).nonNullable.group({
    codigo: [this.usuario?.codigo ?? '', [Validators.required, Validators.maxLength(20)]],
    idRol: [this.usuario?.idRol ?? 0, [Validators.required, Validators.min(1)]],
    nombres: [this.usuario?.nombres ?? '', [Validators.required, Validators.maxLength(100)]],
    apellidos: [this.usuario?.apellidos ?? '', [Validators.required, Validators.maxLength(100)]],
    correo: [this.usuario?.correo ?? '', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: [this.usuario?.telefono ?? '', Validators.maxLength(20)],
    direccion: [this.usuario?.direccion ?? '', Validators.maxLength(250)],
    username: [this.usuario?.username ?? '', [Validators.required, Validators.maxLength(50)]],
    password: ['', this.usuario ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]],
    estado: [this.usuario?.estado ?? ('A' as 'A' | 'I')],
  });

  ngOnInit(): void {
    this.servicio.roles().subscribe((roles) =>
      this.roles.set(this.auth.tieneRol(['ADMIN']) ? roles : roles.filter((r) => r.nombre === 'PROFESOR' || r.nombre === 'ESTUDIANTE')),
    );
  }

  guardar(): void {
    const valor = this.formulario.getRawValue();
    const dato: Usuario = { ...valor, password: valor.password || undefined };
    this.guardando.set(true);
    const peticion = this.usuario?.id ? this.servicio.actualizar(this.usuario.id, dato) : this.servicio.crear(dato);
    peticion.subscribe({
      next: () => {
        this.notificacion.exito('Usuario guardado.');
        this.ref.close(true);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.guardando.set(false);
      },
    });
  }
}

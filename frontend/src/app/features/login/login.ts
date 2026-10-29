import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensajeDeError } from '../../core/notificacion.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatProgressBarModule],
  template: `
    <div class="login">
      <mat-card class="login-tarjeta">
        <mat-card-header>
          <mat-icon mat-card-avatar class="login-icono">local_library</mat-icon>
          <mat-card-title>Biblioteca Universitaria</mat-card-title>
          <mat-card-subtitle>Inicie sesión para continuar</mat-card-subtitle>
        </mat-card-header>
        @if (cargando()) {
          <mat-progress-bar mode="indeterminate" />
        }
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="entrar()" class="formulario">
            <mat-form-field appearance="outline">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
            </mat-form-field>
            @if (error()) {
              <p class="texto-error">{{ error() }}</p>
            }
            <button mat-flat-button type="submit" [disabled]="formulario.invalid || cargando()">Entrar</button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly formulario = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  entrar(): void {
    const { username, password } = this.formulario.getRawValue();
    this.cargando.set(true);
    this.error.set('');
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/inicio']),
      error: (e) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }
}

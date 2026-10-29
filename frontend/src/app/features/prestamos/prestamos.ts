import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Ejemplar, Prestamo, Usuario } from '../../core/models';
import { mensajeDeError, NotificacionService } from '../../core/notificacion.service';
import { fecha } from '../../shared/formato';
import { Columna, Tabla } from '../../shared/tabla';
import { EjemplarService } from '../ejemplares/ejemplar.service';
import { UsuarioService } from '../usuarios/usuario.service';
import { PrestamoService } from './prestamo.service';

@Component({
  selector: 'app-prestamos',
  imports: [ReactiveFormsModule, FormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSlideToggleModule, Tabla],
  template: `
    <h1>Préstamos</h1>
    <mat-card class="tarjeta">
      <mat-card-header><mat-card-title>Nuevo préstamo</mat-card-title></mat-card-header>
      <mat-card-content>
        <form [formGroup]="formulario" (ngSubmit)="registrar()" class="formulario-linea">
          <mat-form-field appearance="outline">
            <mat-label>Buscar usuario</mat-label>
            <input matInput [ngModel]="filtroUsuario()" (ngModelChange)="filtroUsuario.set($event)" [ngModelOptions]="{ standalone: true }" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="campo-ancho">
            <mat-label>Usuario solicitante</mat-label>
            <mat-select formControlName="idUsuario">
              @for (u of usuariosFiltrados(); track u.id) {
                <mat-option [value]="u.id">{{ u.codigo }} · {{ u.nombres }} {{ u.apellidos }} ({{ u.rol }})</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Buscar ejemplar</mat-label>
            <input matInput [ngModel]="filtroEjemplar()" (ngModelChange)="filtroEjemplar.set($event)" [ngModelOptions]="{ standalone: true }" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="campo-ancho">
            <mat-label>Ejemplar disponible</mat-label>
            <mat-select formControlName="idEjemplar">
              @for (e of ejemplaresFiltrados(); track e.id) {
                <mat-option [value]="e.id">{{ e.codigoBarras }} · {{ e.titulo }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-flat-button type="submit" [disabled]="formulario.invalid || guardando()">
            <mat-icon>outbox</mat-icon> Registrar préstamo
          </button>
        </form>
        @if (resultado(); as r) {
          <p class="texto-exito">
            Préstamo #{{ r.id }} registrado: <strong>{{ r.titulo }}</strong> para {{ r.usuario }}.
            Fecha de devolución prevista: <strong>{{ fecha(r.fechaDevolucionPrevista) }}</strong>.
          </p>
        }
        @if (error()) {
          <p class="texto-error">No se pudo registrar: {{ error() }}</p>
        }
      </mat-card-content>
    </mat-card>
    <div class="encabezado">
      <h2>Listado de préstamos</h2>
      <mat-slide-toggle [ngModel]="soloAbiertos()" (ngModelChange)="soloAbiertos.set($event); cargar()">Solo activos y vencidos</mat-slide-toggle>
    </div>
    <app-tabla [columnas]="columnas" [datos]="prestamos()" [cargando]="cargando()" [claseFila]="claseFila" />
  `,
})
export class Prestamos implements OnInit {
  private readonly servicio = inject(PrestamoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly ejemplarService = inject(EjemplarService);
  private readonly notificacion = inject(NotificacionService);
  readonly fecha = fecha;
  readonly usuarios = signal<Usuario[]>([]);
  readonly ejemplares = signal<Ejemplar[]>([]);
  readonly prestamos = signal<Prestamo[]>([]);
  readonly filtroUsuario = signal('');
  readonly filtroEjemplar = signal('');
  readonly soloAbiertos = signal(false);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly resultado = signal<Prestamo | null>(null);
  readonly error = signal('');

  readonly usuariosFiltrados = computed(() => {
    const filtro = this.filtroUsuario().toLowerCase();
    return this.usuarios().filter((u) => `${u.codigo} ${u.nombres} ${u.apellidos}`.toLowerCase().includes(filtro));
  });
  readonly ejemplaresFiltrados = computed(() => {
    const filtro = this.filtroEjemplar().toLowerCase();
    return this.ejemplares().filter((e) => `${e.codigoBarras} ${e.titulo}`.toLowerCase().includes(filtro));
  });

  readonly formulario = inject(FormBuilder).group({
    idUsuario: [null as number | null, Validators.required],
    idEjemplar: [null as number | null, Validators.required],
  });

  readonly columnas: Columna<Prestamo>[] = [
    { clave: 'id', titulo: '#' },
    { clave: 'usuario', titulo: 'Usuario', valor: (p) => `${p.codigoUsuario} · ${p.usuario}` },
    { clave: 'titulo', titulo: 'Libro' },
    { clave: 'codigoBarras', titulo: 'Ejemplar' },
    { clave: 'fechaPrestamo', titulo: 'Préstamo', valor: (p) => fecha(p.fechaPrestamo) },
    { clave: 'fechaDevolucionPrevista', titulo: 'Devolver antes de', valor: (p) => fecha(p.fechaDevolucionPrevista) },
    { clave: 'estado', titulo: 'Estado' },
    { clave: 'bibliotecario', titulo: 'Registró' },
  ];

  readonly claseFila = (p: Prestamo) => (p.estado === 'VENCIDO' ? 'fila-error' : '');

  ngOnInit(): void {
    this.usuarioService.listar().subscribe((u) => this.usuarios.set(u.filter((x) => x.estado === 'A')));
    this.cargarEjemplares();
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar(this.soloAbiertos()).subscribe({
      next: (p) => {
        this.prestamos.set(p);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.cargando.set(false);
      },
    });
  }

  registrar(): void {
    const { idUsuario, idEjemplar } = this.formulario.getRawValue();
    this.guardando.set(true);
    this.resultado.set(null);
    this.error.set('');
    this.servicio.registrar(idUsuario!, idEjemplar!).subscribe({
      next: (p) => {
        this.resultado.set(p);
        this.notificacion.exito('Préstamo registrado.');
        this.formulario.reset();
        this.guardando.set(false);
        this.cargarEjemplares();
        this.cargar();
      },
      error: (e) => {
        this.error.set(mensajeDeError(e));
        this.notificacion.errorApi(e);
        this.guardando.set(false);
      },
    });
  }

  private cargarEjemplares(): void {
    this.ejemplarService.buscar({ estado: 'DISPONIBLE' }).subscribe((e) => this.ejemplares.set(e));
  }
}

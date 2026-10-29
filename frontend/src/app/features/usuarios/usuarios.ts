import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';
import { Usuario } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { ConfirmacionDialog } from '../../shared/confirmacion-dialog';
import { fecha } from '../../shared/formato';
import { Accion, Columna, Tabla } from '../../shared/tabla';
import { UsuarioDialog } from './usuario-dialog';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuarios',
  imports: [Tabla, MatButtonModule, MatIconModule],
  template: `
    <div class="encabezado">
      <h1>Usuarios</h1>
      <button mat-flat-button (click)="abrir(null)"><mat-icon>person_add</mat-icon> Registrar usuario</button>
    </div>
    <app-tabla [columnas]="columnas" [datos]="usuarios()" [acciones]="acciones" [cargando]="cargando()"
               [claseFila]="claseFila" />
  `,
})
export class Usuarios implements OnInit {
  private readonly servicio = inject(UsuarioService);
  private readonly dialog = inject(MatDialog);
  private readonly notificacion = inject(NotificacionService);
  private readonly esAdmin = inject(AuthService).tieneRol(['ADMIN']);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(false);

  readonly columnas: Columna<Usuario>[] = [
    { clave: 'codigo', titulo: 'Código' },
    { clave: 'nombre', titulo: 'Nombre', valor: (u) => `${u.apellidos}, ${u.nombres}` },
    { clave: 'correo', titulo: 'Correo' },
    { clave: 'telefono', titulo: 'Teléfono' },
    { clave: 'rol', titulo: 'Rol' },
    { clave: 'username', titulo: 'Usuario' },
    { clave: 'fechaRegistro', titulo: 'Registro', valor: (u) => fecha(u.fechaRegistro) },
    { clave: 'estado', titulo: 'Estado', valor: (u) => (u.estado === 'A' ? 'Activo' : 'Inactivo') },
  ];

  readonly acciones: Accion<Usuario>[] = this.esAdmin
    ? [
        { icono: 'edit', texto: 'Editar', ejecutar: (u) => this.abrir(u) },
        { icono: 'person_off', texto: 'Desactivar', ejecutar: (u) => this.desactivar(u), visible: (u) => u.estado === 'A' },
      ]
    : [];

  readonly claseFila = (u: Usuario) => (u.estado === 'I' ? 'fila-inactiva' : '');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (u) => {
        this.usuarios.set(u);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.cargando.set(false);
      },
    });
  }

  abrir(usuario: Usuario | null): void {
    this.dialog.open(UsuarioDialog, { data: usuario, width: '720px' }).afterClosed().subscribe((ok) => ok && this.cargar());
  }

  desactivar(usuario: Usuario): void {
    this.dialog
      .open(ConfirmacionDialog, {
        data: { titulo: 'Desactivar usuario', mensaje: `¿Desactivar a ${usuario.nombres} ${usuario.apellidos}? No podrá iniciar sesión ni pedir préstamos.`, textoAceptar: 'Desactivar' },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.servicio.eliminar(usuario.id!).subscribe({
            next: () => {
              this.notificacion.exito('Usuario desactivado.');
              this.cargar();
            },
            error: (e) => this.notificacion.errorApi(e),
          });
        }
      });
  }
}

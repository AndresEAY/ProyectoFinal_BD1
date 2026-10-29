import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { Autor, Categoria, Editorial, Libro, LibroRequest } from '../../core/models';
import { NotificacionService } from '../../core/notificacion.service';
import { AutorService } from '../catalogos/autor.service';
import { CategoriaService } from '../catalogos/categoria.service';
import { EditorialService } from '../catalogos/editorial.service';
import { LibroService } from './libro.service';

@Component({
  selector: 'app-libro-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ libro ? 'Editar libro' : 'Agregar libro' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="formulario" class="formulario-grid">
        <mat-form-field><mat-label>ISBN</mat-label><input matInput formControlName="isbn" /></mat-form-field>
        <mat-form-field><mat-label>Año de publicación</mat-label><input matInput type="number" formControlName="anioPublicacion" /></mat-form-field>
        <mat-form-field class="ancho-completo"><mat-label>Título</mat-label><input matInput formControlName="titulo" /></mat-form-field>
        <mat-form-field class="ancho-completo">
          <mat-label>Autores</mat-label>
          <mat-select formControlName="idsAutores" multiple>
            @for (a of autores(); track a.id) {
              <mat-option [value]="a.id">{{ a.apellidos }}, {{ a.nombres }}</mat-option>
            }
          </mat-select>
          <mat-error>Seleccione al menos un autor</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Editorial</mat-label>
          <mat-select formControlName="idEditorial">
            @for (e of editoriales(); track e.id) {
              <mat-option [value]="e.id">{{ e.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="idCategoria">
            @for (c of categorias(); track c.id) {
              <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field><mat-label>Edición</mat-label><input matInput formControlName="edicion" /></mat-form-field>
        <mat-form-field><mat-label>Idioma</mat-label><input matInput formControlName="idioma" /></mat-form-field>
        <mat-form-field><mat-label>Número de páginas</mat-label><input matInput type="number" formControlName="numPaginas" /></mat-form-field>
        <mat-form-field>
          <mat-label>Estado</mat-label>
          <mat-select formControlName="estado">
            <mat-option value="A">Activo</mat-option>
            <mat-option value="I">Inactivo</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button [disabled]="formulario.invalid || guardando()" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
  `,
})
export class LibroDialog implements OnInit {
  private readonly servicio = inject(LibroService);
  private readonly autorService = inject(AutorService);
  private readonly editorialService = inject(EditorialService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notificacion = inject(NotificacionService);
  private readonly ref = inject(MatDialogRef<LibroDialog>);
  readonly libro = inject<Libro | null>(MAT_DIALOG_DATA);
  readonly autores = signal<Autor[]>([]);
  readonly editoriales = signal<Editorial[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly guardando = signal(false);

  readonly formulario = inject(FormBuilder).group({
    isbn: [this.libro?.isbn ?? '', [Validators.required, Validators.maxLength(20)]],
    titulo: [this.libro?.titulo ?? '', [Validators.required, Validators.maxLength(250)]],
    anioPublicacion: [this.libro?.anioPublicacion ?? null as number | null, [Validators.min(1000), Validators.max(2100)]],
    edicion: [this.libro?.edicion ?? '', Validators.maxLength(30)],
    idioma: [this.libro?.idioma ?? 'Español', Validators.maxLength(30)],
    numPaginas: [this.libro?.numPaginas ?? null as number | null, Validators.min(1)],
    idEditorial: [this.libro?.idEditorial ?? null as number | null, Validators.required],
    idCategoria: [this.libro?.idCategoria ?? null as number | null, Validators.required],
    estado: [this.libro?.estado ?? ('A' as 'A' | 'I'), Validators.required],
    idsAutores: [this.libro?.autores.map((a) => a.id!) ?? ([] as number[]), Validators.required],
  });

  ngOnInit(): void {
    forkJoin([this.autorService.listar(), this.editorialService.listar(), this.categoriaService.listar()]).subscribe({
      next: ([autores, editoriales, categorias]) => {
        this.autores.set(autores);
        this.editoriales.set(editoriales);
        this.categorias.set(categorias);
      },
      error: (e) => this.notificacion.errorApi(e),
    });
  }

  guardar(): void {
    const dato = this.formulario.getRawValue() as LibroRequest;
    this.guardando.set(true);
    const peticion = this.libro ? this.servicio.actualizar(this.libro.id, dato) : this.servicio.crear(dato);
    peticion.subscribe({
      next: () => {
        this.notificacion.exito('Libro guardado.');
        this.ref.close(true);
      },
      error: (e) => {
        this.notificacion.errorApi(e);
        this.guardando.set(false);
      },
    });
  }
}

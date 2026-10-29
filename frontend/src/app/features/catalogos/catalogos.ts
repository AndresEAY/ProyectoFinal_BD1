import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AutorService } from './autor.service';
import { Campo } from './catalogo-dialog';
import { Catalogo } from './catalogo';
import { CategoriaService } from './categoria.service';
import { EditorialService } from './editorial.service';

@Component({
  selector: 'app-catalogos',
  imports: [MatTabsModule, Catalogo],
  template: `
    <h1>Catálogos</h1>
    <mat-tab-group>
      <mat-tab label="Autores"><app-catalogo titulo="autor" [campos]="camposAutor" [servicio]="autores" /></mat-tab>
      <mat-tab label="Editoriales"><app-catalogo titulo="editorial" [campos]="camposEditorial" [servicio]="editoriales" /></mat-tab>
      <mat-tab label="Categorías"><app-catalogo titulo="categoría" [campos]="camposCategoria" [servicio]="categorias" /></mat-tab>
    </mat-tab-group>
  `,
})
export class Catalogos {
  readonly autores = inject(AutorService);
  readonly editoriales = inject(EditorialService);
  readonly categorias = inject(CategoriaService);

  readonly camposAutor: Campo[] = [
    { clave: 'nombres', etiqueta: 'Nombres', requerido: true, maximo: 100 },
    { clave: 'apellidos', etiqueta: 'Apellidos', requerido: true, maximo: 100 },
    { clave: 'nacionalidad', etiqueta: 'Nacionalidad', requerido: false, maximo: 60 },
  ];
  readonly camposEditorial: Campo[] = [
    { clave: 'nombre', etiqueta: 'Nombre', requerido: true, maximo: 150 },
    { clave: 'pais', etiqueta: 'País', requerido: false, maximo: 60 },
  ];
  readonly camposCategoria: Campo[] = [
    { clave: 'nombre', etiqueta: 'Nombre', requerido: true, maximo: 100 },
    { clave: 'descripcion', etiqueta: 'Descripción', requerido: false, maximo: 250 },
  ];
}

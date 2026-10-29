export type Rol = 'ADMIN' | 'BIBLIOTECARIO' | 'PROFESOR' | 'ESTUDIANTE';

export const PERSONAL: Rol[] = ['ADMIN', 'BIBLIOTECARIO'];

export interface Sesion {
  token: string;
  idUsuario: number;
  username: string;
  nombre: string;
  rol: Rol;
}

export interface RolDto {
  id: number;
  nombre: Rol;
  descripcion: string;
  diasPrestamo: number;
  maxPrestamos: number;
}

export interface Usuario {
  id?: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro?: string;
  estado: 'A' | 'I';
  idRol: number;
  rol?: Rol;
  username: string;
  password?: string;
}

export interface Autor {
  id?: number;
  nombres: string;
  apellidos: string;
  nacionalidad?: string;
}

export interface Editorial {
  id?: number;
  nombre: string;
  pais?: string;
}

export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface Libro {
  id: number;
  isbn: string;
  titulo: string;
  anioPublicacion?: number;
  edicion?: string;
  idioma?: string;
  numPaginas?: number;
  idEditorial: number;
  editorial: string;
  idCategoria: number;
  categoria: string;
  estado: 'A' | 'I';
  autores: Autor[];
  totalEjemplares: number;
  disponibles: number;
}

export interface LibroRequest {
  isbn: string;
  titulo: string;
  anioPublicacion?: number | null;
  edicion?: string;
  idioma?: string;
  numPaginas?: number | null;
  idEditorial: number;
  idCategoria: number;
  estado: 'A' | 'I';
  idsAutores: number[];
}

export type EstadoEjemplar = 'DISPONIBLE' | 'PRESTADO' | 'DANADO' | 'PERDIDO' | 'INACTIVO';

export interface Ejemplar {
  id: number;
  idLibro: number;
  isbn: string;
  titulo: string;
  codigoBarras: string;
  estado: EstadoEjemplar;
  fechaAdquisicion: string;
}

export interface EjemplarRequest {
  idLibro: number;
  codigoBarras: string;
  estado: EstadoEjemplar | null;
  fechaAdquisicion?: string | null;
}

export interface Prestamo {
  id: number;
  idUsuario: number;
  codigoUsuario: string;
  usuario: string;
  idEjemplar: number;
  codigoBarras: string;
  idLibro: number;
  titulo: string;
  bibliotecario: string;
  fechaPrestamo: string;
  fechaDevolucionPrevista: string;
  estado: 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';
  diasRestantes: number | null;
  fechaDevolucionReal: string | null;
  aTiempo: 'S' | 'N' | null;
  diasRetraso: number | null;
}

export interface Devolucion {
  id: number;
  idPrestamo: number;
  usuario: string;
  codigoBarras: string;
  titulo: string;
  fechaPrestamo: string;
  fechaDevolucionPrevista: string;
  fechaDevolucionReal: string;
  aTiempo: 'S' | 'N';
  diasRetraso: number;
  observaciones: string | null;
  bibliotecario: string;
  estadoEjemplar: EstadoEjemplar;
}

export interface Bitacora {
  id: number;
  fechaHora: string;
  usuario: string;
  tabla: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  idRegistro: number | null;
  datosAnteriores: string | null;
  datosNuevos: string | null;
}

export interface Pagina<T> {
  contenido: T[];
  total: number;
  pagina: number;
  tamanio: number;
}

export type Fila = Record<string, string | number | null>;

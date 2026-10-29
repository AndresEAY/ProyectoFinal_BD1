export function fecha(valor: string | null | undefined): string {
  if (!valor) {
    return '';
  }
  const [anio, mes, dia] = valor.substring(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}

export function fechaHora(valor: string | null | undefined): string {
  return valor ? `${fecha(valor)} ${valor.substring(11, 19)}` : '';
}

export function hoyIso(): string {
  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  return hoy.toISOString().substring(0, 10);
}

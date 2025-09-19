// lib/config.ts

/** Zona horaria de referencia para mostrar fechas humanas (no para cálculos) */
export const TIMEZONE = 'America/Guatemala'; // GT = UTC-6, sin DST

/** Configuración global del evento (igual para todos los invitados) */
export const EVENT = {
  /** Fecha/hora del evento en UTC ISO. Ejemplo: 2025-12-20 18:00 GT = 2025-12-21T00:00:00Z */
  eventISO: '2025-11-09T02:00:00Z',

  /** Mensaje de invitación (texto largo) */
  message:
    'Nos encantaría contar con tu presencia para celebrar esta ocasión especial. ¡Gracias por acompañarnos!',

  /** Lugar del evento (para mostrar y para abrir mapas) */
  venue: {
    name: 'Club Español',
    address: 'Calzada Roosevelt km 13.5 40-20 Guatemala'
  },
};

/** URLs de mapas (usar lat/lng para mayor precisión) */
export function googleMapsUrl() {
  return `https://maps.app.goo.gl/YHaQJsV2cMMm687M8`;
}

export function wazeUrl() {
  return `https://ul.waze.com/ul?place=ChIJEfSofjigiYURlNTqFywDlXI&ll=14.63499450%2C-90.57495880&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location`;
}

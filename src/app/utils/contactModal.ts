/**
 * "Bog'lanish" modalini ochish (ContactModal.tsx shu hodisani tinglaydi).
 * "Narxni so'rash" tugmalari qaysi tarif bosilganini `tariff` orqali uzatadi —
 * u arizaga (lead) yoziladi.
 */
export const TARIFFS = ['start', 'optimal', 'vip'] as const;
export type Tariff = (typeof TARIFFS)[number];
export type ContactModalDetail = { tariff?: Tariff };

export const CONTACT_MODAL_EVENT = 'openContactModal';

export function openContactModal(detail: ContactModalDetail = {}): void {
  window.dispatchEvent(new CustomEvent<ContactModalDetail>(CONTACT_MODAL_EVENT, { detail }));
}

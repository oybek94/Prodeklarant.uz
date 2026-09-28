import config from '../../content/services.json';

/** Alohida xizmat sahifasi konfiguratsiyasi (src/content/services.json). */
export type ServicePageConfig = { slug: string; itemKey: string; indexable: boolean };

export const SERVICE_PAGES: ServicePageConfig[] = config.pages;

export function findServicePage(slug: string | undefined): ServicePageConfig | undefined {
  return SERVICE_PAGES.find((p) => p.slug === slug);
}

/** services.items.<itemKey> uchun alohida sahifa bo'lsa — uning yo'li, aks holda /services. */
export function servicePath(itemKey: string): string {
  const page = SERVICE_PAGES.find((p) => p.itemKey === itemKey);
  return page ? `/services/${page.slug}` : '/services';
}

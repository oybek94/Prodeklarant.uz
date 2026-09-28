/**
 * Schema.org JSON-LD bloki. React daraxtida render qilinadi — SSR'da xom HTML'ga tushadi
 * (Google/Yandex JSON-LD'ni <body> ichida ham o'qiydi) va navigatsiyada yangilanadi.
 * `<` belgilari escape qilinadi: matn ichidagi "</script>" blokni buzmasin.
 */
export function JsonLd({ data, id }: { data: unknown; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

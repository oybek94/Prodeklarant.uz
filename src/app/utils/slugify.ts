/** Kirill va boshqa harflarni lotinga o‘giradi — URL da faqat lotin bo‘ladi */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z',
  'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
  'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ў': 'o', 'ғ': 'g', 'қ': 'q', 'ҳ': 'h',
};

function transliterateToLatin(str: string): string {
  return str
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join('');
}

/** Sarlavhadan SEO-friendly slug (faqat lotin, raqam va defis) */
export function slugify(text: string): string {
  const latin = transliterateToLatin(text);
  return latin
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function blogPostPath(_id: number, title: string): string {
  return `/blog/${slugify(title)}`;
}

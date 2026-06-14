// Blog maqolalari uchun yagona fallback rasm ro'yxati.
// Ilgari Home (3 ta) / Blog / BlogPost (4 ta) har xil massiv ishlatardi —
// natijada bir post turli sahifalarda turli rasm ko'rsatardi. Endi yagona manba.
export const BLOG_IMAGES = [
  '/images/p533280-800.jpg',
  '/images/p1327838-800.jpg',
  '/images/p1410235-800.jpg',
  '/images/p264537-800.jpg',
];

export function fallbackBlogImage(id: number): string {
  const idx = ((id - 1) % BLOG_IMAGES.length + BLOG_IMAGES.length) % BLOG_IMAGES.length;
  return BLOG_IMAGES[idx];
}

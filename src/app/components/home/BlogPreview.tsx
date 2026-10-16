import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalePath } from '../../utils/locale';
import { blogPostPath } from '../../utils/slugify';
import { SectionLabel, type CssVars } from './shared';

export type PreviewPost = { id: number; slug: string; title: string; excerpt: string; date: string; image: string };

// Server (SSR) va brauzer bir xil natija berishi uchun vaqt zonasiga bog'liq emas:
// "YYYY-MM-DD..." qatoridan to'g'ridan-to'g'ri o'qiymiz.
function formatPostDate(dateStr: string): string {
  if (!dateStr) return '';
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()}`;
}

/** So'nggi maqolalar — maqola bo'lmasa blok umuman chizilmaydi (Home chaqirmaydi). */
export default function BlogPreview({ posts, num = '07' }: { posts: PreviewPost[]; num?: string }) {
  const { t } = useTranslation();
  const lp = useLocalePath();
  return (
    <section style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)', padding: '110px 0' }}>
      <div className="wrap">
        <div className="rv" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <SectionLabel num={num}>{t('pd.blog.label')}</SectionLabel>
            <h2 className="serif h2">{t('home.blog.title')}</h2>
          </div>
          <Link className="lnk" to={lp('/blog')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--blue)' }}>
            {t('home.blog.readAll')} <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
          </Link>
        </div>
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {posts.map((post, i) => (
            <Link key={post.id} to={lp(blogPostPath(post))} className="bcard rv" style={{ '--s': `${i * 8}%`, display: 'block' } as CssVars}>
              <div className="ph">
                <img src={post.image} alt={post.title} width={600} height={375} loading="lazy" decoding="async" />
              </div>
              <div className="mono" style={{ margin: '20px 0 0', color: 'var(--gold-d)', fontSize: 11.5 }}>{formatPostDate(post.date)}</div>
              <h3 className="serif" style={{ margin: '8px 0 10px', fontSize: 26, lineHeight: 1.2 }}>{post.title}</h3>
              <p style={{ margin: 0, color: 'var(--mut)', fontSize: 16 }} className="line-clamp-3">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

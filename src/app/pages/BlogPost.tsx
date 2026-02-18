import { useParams, Link } from 'react-router';
import { getBlogPosts } from './Blog';
import { ArrowLeft, Calendar, User, Tag, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BlogPost() {
  const { t } = useTranslation();
  const { id } = useParams();
  const blogPosts = getBlogPosts(t);
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('blogPost.notFound')}</h1>
        <Link to="/blog" className="text-blue-900 font-bold hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> {t('blogPost.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header Image */}
      <div className="h-[400px] relative">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/50"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-900 to-transparent">
          <div className="container mx-auto px-4">
            <Link to="/blog" className="text-yellow-500 hover:text-white mb-4 inline-flex items-center gap-2 font-bold uppercase text-xs tracking-wider transition-colors">
              <ArrowLeft size={16} /> {t('blogPost.back')}
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-white text-sm font-medium">
              <span className="flex items-center gap-2"><Calendar size={16} className="text-yellow-500" /> {post.date}</span>
              <span className="flex items-center gap-2"><User size={16} className="text-yellow-500" /> {post.author}</span>
              <span className="flex items-center gap-2"><Tag size={16} className="text-yellow-500" /> {post.category}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="prose prose-lg max-w-none text-slate-700">
              <p className="lead text-xl font-medium text-slate-900 mb-8 italic border-l-4 border-yellow-500 pl-4">
                {post.excerpt}
              </p>
              
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">{t('blogPost.mainRules')}</h2>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
              
              <blockquote className="bg-slate-50 p-6 my-8 border-l-4 border-blue-900 italic font-medium text-slate-800">
                "{t('blogPost.quote')}"
              </blockquote>
              
              <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">{t('blogPost.exportBenefits')}</h3>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
              </p>
              
              <ul className="list-disc pl-6 space-y-2 mt-4 mb-8">
                <li>Bojxona to'lovlarini kechiktirib to'lash imkoniyati</li>
                <li>Yashil yo'lak tizimidan foydalanish</li>
                <li>Elektron deklaratsiya topshirish tizimi</li>
                <li>Bojxona omborlaridan imtiyozli foydalanish</li>
              </ul>
              
              <p>
                Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.
              </p>
            </div>

            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase text-sm">{t('blogPost.share')}</span>
              <div className="flex space-x-4">
                <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-900 hover:text-white transition-colors">
                  <Share2 size={18} />
                </button>
                {/* Add other social icons if needed */}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-slate-50 p-8 rounded-sm sticky top-24 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase">{t('blogPost.related')}</h3>
              <div className="space-y-6">
                {blogPosts.filter(p => p.id !== post.id).slice(0, 3).map(related => (
                  <div key={related.id} className="group cursor-pointer">
                    <div className="text-xs text-slate-500 mb-1">{related.date}</div>
                    <Link to={`/blog/${related.id}`} className="font-bold text-slate-900 hover:text-blue-900 transition-colors block mb-2 leading-tight">
                      {related.title}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase">{t('blogPost.tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {['Eksport', 'Bojxona', 'Logistika', 'Qonunchilik', 'Imtiyozlar', 'Transport', 'TIF'].map(tag => (
                    <span key={tag} className="bg-white border border-slate-200 px-3 py-1 text-xs text-slate-600 uppercase hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-colors cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

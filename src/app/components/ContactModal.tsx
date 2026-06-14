import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.62-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.15 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .28z" /></svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm5.44 14.35c-.23.65-1.33 1.21-1.85 1.28-.48.07-1.12.12-3.32-.8-2.65-1.1-4.36-3.8-4.49-3.98-.13-.18-1.07-1.42-1.07-2.71 0-1.29.68-1.92.93-2.18.23-.23.51-.29.68-.29.17 0 .34 0 .49.02.16.02.37-.06.57.42.2.49.68 1.66.74 1.78.06.13.11.27.02.44-.09.18-.13.3-.27.46-.12.14-.27.32-.38.43-.13.13-.27.27-.12.53.15.26.68 1.13 1.48 1.84.99.89 1.83 1.17 2.1 1.3.26.13.42.11.58-.07.16-.18.68-.8.87-1.07.18-.27.36-.23.61-.13.25.09 1.58.74 1.85.88.27.13.45.2.52.32.07.13.07.72-.16 1.37z" /></svg>
);

export default function ContactModal() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('openContactModal', handleOpen);
        return () => window.removeEventListener('openContactModal', handleOpen);
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="contact-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="contact-modal-title"
            >
                <motion.div
                    key="contact-modal-content"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Decorative background */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/10 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-[40px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex justify-end mb-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
                                aria-label={t('home.tariffs.close')}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-8">
                            <div className="w-16 h-16 bg-brand-light/20 text-brand rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                <Phone size={28} strokeWidth={2.5} />
                            </div>
                            <h3 id="contact-modal-title" className="text-2xl font-extrabold text-slate-900 mb-2">
                                {t('home.tariffs.modalTitle') || "Bog'lanish"}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium px-4">
                                {t('contact.modal.subtitle')}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <a
                                href="https://t.me/+998911187007"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold py-3.5 px-5 rounded-xl text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_10px_rgba(0,136,204,0.3)]"
                            >
                                <div className="flex items-center gap-3">
                                    <TelegramIcon />
                                    <span>Telegram</span>
                                </div>
                                <span className="text-sm font-medium opacity-90">+998 91 118 70 07</span>
                            </a>

                            <a
                                href="https://wa.me/998911187007"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold py-3.5 px-5 rounded-xl text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_10px_rgba(37,211,102,0.3)]"
                            >
                                <div className="flex items-center gap-3">
                                    <WhatsAppIcon />
                                    <span>WhatsApp</span>
                                </div>
                                <span className="text-sm font-medium opacity-90">+998 91 118 70 07</span>
                            </a>

                            <a
                                href="tel:+998911187007"
                                className="flex items-center justify-between gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-5 rounded-xl text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md border border-slate-700"
                            >
                                <div className="flex items-center gap-3">
                                    <Phone size={24} className="fill-current" />
                                    <span>{t('contact.modal.call')}</span>
                                </div>
                                <span className="text-sm font-medium opacity-90">+998 91 118 70 07</span>
                            </a>

                            <Link
                                to="/contact"
                                onClick={() => setIsOpen(false)}
                                className="mt-2 inline-block text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
                            >
                                {t('contact.modal.formLink')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

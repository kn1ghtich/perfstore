import { ShoppingBag } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-bold text-white">PerfStore</span>
            </div>
            <p className="text-sm">{t('footer.tagline')}</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.shop')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/catalog" className="hover:text-purple-400 transition-colors">{t('footer.allPerfumes')}</a></li>
              <li><a href="/catalog?gender=female" className="hover:text-purple-400 transition-colors">{t('footer.women')}</a></li>
              <li><a href="/catalog?gender=male" className="hover:text-purple-400 transition-colors">{t('footer.men')}</a></li>
              <li><a href="/catalog?gender=unisex" className="hover:text-purple-400 transition-colors">{t('footer.unisex')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.scentFamilies')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/catalog?category=floral" className="hover:text-purple-400 transition-colors">{t('footer.floral')}</a></li>
              <li><a href="/catalog?category=woody" className="hover:text-purple-400 transition-colors">{t('footer.woody')}</a></li>
              <li><a href="/catalog?category=oriental" className="hover:text-purple-400 transition-colors">{t('footer.oriental')}</a></li>
              <li><a href="/catalog?category=fresh" className="hover:text-purple-400 transition-colors">{t('footer.fresh')}</a></li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
}

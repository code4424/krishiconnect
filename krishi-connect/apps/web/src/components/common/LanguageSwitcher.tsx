import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { user, setUser } = useAuthStore();

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    
    // Update document title
    const pageTitle = document.title.split(' | ')[0];
    document.title = `${pageTitle} | Krishi Connect`;

    if (user) {
      try {
        await api.put('/auth/language', { language: lng.toUpperCase() });
        setUser({ ...user, preferredLanguage: lng.toUpperCase() as any });
      } catch (e) {
        console.error('Failed to sync language preference', e);
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
      <button
        onClick={() => changeLanguage('en')}
        className={cn(
          "px-4 py-1.5 text-[10px] font-black rounded-lg transition-all",
          i18n.language === 'en' 
            ? "bg-[#166534] text-white shadow-lg" 
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        ENGLISH
      </button>
      <button
        onClick={() => changeLanguage('kn')}
        className={cn(
          "px-4 py-1.5 text-[10px] font-black rounded-lg transition-all font-sans",
          i18n.language === 'kn' 
            ? "bg-[#166534] text-white shadow-lg" 
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';

const languages = [
  { code: 'tr', name: 'Türkçe', flagUrl: 'https://flagcdn.com/w40/tr.png' },
  { code: 'en', name: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' },
  { code: 'de', name: 'Deutsch', flagUrl: 'https://flagcdn.com/w40/de.png' },
  { code: 'ru', name: 'Русский', flagUrl: 'https://flagcdn.com/w40/ru.png' },
  { code: 'ar', name: 'العربية', flagUrl: 'https://flagcdn.com/w40/sa.png' }
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('tr');
  const menuRef = useRef(null);

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Trigger Google Translate dropdown
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event('change'));
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check current language from cookie on load
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/tr\/(.*?)(;|$)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const activeLang = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        className="admin-profile-btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img src={activeLang.flagUrl} alt={activeLang.name} style={{ width: '24px', height: 'auto', borderRadius: '4px' }} />
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px',
          background: 'rgba(25, 25, 25, 0.95)', border: '1px solid var(--glass-border)',
          borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px',
          zIndex: 9999, backdropFilter: 'blur(10px)', minWidth: '130px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                background: 'transparent', border: 'none', color: currentLang === lang.code ? 'var(--primary-color)' : '#fff',
                padding: '8px 12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px',
                fontWeight: currentLang === lang.code ? '700' : '500',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <img src={lang.flagUrl} alt={lang.name} style={{ width: '20px', height: 'auto', borderRadius: '2px' }} /> 
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
      return;
    }

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice && !window.navigator.standalone) {
      // Show iOS prompt after a short delay
      const timer = setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwaPromptSeen');
        if (!hasSeenPrompt) {
          setShowIOSPrompt(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Android / Desktop detection
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const hasSeenPrompt = localStorage.getItem('pwaPromptSeen');
      if (!hasSeenPrompt) {
        setShowAndroidPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowAndroidPrompt(false);
        localStorage.setItem('pwaPromptSeen', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  const closePrompt = () => {
    setShowIOSPrompt(false);
    setShowAndroidPrompt(false);
    localStorage.setItem('pwaPromptSeen', 'true');
  };

  if (isStandalone) return null;

  if (showIOSPrompt) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', backgroundColor: 'rgba(25,25,25,0.95)', border: '1px solid #ffaa00', borderRadius: '16px', padding: '16px', zIndex: 9999, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/ortakoy-logo.png" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'contain', backgroundColor: '#000' }} />
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Ana Ekrana Ekle</h4>
              <p style={{ margin: '4px 0 0 0', color: '#aaa', fontSize: '12px', lineHeight: '1.4' }}>Daha hızlı erişim için uygulamamızı cihazınıza kurun.</p>
            </div>
          </div>
          <button onClick={closePrompt} style={{ background: 'none', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer', padding: '0 4px', lineHeight: '1' }}>&times;</button>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#ddd', fontSize: '13px', lineHeight: '1.5' }}>
          1. Tarayıcınızın alt menüsündeki <i className="fa-solid fa-arrow-up-from-bracket" style={{ color: '#007AFF', margin: '0 4px' }}></i> <strong>Paylaş</strong> ikonuna dokunun.<br/><br/>
          2. Açılan menüde aşağı kaydırıp <i className="fa-regular fa-square-plus" style={{ margin: '0 4px' }}></i> <strong>Ana Ekrana Ekle</strong> (Add to Home Screen) seçeneğini seçin.
        </div>
      </div>
    );
  }

  if (showAndroidPrompt && deferredPrompt) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '16px', padding: '16px', zIndex: 9999, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/ortakoy-logo.png" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'contain', backgroundColor: '#000' }} />
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Ortaköy Kumrucusu</h4>
              <p style={{ margin: '4px 0 0 0', color: '#aaa', fontSize: '12px' }}>Menüye her zaman tek tıkla ulaşın</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button onClick={closePrompt} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #444', color: '#aaa', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>İptal</button>
          <button onClick={handleInstallClick} style={{ flex: 1, padding: '10px', background: '#ffaa00', border: 'none', color: '#000', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Yükle</button>
        </div>
      </div>
    );
  }

  return null;
}

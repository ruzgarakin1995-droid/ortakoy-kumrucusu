'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const toastMessages = [
  "Bence bunu kesinlikle denemelisin!",
  "Özel malzemelerimizle taptaze hazırlıyoruz.",
  "Müşterilerimizin en çok tercih ettiği lezzetlerden biri.",
  "Bugün kendini şımartmaya ne dersin?",
  "Tam sana göre harika bir önerimiz var.",
  "Bu eşsiz lezzeti henüz tatmadın mı?"
];

import LanguageSelector from './components/LanguageSelector';

export default function Home() {
  const [data, setData] = useState({ banners: [], featured: [], categories: [], settings: null });
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  
  // Details Modal State
  const [favorites, setFavorites] = useState([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  useEffect(() => {
    if (!isCartOpen && !isFavoritesOpen && (activeNav === 'cart' || activeNav === 'favorites')) setActiveNav('home');
    if (isCartOpen) setActiveNav('cart');
    if (isFavoritesOpen) setActiveNav('favorites');
  }, [isCartOpen, isFavoritesOpen, activeNav]);
  const [showMinCartAlert, setShowMinCartAlert] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [recommendation, setRecommendation] = useState(null);

  // Waiter states
  const [isWaiterOpen, setIsWaiterOpen] = useState(false);
  const [waiterTableNo, setWaiterTableNo] = useState('');
  const [waiterLoading, setWaiterLoading] = useState(false);
  const [showWaiterSuccess, setShowWaiterSuccess] = useState(false);

  const handleCallWaiter = async () => {
    if (!waiterTableNo.trim()) {
      setToast({ msg: 'Lütfen masa numaranızı girin.', type: 'error' });
      return;
    }
    setWaiterLoading(true);
    try {
      const res = await fetch('/api/waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNo: waiterTableNo })
      });
      if (res.ok) {
        setIsWaiterOpen(false);
        setWaiterTableNo('');
        setShowWaiterSuccess(true);
        setTimeout(() => setShowWaiterSuccess(false), 3500);
      } else {
        setToast({ msg: 'Talep oluşturulamadı. Lütfen tekrar deneyin.', type: 'error' });
      }
    } catch (e) {
      setToast({ msg: 'Bağlantı hatası.', type: 'error' });
    } finally {
      setWaiterLoading(false);
    }
  };

  useEffect(() => {
    if (isDetailOpen && selectedItem) {
      if (data.categories && data.categories.length > 0) {
        
        // 1. Ozel (Custom) Cross-Sell Kontrolu
        if (selectedItem.crossSellItemId && selectedItem.crossSellItemId !== 'auto') {
          let customRecItem = null;
          data.categories.forEach(c => {
            if (c.items) {
              const found = c.items.find(i => i.id === selectedItem.crossSellItemId);
              if (found) customRecItem = found;
            }
          });
          
          if (customRecItem) {
            setRecommendation({
              item: customRecItem,
              phrase: "Bunun yanına şu çok iyi gider!"
            });
            return;
          }
        }

        // 2. Otomatik Cross-Sell (Fallback)
        const currentCategory = data.categories.find(c => c.id === selectedItem.categoryId);
        const currentTitle = currentCategory ? (currentCategory.title || '').toLowerCase() : '';
        const isYemek = currentTitle.includes('kebap') || currentTitle.includes('ızgara') || currentTitle.includes('menü') || currentTitle.includes('dürüm') || currentTitle.includes('ana') || currentTitle.includes('döner');
        
        let validCats = data.categories.filter(c => {
          if (c.id === selectedItem.categoryId) return false;
          const cTitle = (c.title || '').toLowerCase();
          const isCatYemek = cTitle.includes('kebap') || cTitle.includes('ızgara') || cTitle.includes('menü') || cTitle.includes('dürüm') || cTitle.includes('ana') || cTitle.includes('döner');
          const isCatSide = cTitle.includes('ara') || cTitle.includes('başlangıç') || cTitle.includes('meze') || cTitle.includes('içecek') || cTitle.includes('tatlı');
          
          if (isYemek) return isCatSide;
          return isCatYemek;
        });

        validCats = validCats.filter(c => c.items && c.items.some(i => i && i.title && i.price));

        if (validCats.length === 0) {
          validCats = data.categories.filter(c => c.id !== selectedItem.categoryId && c.items && c.items.some(i => i && i.title && i.price));
        }

        if (validCats.length > 0) {
          const randomCat = validCats[Math.floor(Math.random() * validCats.length)];
          const validItems = randomCat.items.filter(i => i && i.title && i.price && !i.isHidden);
          const suggestion = validItems[Math.floor(Math.random() * validItems.length)];
          const phrases = [
            "Bunun yanında şu da çok iyi gider;",
            "Bunun yanında genellikle bu eksiksiz olmaz;",
            "Damak çatlatan uyum için önerimiz:",
            "Bu lezzeti şununla taçlandırın:",
            "Yanında bir de bu olsa harika olmaz mı?",
            "Lezzet şölenini tamamlamak için ideal:",
            "Bunun yanına en çok yakışan lezzet:",
            "Şefin özel tavsiyesi;",
            "Yemeğin keyfini ikiye katlamak için:",
            "Bunu deneyenler genelde bunu da sepete ekliyor:"
          ];
          const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
          setRecommendation({ item: suggestion, phrase: randomPhrase });
        } else {
          setRecommendation(null);
        }
      }
    } else {
      setRecommendation(null);
    }
  }, [isDetailOpen, selectedItem, data]);
  
  useEffect(() => {
    const savedFavs = localStorage.getItem('appFavs');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch(e){}
    }
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };
  
  // Double Confirmation & Tracking Logic
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  
  // Toast Logic
  const [toast, setToast] = useState(null);

  // Correcting the interval approach to access 'data' properly
  useEffect(() => {
    // trackingOrder varsa bildirimleri durdur
    if (!data.categories || data.categories.length === 0 || trackingOrder) return;
    const interval = setInterval(() => {
      const allItems = [...(data.banners || []), ...(data.categories.flatMap(c => c.items))].filter(i => i && i.title && !i.isHidden);
      if (allItems.length > 0) {
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        const randomMsg = toastMessages[Math.floor(Math.random() * toastMessages.length)];
        setToast({
          type: 'cross-sell',
          header: 'Bunu denemiş miydiniz?',
          title: randomItem.title,
          price: randomItem.price,
          image: randomItem.image,
          msg: randomMsg,
          actionText: '+ Sipariş Ver',
          action: () => addToCart(randomItem)
        });
        setTimeout(() => setToast(null), 8000);
      }
    }, 35000);
    return () => clearInterval(interval);
  }, [data, trackingOrder]);

  const [searchQuery, setSearchQuery] = useState('');
  // Checkout Multi-Step Logic
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart Items, 2: Address Form
  const [checkoutError, setCheckoutError] = useState('');
  
  // Customization Modal Logic
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCartIndex, setEditingCartIndex] = useState(null);
  const [tempExcluded, setTempExcluded] = useState([]);
  const getCustomizableIngredients = (item) => {
    if (item?.customizableIngredients && item.customizableIngredients.length > 0) {
      return item.customizableIngredients;
    }
    const title = item?.title;
    if (!title) return [];
    const t = title.toLowerCase();
    if (t.includes('waffle') || t.includes('tatlı şöleni')) return ["Çikolata Sosu", "Beyaz Çikolata", "Çilek", "Muz", "Kivi", "Fındık", "Fıstık", "Hindistan Cevizi"];
    if (t.includes('kumpir') || t.includes('şefin elinden')) return ["Sosis", "Salam", "Amerikan Salatası", "Zeytin", "Mısır", "Kornişon Turşu", "Jalapeno", "Meksika Fasulyesi", "Ketçap", "Mayonez", "Acı Sos"];
    if (t.includes('kumru') || t.includes('gecelerin vazgeçilmezi') || t.includes('efsane')) return ["Sucuk", "Salam", "Sosis", "Kaşar Peyniri", "Domates", "Turşu", "Ketçap", "Mayonez", "Acı Sos"];
    if (t.includes('burger') || t.includes('cheeseburger')) return ["Karamelize Soğan", "Cheddar Peyniri", "Domates", "Marul", "Turşu", "Ketçap", "Mayonez", "Acı Sos"];
    if (t.includes('tost') || t.includes('sabahın güneşi')) return ["Sucuk", "Kaşar Peyniri", "Salam", "Sosis", "Turşu", "Ketçap", "Mayonez", "Acı Sos"];
    if (t.includes('dürüm') || t.includes('porsiyon') || t.includes('ekmek arası')) return ["Soğan", "Domates", "Yeşillik", "Maydanoz", "Turşu", "Ketçap", "Mayonez", "Acı Sos"];
    return ["Ketçap", "Mayonez", "Turşu", "Domates", "Marul", "Soğan"];
  };

  // Admin Login Logic
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Coupon Logic
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  

  
  // Slider Logic
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'nakit'
  });

  const [activeTab, setActiveTab] = useState('kampanyali');
  const navContainerRef = useRef(null);
  
  useEffect(() => {
    fetch('/api/data?t=' + new Date().getTime(), { cache: 'no-store' })
      .then(res => res.json())
      .then(d => {
        if(d.banners) setData(d);
      })
      .catch(e => console.error(e));
  }, []);

  // --- Cart Calculations ---
  const settings = data.settings || {};
  const threshold = settings.freeShippingThreshold ?? 600;
  const courierFee = settings.courierFee ?? 60;
  const isStoreOpen = settings.isStoreOpen ?? true;

  const activeBanners = (data.banners || []).filter(b => !b.isHidden);
  const activeFeatured = (data.featured || []).filter(f => !f.isHidden);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = cartTotal - discountAmount;

  // --- Cart Actions ---
  const toggleFavorite = (item) => {
    let newFavs;
    if (favorites.some(f => f.id === item.id)) {
      newFavs = favorites.filter(f => f.id !== item.id);
      setToast({ type: 'success', header: 'Favorilerden Çıkarıldı', title: item.title, msg: 'Ürün favorilerden çıkarıldı.', image: item.image });
    } else {
      newFavs = [...favorites, item];
      setToast({ type: 'success', header: 'Favorilere Eklendi', title: item.title, msg: 'Ürün favorilere eklendi!', image: item.image });
    }
    setFavorites(newFavs);
    localStorage.setItem('appFavs', JSON.stringify(newFavs));
  };

  const addToCart = (item) => {
    const isMesrubat = item.title?.toLowerCase().includes('meşrubat');
    setCart([...cart, { ...item, cartId: Date.now() + Math.random(), excludedIngredients: [], selectedDrink: isMesrubat ? 'Kola' : null }]);
    
    // Suggest a random item from a different category
    let foundSuggestion = false;
    if (data.categories && data.categories.length > 0) {
      const otherCats = data.categories.filter(c => c.id !== item.categoryId);
      if (otherCats.length > 0) {
        const validCats = otherCats.filter(c => c.items && c.items.some(i => i && i.title && i.price));
        if (validCats.length > 0) {
          const randomCat = validCats[Math.floor(Math.random() * validCats.length)];
          const validItems = randomCat.items.filter(i => i && i.title && i.price && !i.isHidden);
          const suggestion = validItems[Math.floor(Math.random() * validItems.length)];
          setToast({
            type: 'cross-sell',
            header: 'Bunu denemiş miydiniz?',
            title: suggestion.title,
            msg: toastMessages[Math.floor(Math.random() * toastMessages.length)],
            price: suggestion.price,
            image: suggestion.image,
            actionText: '+ Sepete Ekle',
            action: () => addToCart(suggestion)
          });
          foundSuggestion = true;
        }
      }
    }
    
    if (!foundSuggestion) {
      setToast({
        type: 'success',
        header: 'Sepete Eklendi',
        title: item.title,
        msg: 'Ürün başarıyla sepete eklendi.',
        price: item.price,
        image: item.image,
      });
    }
    setTimeout(() => setToast(null), 8000);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  // --- Edit Modal Actions ---
  const openEditModal = (index) => {
    setEditingCartIndex(index);
    setTempExcluded([...cart[index].excludedIngredients]);
    setIsEditOpen(true);
  };

  const toggleIngredient = (ing) => {
    if (tempExcluded.includes(ing)) {
      setTempExcluded(tempExcluded.filter(i => i !== ing));
    } else {
      setTempExcluded([...tempExcluded, ing]);
    }
  };

  const saveEdit = () => {
    if (editingCartIndex !== null) {
      const newCart = [...cart];
      newCart[editingCartIndex].excludedIngredients = tempExcluded;
      setCart(newCart);
    }
    setIsEditOpen(false);
  };

  // --- Coupon Logic ---
  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    
    try {
      const res = await fetch(`/api/coupons?code=${couponCode}&total=${cartTotal}`);
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data.coupon);
      } else {
        setCouponError(data.error || 'Geçersiz kupon');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Hata oluştu');
    }
  };

  const requestPushPermission = async (orderId) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const response = await fetch('/api/notifications/vapid');
        const { publicKey } = await response.json();
        
        // Base64 to Uint8Array converter
        const padding = '='.repeat((4 - publicKey.length % 4) % 4);
        const base64 = (publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray
        });
        
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, orderId })
        });
      }
    } catch (e) {
      console.error('Push notification error:', e);
    }
  };

  // --- Order Submission ---
  const submitOrder = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo,
          items: cart,
          subTotal: cartTotal,
          discount: discountAmount,
          total: finalTotal,
          couponCode: appliedCoupon?.code || null
        })
      });
      const order = await res.json();
      
      // Cleanup cart & show tracking
      setCart([]);
      setIsConfirmOpen(false);
      setIsCartOpen(false);
      setCheckoutStep(1);
      setAppliedCoupon(null);
      setCouponCode('');
      
      setTrackingOrder(order);
      setIsTrackingOpen(true);
      if (typeof window !== 'undefined') localStorage.setItem('trackingOrderId', order.id);
      
      // Ask for push notification permission
      requestPushPermission(order.id);
      
      // Start polling
      pollOrderStatus(order.id);
    } catch (e) {
      alert('Sipariş oluşturulurken hata oluştu');
    }
  };

  const pollOrderStatus = (orderId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders?track=${orderId}`);
        const data = await res.json();
        if (data.id) {
          setTrackingOrder(data);
          if (data.status === 'delivered') {
            clearInterval(interval);
            setTimeout(() => {
              setTrackingOrder(null);
              setIsTrackingOpen(false);
              if (typeof window !== 'undefined') localStorage.removeItem('trackingOrderId');
            }, 35 * 60 * 1000); // 35 dakika sonra butonu ve ekranı gizle
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 10000);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedOrderId = localStorage.getItem('trackingOrderId');
    if (savedOrderId && !trackingOrder) {
      fetch(`/api/orders?track=${savedOrderId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setTrackingOrder(data);
            if (data.status !== 'delivered') {
              pollOrderStatus(savedOrderId);
            } else {
              localStorage.removeItem('trackingOrderId');
            }
          } else {
            localStorage.removeItem('trackingOrderId');
          }
        })
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTrackingFabData = () => {
    if (!trackingOrder) return null;
    switch (trackingOrder.status) {
      case 'received': return { text: "Siparişiniz Alındı 🕒", icon: "fa-clipboard-check", color: "var(--primary-color)" };
      case 'preparing': return { text: "Siparişiniz Hazırlanıyor 👨‍🍳", icon: "fa-fire-burner", color: "#FF9800" };
      case 'courier': return { text: "Kuryeye Veriliyor 🛵", icon: "fa-box", color: "#9C27B0" };
      case 'onway': return { text: "Tatlı Tatlı Geliyor 🚀", icon: "fa-motorcycle", color: "#03A9F4" };
      case 'delivered': return { text: "Afiyet Olsun! ✅", icon: "fa-check-circle", color: "#4CAF50" };
      default: return { text: "Sipariş Takip", icon: "fa-location-crosshairs", color: "var(--primary-color)" };
    }
  };
  const fabData = getTrackingFabData();

  const getStepClass = (stepName) => {
    if (!trackingOrder) return '';
    const statusMap = { received: 1, preparing: 2, courier: 3, onway: 4, delivered: 5 };
    const currentStatus = statusMap[trackingOrder.status] || 1;
    const stepLevel = statusMap[stepName];
    
    if (currentStatus > stepLevel) return 'completed';
    if (currentStatus === stepLevel) return 'active';
    return '';
  };

  // --- Admin Login ---
  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        window.location.href = '/admin';
      } else {
        setLoginError(data.error);
      }
    } catch (e) {
      setLoginError('Hata oluştu');
    }
  };

  // --- Scroll Spy & Banner Slider Auto-play ---
  useEffect(() => {
    // Auto-play slider
    const slider = document.getElementById('mainBannerSlider');
    let slideInterval;
    if (slider && activeBanners.length > 0) {
      slideInterval = setInterval(() => {
        setCurrentSlide(prev => {
          const next = (prev + 1) % activeBanners.length;
          slider.scrollTo({ left: slider.clientWidth * next, behavior: 'smooth' });
          return next;
        });
      }, 10000);
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      let current = '';
      
      data.categories.forEach(cat => {
        const section = document.getElementById(cat.id);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.clientHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = cat.id;
          }
        }
      });

      if (current && current !== activeTab) {
        setActiveTab(current);
        const item = document.getElementById(`nav-${current}`);
        if (item && navContainerRef.current) {
          const itemLeft = item.offsetLeft;
          const itemWidth = item.offsetWidth;
          const containerWidth = navContainerRef.current.offsetWidth;
          const scrollLeft = navContainerRef.current.scrollLeft;

          if (itemLeft < scrollLeft || itemLeft + itemWidth > scrollLeft + containerWidth) {
            navContainerRef.current.scrollTo({
              left: itemLeft - (containerWidth / 2) + (itemWidth / 2),
              behavior: 'smooth'
            });
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [data.categories, activeTab, activeBanners.length]);

  return (
    <>
      {(() => {
        // Renk parlaklık hesaplaması
        let textColor = '#ffffff';
        if (settings?.themeColor) {
          const hex = settings.themeColor.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) || 0;
          const g = parseInt(hex.substr(2, 2), 16) || 0;
          const b = parseInt(hex.substr(4, 2), 16) || 0;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          textColor = brightness > 128 ? '#000000' : '#ffffff';
        }

        // Arka plan teması hesaplaması
        const getSvgBg = (svgStr) => `url("data:image/svg+xml,${encodeURIComponent(svgStr)}")`;
        
        const backgrounds = {
          'dots': getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='2.5' fill='#9ca3af' fill-opacity='0.4'/></svg>`),
          'diagonal': getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M0 40L40 0M-10 10L10 -10M30 50L50 30' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.2'/></svg>`),
          'waves': getSvgBg(`<svg width='40' height='20' xmlns='http://www.w3.org/2000/svg'><path d='M0 10 Q 10 0, 20 10 T 40 10' fill='none' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.25'/></svg>`),
          'checkers': getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' fill='#9ca3af' fill-opacity='0.15'/><rect x='20' y='20' width='20' height='20' fill='#9ca3af' fill-opacity='0.15'/></svg>`),
          'grid': getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0v40M0 20h40' fill='none' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.2'/></svg>`),
          'rings': getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='14' fill='none' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.25'/></svg>`),
          'zigzag': getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M0 40 L40 0 Z' fill='none' stroke='#9ca3af' stroke-opacity='0.2' stroke-width='3'/></svg>`),
          'diamonds': getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='#9ca3af' stroke-opacity='0.2' stroke-width='2'/></svg>`)
        };
        const bgPattern = settings?.bgThemeId && backgrounds[settings.bgThemeId] ? backgrounds[settings.bgThemeId] : 'none';

        if (!settings?.themeColor && bgPattern === 'none' && !settings?.customBgImage) return null;

        return (
          <>
            <style dangerouslySetInnerHTML={{__html: `
              :root, body, body.light-mode {
                ${settings?.themeColor ? `--accent-color: ${settings.themeColor} !important; --accent-text: ${textColor} !important;` : ''}
                ${bgPattern !== 'none' && !settings?.customBgImage ? `--theme-bg-pattern: ${bgPattern} !important;` : ''}
              }
            `}} />
            {settings?.customBgImage && (
              <>
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2, backgroundImage: `url(${settings.customBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}></div>
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, backdropFilter: 'blur(24px) saturate(150%)', backgroundColor: 'var(--bg-alpha-50)', WebkitBackdropFilter: 'blur(24px) saturate(150%)' }}></div>
              </>
            )}
          </>
        );
      })()}
      {/* HEADER */}
      <header className="hero">
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 999, display: 'flex', gap: '8px' }}>
          <button onClick={toggleTheme} style={{ background: 'var(--theme-btn-bg)', border: '1px solid var(--glass-border)', color: 'var(--theme-btn-color)', padding: '8px', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
            <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
          </button>
          <LanguageSelector />
          <button className="admin-profile-btn" onClick={() => setIsLoginOpen(true)}>
            <i className="fa-solid fa-user-shield"></i>
          </button>
        </div>
        <div className="container hero-content" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary-color)', boxShadow: '0 4px 15px var(--glass-input-focus)', position: 'relative' }}>
            <Image src="/ortakoy-logo.png" alt="Ortaköy Kumrucusu Logo" fill style={{ objectFit: 'cover' }} sizes="80px" priority />
          </div>
          <div>
            <h2 className="hero-subtitle" style={{ marginBottom: '4px' }}>Restoran</h2>
            <h1 className="hero-title" style={{ fontSize: '24px' }}>Ortaköy Kumrucusu Osmanbey</h1>
          </div>
        </div>
        <div className="container hero-info" style={{ marginTop: '16px' }}>
          <span className="info-badge rating"><i className="fa-solid fa-star"></i> {data.settings?.ratingValue || '5.0'} ({data.settings?.ratingCount || '60'} Yorum)</span>
          <span className="info-badge"><i className="fa-solid fa-bag-shopping"></i> Gel-al</span>
          <span className="info-badge"><i className="fa-solid fa-motorcycle"></i> Adrese Teslim</span>
        </div>
      </header>

      {/* SEARCH */}
      <section className="search-filter-section">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Ürün ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </section>

      {/* STICKY NAV */}
      <nav className="sticky-nav">
        <div className="nav-container" ref={navContainerRef}>
          {data.categories.map(cat => (
            <a 
              key={cat.id} 
              id={`nav-${cat.id}`}
              href={`#${cat.id}`} 
              className={`nav-item ${activeTab === cat.id ? 'active nav-pulse' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' });
                setActiveTab(cat.id);
              }}
            >
              {cat.navLabel || cat.title}
            </a>
          ))}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="container">
        
        {/* SLIDER BANNERS */}
        {!searchQuery && activeBanners.length > 0 && (
          <>
            <div 
              className="banner-slider" 
              id="mainBannerSlider"
              onScroll={(e) => {
                const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
                if (index !== currentSlide) setCurrentSlide(index);
              }}
            >
              {activeBanners.map((banner, i) => (
                <div key={banner.id} className="banner-card" onClick={() => { setSelectedItem(banner); setIsDetailOpen(true); }} style={{ cursor: 'pointer' }}>
                  <div className="item-badges">
                  {banner.badge && <span className="tag-badge tag-pop" style={{ fontSize: '12px', padding: '6px 12px' }}><i className="fa-solid fa-star"></i> {banner.badge}</span>}
                </div>
                <div className="banner-img-wrapper">
                  <Image src={banner.image} alt={banner.title} fill className="banner-img" style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 800px" priority={i === 0} />
                </div>
                <div className="banner-content">
                  <h2 className="banner-title">{banner.emoji} <span className="shimmer-heading">{banner.title}</span></h2>
                  <p className="banner-desc">{banner.description}</p>
                  <div className="ingredient-icons">
                    {banner.ingredients?.map((ing, idx) => (
                      <div key={idx} className={`ing-icon ing-${ing.type}`} title={ing.title}><i className={ing.icon}></i></div>
                    ))}
                  </div>
                  <div className="banner-footer">
                    <span className="banner-price">{banner.price} ₺</span>
                    <button className="btn-large" onClick={(e) => { e.stopPropagation(); addToCart(banner); }}>Siparişe Ekle</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="slider-dots" id="bannerDots" style={{ marginTop: '16px', marginBottom: '32px' }}>
            {activeBanners.map((_, idx) => (
              <div 
                key={idx} 
                className={`slider-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => {
                  const slider = document.getElementById('mainBannerSlider');
                  if (slider) {
                    slider.scrollTo({ left: slider.clientWidth * idx, behavior: 'smooth' });
                    setCurrentSlide(idx);
                  }
                }}
              ></div>
            ))}
          </div>
        </>
      )}

        {/* FEATURED ITEMS (SÜPER LEZZETLER) */}
        {!searchQuery && activeFeatured.length > 0 && (
          <div className="featured-grid">
            {activeFeatured.map(item => (
              <div key={item.id} className="featured-card" onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} style={{ cursor: 'pointer' }}>
                <div className="featured-img-wrapper">
                  <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 300px" />
                  <span className="tag-badge tag-new"><i className="fa-solid fa-star"></i> SÜPER LEZZET</span>
                </div>
                <div className="featured-content">
                  <h3 className="featured-title">{item.emoji} {item.title}</h3>
                  <p>{item.description}</p>
                  <div className="ingredient-icons">
                    {item.ingredients?.map((ing, idx) => (
                      <div key={idx} className={`ing-icon ing-${ing.type}`} title={ing.title}><i className={ing.icon}></i></div>
                    ))}
                  </div>
                  <div className="featured-footer">
                    <span className="price">{item.price} ₺</span>
                    <button className="btn-add-large" onClick={(e) => { e.stopPropagation(); addToCart(item); }}>Siparişe Ekle</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MENU CATEGORIES */}
        {data.categories.map(cat => {
          const filteredItems = cat.items.filter(item => {
            if (item.isHidden) return false;
            return !searchQuery || 
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
          });
          
          if (filteredItems.length === 0) return null;

          return (
          <section key={cat.id} id={cat.id} className="menu-section">
            <h2 className="section-title">
              {cat.icon && <i className={cat.icon}></i>} {cat.emoji} {cat.title}
            </h2>
            
            {filteredItems.map(item => (
              item.isHighlight ? (
                <div key={item.id} className="card-highlight" onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} style={{ cursor: 'pointer' }}>
                  <div className="item-badges">
                    {item.badge && <span className="tag-badge tag-pop"><i className="fa-solid fa-star"></i> {item.badge}</span>}
                  </div>
                  <div className="card-img-wrapper">
                    <Image src={item.image} alt={item.title} fill className="card-img" style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 300px" />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{item.emoji} {item.title}</h3>
                    <p className="item-ingredients">{item.description}</p>
                    <div className="ingredient-icons">
                      {item.ingredients?.map((ing, idx) => (
                        <div key={idx} className={`ing-icon ing-${ing.type}`} title={ing.title}><i className={ing.icon}></i></div>
                      ))}
                    </div>
                    <div className="card-footer" style={{ marginTop: '12px' }}>
                      <span className="price">{item.price} ₺</span>
                      <button className="btn-add" onClick={(e) => { e.stopPropagation(); addToCart(item); }}><i className="fa-solid fa-plus"></i></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="list-item" onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} style={{ cursor: 'pointer' }}>
                  <div className="list-item-thumb"><Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 300px" /></div>
                  <div className="list-item-content">
                    <div className="list-item-info">
                      <h3>{item.emoji} {item.title}</h3>
                      <p className="item-ingredients">{item.description}</p>
                      <div className="ingredient-icons">
                        {item.ingredients?.map((ing, idx) => (
                          <div key={idx} className={`ing-icon ing-${ing.type}`} title={ing.title}><i className={ing.icon}></i></div>
                        ))}
                      </div>
                    </div>
                    <div className="list-item-bottom">
                      <div className="list-item-price">{item.price} ₺</div>
                      <button className="btn-add-small" onClick={(e) => { e.stopPropagation(); addToCart(item); }}><i className="fa-solid fa-plus"></i></button>
                    </div>
                  </div>
                </div>
              )
            ))}
          </section>
        );
        })}

        {/* WIFI BILGILERI */}
        {data.settings?.wifi?.name && (
          <div style={{ marginTop: '30px', marginBottom: '8px' }}>
            <div className="contact-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)' }}>
                  <i className="fa-solid fa-wifi" style={{ fontSize: '20px' }}></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--text-main)', fontWeight: 700 }}>Ücretsiz WiFi</h3>
                  <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: 'var(--text-muted)' }}>İnternete anında bağlanın</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <div style={{ flex: 1, background: 'var(--bg-color)', padding: '12px', borderRadius: '10px', border: '1px dashed var(--glass-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}><i className="fa-solid fa-network-wired"></i> Ağ Adı</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}>{data.settings.wifi.name}</div>
                </div>
                {data.settings.wifi.password && (
                  <div style={{ flex: 1, background: 'var(--bg-color)', padding: '12px', borderRadius: '10px', border: '1px dashed var(--glass-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}><i className="fa-solid fa-key"></i> Şifre</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}>{data.settings.wifi.password}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SOSYAL AĞLARIMIZ */}
        <div style={{ marginTop: '30px', marginBottom: '24px' }}>
          <h2 className="social-list-title" style={{ fontWeight: 700, fontSize: '20px', marginBottom: '16px' }}>Sosyal Ağlarımız</h2>
          
          <a href={settings?.socialLinks?.googleReview || '#'} target="_blank" rel="noreferrer" className="contact-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: '16px', textAlign: 'center', padding: '24px', background: 'var(--surface-color)', borderRadius: '12px', transition: 'transform 0.2s' }}>
            <h3 className="animate-discount" style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-main)' }}><span className="gift-icon">🎁</span> Google yorumu yap, %10 İndirim Kazan!</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '24px', color: '#fbbc05', marginBottom: '8px' }}>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Yıldıza tıklayarak Google'da bizi puanlayın ve kasada gösterin anında indirimi kapın.</p>
          </a>

          <a href={settings?.socialLinks?.instagram || '#'} className="social-link-item" style={{ borderRadius: '16px 16px 0 0', textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)', padding: '16px', border: '1px solid var(--glass-border)' }}>
            <div className="social-link-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="social-icon instagram" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                <i className="fa-brands fa-instagram" style={{ fontSize: '24px' }}></i>
              </div>
              <div className="social-info">
                <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Instagram</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Süreci yakından takip edin.</p>
              </div>
            </div>
            <div className="social-arrow" style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-arrow-right"></i></div>
          </a>

          <a href={settings?.socialLinks?.whatsapp ? `https://wa.me/${settings.socialLinks.whatsapp.replace(/[^0-9]/g, '')}` : '#'} className="social-link-item" style={{ borderTop: 'none', borderBottom: 'none', textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)', padding: '16px', borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)' }}>
            <div className="social-link-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="social-icon whatsapp" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', background: '#25d366' }}>
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '24px' }}></i>
              </div>
              <div className="social-info">
                <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>WhatsApp</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Hızlı sipariş ve destek için bir mesaj uzağınızdayız.</p>
              </div>
            </div>
            <div className="social-arrow" style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-arrow-right"></i></div>
          </a>

          <a href={settings?.socialLinks?.googleReview || '#'} className="social-link-item" style={{ borderRadius: '0 0 16px 16px', textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)', padding: '16px', border: '1px solid var(--glass-border)' }}>
            <div className="social-link-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="social-icon google" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', background: '#ea4335' }}>
                <i className="fa-brands fa-google" style={{ fontSize: '24px' }}></i>
              </div>
              <div className="social-info">
                <h4 className="animate-discount" style={{ fontSize: '16px', marginBottom: '4px' }}><span className="gift-icon">🎁</span> Google yorumu yap, %10 İndirim Kazan!</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Yorumlarınız bizim için çok önemli.</p>
              </div>
            </div>
            <div className="social-arrow" style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-arrow-right"></i></div>
          </a>
        </div>

        {/* İLETİŞİM */}
        <div className="contact-card" style={{ background: 'var(--surface-color)', color: 'var(--text-main)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <div className="contact-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 700 }}>
            <i className="fa-solid fa-grip" style={{ color: 'var(--text-muted)' }}></i> İletişim
          </div>
          
          <div className="contact-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
            <div className="contact-icon-box" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-alpha-05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-phone"></i>
            </div>
            <div className="contact-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="contact-label" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Telefon</div>
              <a href="tel:05325244906" className="contact-value" style={{ fontSize: '15px', fontWeight: 600, color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='var(--primary-color)'} onMouseOut={(e) => e.target.style.color='inherit'}>0532 524 49 06</a>
            </div>
          </div>

          <div className="contact-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
            <div className="contact-icon-box" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-alpha-05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-mobile-screen"></i>
            </div>
            <div className="contact-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="contact-label" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>WhatsApp</div>
              <a href={"https://wa.me/" + (settings?.socialLinks?.whatsapp?.replace(/[^0-9]/g, '') || "905325244906")} target="_blank" rel="noreferrer" className="contact-value" style={{ fontSize: '15px', fontWeight: 600, color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='#25D366'} onMouseOut={(e) => e.target.style.color='inherit'}>0532 524 49 06</a>
            </div>
          </div>

          <div className="contact-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
            <div className="contact-icon-box" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-alpha-05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-regular fa-envelope"></i>
            </div>
            <div className="contact-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="contact-label" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>E-posta</div>
              <a href="mailto:info@catiocakbasi.com" className="contact-value" style={{ fontSize: '15px', fontWeight: 600, color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='var(--primary-color)'} onMouseOut={(e) => e.target.style.color='inherit'}>info@catiocakbasi.com</a>
            </div>
          </div>

          {/* DELIVERY LOGOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
            {settings?.deliveryLinks?.yemeksepeti && settings.deliveryLinks.yemeksepeti !== '#' ? (
              <a href={settings.deliveryLinks.yemeksepeti} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ textAlign: 'center', color: '#ea004b', fontSize: '24px', fontWeight: 800 }}><i className="fa-solid fa-motorcycle" style={{ marginRight: 8 }}></i> Yemeksepeti</div>
              </a>
            ) : (
              <div style={{ textAlign: 'center', color: '#ea004b', fontSize: '24px', fontWeight: 800 }}><i className="fa-solid fa-motorcycle" style={{ marginRight: 8 }}></i> Yemeksepeti</div>
            )}
            
            <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>
            
            {settings?.deliveryLinks?.migros && settings.deliveryLinks.migros !== '#' ? (
              <a href={settings.deliveryLinks.migros} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ textAlign: 'center', color: '#ff7c00', fontSize: '24px', fontWeight: 800 }}><i className="fa-solid fa-motorcycle" style={{ marginRight: 8 }}></i> Migros Yemek</div>
              </a>
            ) : (
              <div style={{ textAlign: 'center', color: '#ff7c00', fontSize: '24px', fontWeight: 800 }}><i className="fa-solid fa-motorcycle" style={{ marginRight: 8 }}></i> Migros Yemek</div>
            )}
            
            <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>
            
            {settings?.deliveryLinks?.getir && settings.deliveryLinks.getir !== '#' ? (
              <a href={settings.deliveryLinks.getir} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ textAlign: 'center', color: '#5d3ebc', fontSize: '24px', fontWeight: 800 }}><i className="fa-solid fa-motorcycle" style={{ marginRight: 8 }}></i> Getir Yemek</div>
              </a>
            ) : (
              <div style={{ textAlign: 'center', color: '#5d3ebc', fontSize: '24px', fontWeight: 800 }}><i className="fa-solid fa-motorcycle" style={{ marginRight: 8 }}></i> Getir Yemek</div>
            )}
            
            <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>
            
            {settings?.deliveryLinks?.trendyolGo && settings.deliveryLinks.trendyolGo !== '#' ? (
              <a href={settings.deliveryLinks.trendyolGo} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ textAlign: 'center', color: '#F27A1A', fontSize: '24px', fontWeight: 800 }}><i className="fa-solid fa-motorcycle" style={{ marginRight: 8 }}></i> Trendyol Go</div>
              </a>
            ) : (
              <div style={{ textAlign: 'center', color: '#F27A1A', fontSize: '24px', fontWeight: 800 }}><i className="fa-solid fa-motorcycle" style={{ marginRight: 8 }}></i> Trendyol Go</div>
            )}
          </div>

          {/* MAP */}
          <div className="map-container" style={{ marginTop: '24px', borderRadius: '12px', overflow: 'hidden', height: '250px', position: 'relative' }}>
            <iframe 
              src="https://maps.google.com/maps?q=Cumhuriyet,+Tayyareci+Fehmi+Sok.+No:25/1,+34360+Şişli/İstanbul&t=&z=16&ie=UTF8&iwloc=&output=embed" 
              style={{ width: '100%', height: '100%', border: 0, pointerEvents: 'auto' }}
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>

          {/* MAP LINKS */}
          <div className="map-links" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', padding: '0 10px' }}>
            <a href="https://www.google.com/maps/dir/?api=1&destination=Cumhuriyet,+Tayyareci+Fehmi+Sok.+No:25/1,+34360+Şişli/İstanbul" target="_blank" rel="noreferrer" className="map-link-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', transition: 'transform 0.2s' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5L2 8V21L8 18V5Z" fill="#4285F4"/>
                <path d="M16 8L8 5V18L16 21V8Z" fill="#2B60B8"/>
                <path d="M22 5L16 8V21L22 18V5Z" fill="#4285F4"/>
                <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" fill="#0055FF"/>
                <path d="M12 16L9 11H15L12 16Z" fill="#0055FF"/>
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Google Maps</span>
            </a>
            
            <a href="https://yandex.com.tr/harita/?text=Cumhuriyet,+Tayyareci+Fehmi+Sok.+No:25/1,+34360+Şişli/İstanbul" target="_blank" rel="noreferrer" className="map-link-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', transition: 'transform 0.2s' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="10" r="7" fill="#FF0000" />
                <rect x="10.5" y="15" width="3" height="7" rx="1.5" fill="#FF0000" />
                <circle cx="12" cy="10" r="3" fill="#1A1A1A" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Yandex Maps</span>
            </a>
            
            <a href="http://maps.apple.com/?daddr=Cumhuriyet,+Tayyareci+Fehmi+Sok.+No:25/1,+34360+Şişli/İstanbul&dirflg=d" target="_blank" rel="noreferrer" className="map-link-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', transition: 'transform 0.2s' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5 2.5L2 10.5L10 14L13.5 22L21.5 2.5Z" fill="#007AFF"/>
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Apple Maps</span>
            </a>
          </div>
        </div>

        {/* STATIC SECTIONS */}
        <div className="working-hours-card" style={{ marginTop: '30px' }}>
          <div className="wh-header">
            <div className="wh-title"><i className="fa-regular fa-clock"></i> Çalışma Saatleri</div>
            <div className="wh-badge">Şimdi açık</div>
          </div>
          <table className="wh-table">
            <tbody>
              <tr className="active"><td>Pazartesi:</td><td>10:00 - 02:00</td></tr>
              <tr><td>Salı:</td><td>10:00 - 02:00</td></tr>
              <tr><td>Çarşamba:</td><td>10:00 - 02:00</td></tr>
              <tr><td>Perşembe:</td><td>10:00 - 02:00</td></tr>
              <tr><td>Cuma:</td><td>10:00 - 02:00</td></tr>
              <tr><td>Cumartesi:</td><td>10:00 - 02:00</td></tr>
              <tr><td>Pazar:</td><td>11:00 - 02:00</td></tr>
            </tbody>
          </table>
        </div>

      </main>

      <div className="bottom-spacer" style={{ height: '100px' }}></div>

      {/* FLOATING CART BTN REMOVED IN FAVOR OF BOTTOM NAV */}

      {/* FAVORITES OVERLAY */}
      <div className={`checkout-overlay ${isFavoritesOpen ? 'active' : ''}`} onClick={(e) => {if(e.target.className.includes('checkout-overlay')) setIsFavoritesOpen(false)}}>
        <div className="checkout-sheet single-page-compact">
          <div className="sheet-header compact-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <h2 className="sheet-title" style={{ fontSize: '18px', margin: 0, textAlign: 'center' }}>
              <i className="fa-solid fa-heart" style={{ marginRight: '8px', color: '#ef4444' }}></i> Favorilerim
            </h2>
            <i className="fa-solid fa-xmark close-sheet" onClick={() => setIsFavoritesOpen(false)} style={{ cursor: 'pointer', position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px' }}></i>
          </div>
          
          <div className="sheet-body compact-body" style={{ padding: '16px' }}>
            {favorites.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <i className="fa-regular fa-heart" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                <p>Henüz favori ürününüz yok.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {favorites.map(item => (
                  <div key={item.id} className="list-item" onClick={() => { setSelectedItem(item); setIsDetailOpen(true); setIsFavoritesOpen(false); }} style={{ cursor: 'pointer', background: 'var(--surface-color)', borderRadius: '16px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                    <div className="list-item-thumb" style={{ width: '64px', height: '64px', position: 'relative', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                      <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="64px" />
                    </div>
                    <div className="list-item-content" style={{ flex: 1 }}>
                      <div className="list-item-title" style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{item.title}</div>
                      <div className="list-item-price" style={{ fontSize: '14px', color: 'var(--primary-color)', fontWeight: '700' }}>{item.price} ₺</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <i className="fa-solid fa-heart"></i>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(item); }} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MULTI-STEP CHECKOUT OVERLAY */}
      <div className={`checkout-overlay ${isCartOpen ? 'active' : ''}`} onClick={(e) => {if(e.target.className.includes('checkout-overlay')) setIsCartOpen(false)}}>
        <div className="checkout-sheet single-page-compact">
          <div className="sheet-header compact-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {checkoutStep === 2 && (
              <button onClick={() => { setCheckoutStep(1); setCheckoutError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 'bold' }}>
                <i className="fa-solid fa-arrow-left"></i> Geri
              </button>
            )}
            <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-cart-shopping"></i> {checkoutStep === 1 ? 'Sipariş Listem' : 'Teslimat & Ödeme'}
            </h3>
            <i className="fa-solid fa-xmark close-sheet" onClick={() => setIsCartOpen(false)} style={{ cursor: 'pointer', position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px' }}></i>
          </div>
          
          <div className="sheet-body compact-body" style={{ overflowY: 'auto' }}>
            
            {/* STEP 1: CART ITEMS */}
            <div style={{ display: checkoutStep === 1 ? 'block' : 'none' }}>
              <div className="compact-cart-items">
                {cart.map((item, index) => {
                  const t = item.title.toLowerCase();
                  const isMesrubat = t.includes('meşrubat');
                  const isDrink = !isMesrubat && (t.includes('içecek') || t.includes('su') || t.includes('ayran') || t.includes('kola'));
                  const editBtnText = (t.includes('kumpir') || t.includes('şefin elinden')) ? 'Kumpir İçeriği' 
                    : (t.includes('waffle') || t.includes('tatlı şöleni')) ? 'Waffle İçeriği'
                    : (t.includes('kumru') || t.includes('gecelerin') || t.includes('efsane')) ? 'Kumru İçeriği' 
                    : t.includes('burger') ? 'Burger İçeriği' 
                    : (t.includes('tost') || t.includes('sabahın')) ? 'Tost İçeriği' 
                    : isMesrubat ? 'Meşrubatı Seç'
                    : 'Malzemeleri Düzenle';
                  
                  return (
                  <div key={item.cartId} className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--bg-alpha-05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div className="cart-item-info" style={{ fontWeight: 600 }}>
                        <span style={{ color: 'var(--primary-color)', marginRight: '6px' }}>1x</span> 
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {!isDrink && (
                          <button className="btn-edit-item" onClick={() => openEditModal(index)} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--primary-color)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-sliders"></i> {editBtnText}
                          </button>
                        )}
                        <div className="cart-item-price" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                          {item.price} ₺ 
                          <i className="fa-solid fa-xmark remove-item" onClick={() => removeFromCart(item.cartId)} style={{ cursor: 'pointer', marginLeft: '10px', color: 'var(--text-alpha-50)' }}></i>
                        </div>
                      </div>
                    </div>
                    {item.excludedIngredients.length > 0 && (
                      <div className="cart-item-notes" style={{ width: '100%', fontSize: '11px', color: 'var(--text-alpha-40)', fontStyle: 'italic', marginTop: '4px' }}>
                        İstemiyor: {item.excludedIngredients.join(', ')}
                      </div>
                    )}
                    {item.selectedDrink && (
                      <div className="cart-item-notes" style={{ width: '100%', fontSize: '11px', color: 'var(--primary-color)', fontStyle: 'italic', marginTop: '4px' }}>
                        Seçim: {item.selectedDrink}
                      </div>
                    )}
                  </div>
                  );
                })}
                
                {cart.length === 0 && (
                  <div className="cart-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0' }}>
                    <i className="fa-solid fa-basket-shopping" style={{ fontSize: '2.5rem', color: 'var(--bg-alpha-20)', marginBottom: '10px' }}></i>
                    <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-alpha-50)' }}>Sepetiniz boş.</p>
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <>
                  <div className="cart-total-row compact-total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', padding: '16px 0', borderTop: '1px dashed var(--bg-alpha-10)' }}>
                    <strong>Ara Toplam</strong>
                    <strong>{cartTotal} ₺</strong>
                  </div>
                  
                  <div className="delivery-notice compact-notice" style={{ padding: '12px', borderRadius: '8px', background: cartTotal >= threshold ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 193, 7, 0.1)', color: cartTotal >= threshold ? '#4caf50' : 'var(--primary-color)', textAlign: 'center', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}><i className="fa-solid fa-motorcycle"></i> {cartTotal >= threshold ? 'Teslimatınız bizden, afiyet bal şeker olsun! 🛵🎉' : `${threshold - cartTotal} ₺ daha ekleyin, teslimat ücretsiz olsun!`}</span>
                    {cartTotal < threshold && <span style={{ fontSize: '13px', color: '#999', fontStyle: 'italic', fontWeight: '500' }}>Ortalama kurye ücretimiz: {courierFee} ₺'dir.</span>}
                  </div>

                  <button className="btn-checkout-premium compact-btn" onClick={() => {
                    const minAmount = data.settings?.minOrderAmount || 200;
                    if (cartTotal < minAmount) {
                      setShowMinCartAlert(true);
                      return;
                    }
                    setCheckoutStep(2);
                  }} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'var(--primary-color)', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                    Devam Et <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </>
              )}
            </div>

            {/* STEP 2: CHECKOUT FORM & COUPON */}
            <div style={{ display: checkoutStep === 2 ? 'block' : 'none' }}>
              <style dangerouslySetInnerHTML={{ __html: `
                .premium-input {
                  width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--bg-alpha-10); background: var(--bg-alpha-03); color: var(--text-main); font-family: 'Outfit', sans-serif; font-size: 14px; outline: none; transition: all 0.3s;
                }
                .premium-input::placeholder { color: var(--text-muted); }
                .premium-input:focus {
                  border-color: var(--primary-color); background: var(--glass-input-focus); box-shadow: 0 0 0 4px rgba(212,175,55,0.1);
                }
                .premium-payment-btn {
                  flex: 1; padding: 16px; border-radius: 12px; border: 1px solid var(--bg-alpha-10); background: var(--bg-alpha-03); color: var(--text-muted); cursor: pointer; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 12px; font-weight: 600; transition: all 0.3s; text-align: left;
                }
                .premium-payment-btn.active {
                  border-color: var(--primary-color); background: rgba(212,175,55,0.05); color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(212,175,55,0.1);
                }
                .premium-payment-btn i { font-size: 24px; }
              ` }} />
              
              <div className="checkout-form compact-form">
                <div className="form-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input type="text" placeholder="İsim Soyisim *" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="premium-input" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input type="tel" placeholder="Telefon *" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="premium-input" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <input type="text" placeholder="Teslimat Adresi (Mahalle, Sokak, Bina No, Daire) *" required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="premium-input" />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <input type="text" placeholder="Sipariş Notu (Opsiyonel)" value={customerInfo.notes} onChange={e => setCustomerInfo({...customerInfo, notes: e.target.value})} className="premium-input" />
                </div>
              </div>

              <div style={{ marginBottom: '12px', color: 'var(--text-alpha-50)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Ödeme Yöntemi</div>
              <div className="payment-methods compact-payment" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button className={`premium-payment-btn ${customerInfo.paymentMethod === 'nakit' ? 'active' : ''}`} onClick={() => setCustomerInfo({...customerInfo, paymentMethod: 'nakit'})}>
                  <i className="fa-solid fa-money-bill-wave" style={{ color: '#2ecc71', fontSize: '22px' }}></i>
                  <span style={{ fontSize: '15px' }}>Nakit</span>
                </button>
                <button className={`premium-payment-btn ${customerInfo.paymentMethod === 'kredi_karti' ? 'active' : ''}`} onClick={() => setCustomerInfo({...customerInfo, paymentMethod: 'kredi_karti'})}>
                  <i className="fa-solid fa-credit-card" style={{ color: '#3498db', fontSize: '22px' }}></i>
                  <span style={{ fontSize: '15px' }}>Kredi Kartı</span>
                </button>
              </div>

              {/* COUPON SECTION */}
              <div className="coupon-section" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <i className="fa-solid fa-ticket" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)' }}></i>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder="KUPON KODU GİRİN" 
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    style={{ width: '100%', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, paddingLeft: '44px', background: 'var(--bg-alpha-05)', border: '1px solid var(--bg-alpha-10)' }}
                  />
                </div>
                <button className="btn-apply-coupon" onClick={handleApplyCoupon} style={{ padding: '0 24px', borderRadius: '12px', border: '1px solid var(--primary-color)', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.2))', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>
                  Uygula
                </button>
              </div>
              {couponError && <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px', paddingLeft: '4px' }}><i className="fa-solid fa-circle-exclamation"></i> {couponError}</div>}
              {appliedCoupon && (
                <div className="discount-row" style={{ display: 'flex', justifyContent: 'space-between', color: '#2ecc71', marginBottom: '12px', fontWeight: 'bold', background: 'rgba(46, 204, 113, 0.1)', padding: '12px 16px', borderRadius: '8px' }}>
                  <span><i className="fa-solid fa-tag"></i> İndirim Uygulandı ({appliedCoupon.code})</span>
                  <span>-{discountAmount} ₺</span>
                </div>
              )}
              
              <div className="cart-total-row compact-total" style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', borderTop: '1px dashed var(--bg-alpha-10)', paddingTop: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', color: 'var(--text-alpha-70)', fontWeight: 600 }}>Genel Toplam</span>
                <strong style={{ color: 'var(--primary-color)', fontSize: '28px', textShadow: '0 2px 10px rgba(212,175,55,0.3)' }}>{finalTotal} ₺</strong>
              </div>
              
              {checkoutError && (
                <div style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.3)', color: '#ff6b6b', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', animation: 'fadeIn 0.3s ease' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '18px' }}></i>
                  <span>{checkoutError}</span>
                </div>
              )}
              <button 
                className="btn-checkout-premium compact-btn" 
                onClick={() => {
                  setCheckoutError('');
                  if(!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
                    setCheckoutError('Lütfen ad, soyad, telefon ve adres bilgilerinizi eksiksiz doldurun.'); return;
                  }
                  const phoneDigits = customerInfo.phone.replace(/\D/g, '');
                  if(phoneDigits.length < 10) {
                    setCheckoutError('Lütfen en az 10 haneli geçerli bir telefon numarası girin. (Örn: 0501 161 03 99)'); return;
                  }
                  setIsConfirmOpen(true);
                }}
                style={{ width: '100%', padding: '18px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary-color), #f9d423)', color: '#000', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(212,175,55,0.3)', transition: 'all 0.3s' }}
              >
                SİPARİŞİ TAMAMLA <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* EDIT INGREDIENTS MODAL */}
      <div className={`edit-item-overlay ${isEditOpen ? 'active' : ''}`} style={{ opacity: isEditOpen ? 1 : 0, pointerEvents: isEditOpen ? 'auto' : 'none', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.3s ease' }}>
        <div className="edit-item-sheet" style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '350px', border: '1px solid var(--glass-border)' }}>
          <div className="edit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px' }}>
              {cart[editingCartIndex]?.title?.toLowerCase().includes('meşrubat') ? 'Meşrubat Seçimi' : 'Ürün Malzemeleri'}
            </h4>
            <i className="fa-solid fa-xmark close-edit" onClick={() => setIsEditOpen(false)} style={{ cursor: 'pointer', fontSize: '20px', color: 'var(--text-alpha-50)' }}></i>
          </div>
          <div className="edit-body" style={{ marginBottom: '20px' }}>
            {cart[editingCartIndex]?.title?.toLowerCase().includes('meşrubat') ? (
              ['Kola', 'Fanta', 'Sprite', 'Ice Tea Limon', 'Ice Tea Şeftali'].map(drink => (
                <div key={drink} className="ingredient-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bg-alpha-05)' }}>
                  <span className="ingredient-name">{drink}</span>
                  <input 
                    type="radio" 
                    name={`drink-select`}
                    checked={cart[editingCartIndex]?.selectedDrink === drink}
                    onChange={() => {
                      const newCart = [...cart];
                      newCart[editingCartIndex] = { ...newCart[editingCartIndex], selectedDrink: drink };
                      setCart(newCart);
                    }}
                    style={{ accentColor: 'var(--primary-color)', width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
              ))
            ) : (
              getCustomizableIngredients(cart[editingCartIndex]).map(ing => (
                <div key={ing} className="ingredient-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bg-alpha-05)' }}>
                  <span className="ingredient-name">{ing}</span>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                    <input 
                      type="checkbox" 
                      checked={!tempExcluded.includes(ing)} 
                      onChange={() => toggleIngredient(ing)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span className="slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tempExcluded.includes(ing) ? '#ccc' : '#4caf50', borderRadius: '20px', transition: '.4s' }}>
                      <span style={{ position: 'absolute', height: '16px', width: '16px', left: tempExcluded.includes(ing) ? '2px' : '22px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                    </span>
                  </label>
                </div>
              ))
            )}
          </div>
          <div className="edit-footer">
            <button className="btn-checkout-premium" onClick={saveEdit} style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Kaydet</button>
          </div>
        </div>
      </div>

      {/* DOUBLE CONFIRMATION MODAL */}
      <div className={`custom-modal-overlay ${isConfirmOpen ? 'active' : ''}`}>
        <div className="custom-modal-content">
          <h3>Siparişi Onayla</h3>
          <p>Siparişinizi onaylıyor musunuz? Onayladığınız an siparişiniz bize ulaşır ve anında hazırlamaya başlarız. En kısa sürede kapınıza geliyor! Afiyet olsun şimdiden, sizi her zaman bekleriz! 😇</p>
          <div className="modal-actions">
            <button className="btn-modal-secondary" onClick={() => setIsConfirmOpen(false)}>İptal</button>
            <button className="btn-modal-primary" onClick={submitOrder}>Onayla</button>
          </div>
        </div>
      </div>

      {/* ORDER TRACKING MODAL */}
      <div className={`custom-modal-overlay ${isTrackingOpen ? 'active' : ''}`}>
        <div className="custom-modal-content" style={{ maxWidth: 500, padding: 30, maxHeight: '90vh', overflowY: 'auto' }}>
          <h3>Sipariş Takibi</h3>
          <p style={{ marginBottom: 20 }}>Sipariş Numaranız: <strong>{trackingOrder?.id}</strong></p>

          {trackingOrder && trackingOrder.items && (
            <div style={{ background: 'var(--bg-alpha-03)', border: '1px solid var(--bg-alpha-10)', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left', fontSize: 14 }}>
              <div style={{ fontWeight: 700, color: 'var(--primary-color)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-receipt"></i> Sipariş Özeti
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {trackingOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#eee', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: 10 }}>
                      <span style={{ fontWeight: 600 }}>{item.quantity || 1}x</span> {item.title || item.name}
                      {item.selectedDrink && <div style={{ color: '#3498db', fontSize: 12, marginTop: 2 }}><i className="fa-solid fa-bottle-droplet" style={{marginRight: 4}}></i>{item.selectedDrink}</div>}
                      {item.excludedIngredients && item.excludedIngredients.length > 0 && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}><i className="fa-solid fa-ban" style={{marginRight: 4}}></i>Çıkarılan: {item.excludedIngredients.join(', ')}</div>}
                    </div>
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{(item.price * (item.quantity || 1)).toFixed(2)} TL</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--bg-alpha-10)', paddingTop: 12, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Ödeme Yöntemi:</span>
                <span style={{ fontWeight: 600 }}>
                  {trackingOrder.customerInfo?.paymentMethod === 'nakit' ? 'Kapıda Nakit' : 
                   trackingOrder.customerInfo?.paymentMethod === 'kredi_karti' ? 'Kapıda Kredi Kartı' : 
                   trackingOrder.customerInfo?.paymentMethod === 'online' ? 'Online Ödeme' : trackingOrder.customerInfo?.paymentMethod || 'Belirtilmedi'}
                </span>
              </div>
              {trackingOrder.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kupon İndirimi{trackingOrder.couponCode ? ` (${trackingOrder.couponCode})` : ''}:</span>
                  <span style={{ color: '#2ecc71', fontWeight: 600 }}>-{trackingOrder.discount} TL</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Toplam Tutar:</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: 16 }}>{trackingOrder.totalAmount || trackingOrder.total} TL</span>
              </div>
            </div>
          )}
          
          {trackingOrder?.status === 'cancelled' ? (
            <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
              <h4 style={{ color: '#e74c3c', fontSize: 18, marginBottom: 8, fontWeight: 700 }}>Siparişiniz İptal Edildi</h4>
              <p style={{ color: 'var(--text-main)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>Çok özür dileriz ama maalesef siparişiniz iptal oldu.</p>
              {trackingOrder.statusHistory?.find(h => h.status === 'cancelled')?.note && (
                <div style={{ background: 'var(--bg-alpha-06)', padding: 12, borderRadius: 8, textAlign: 'left', borderLeft: '3px solid #e74c3c' }}>
                  <div style={{ color: '#e74c3c', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>İptal Notu:</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>{trackingOrder.statusHistory.find(h => h.status === 'cancelled').note}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="order-tracking-container">
              <div className={`tracking-step ${getStepClass('received')}`}>
                <div className="step-icon"><i className="fa-solid fa-check"></i></div>
                <div className="step-info">
                  <div className="step-title">Siparişiniz Alındı</div>
                  <div className="step-time" style={{ fontSize: 13, lineHeight: 1.4 }}>Lezzetli siparişiniz ışık hızında bizlere ulaştı.</div>
                </div>
              </div>
              <div className={`tracking-step ${getStepClass('preparing')}`}>
                <div className="step-icon">👨‍🍳</div>
                <div className="step-info">
                  <div className="step-title">Hazırlanıyor</div>
                  <div className="step-time" style={{ fontSize: 13, lineHeight: 1.4 }}>Siparişiniz en lezzetli şekilde özel şef ustalarımız tarafından sizler için hazırlanıyorlar.</div>
                </div>
              </div>
              <div className={`tracking-step ${getStepClass('courier')}`}>
                <div className="step-icon">🏍️</div>
                <div className="step-info">
                  <div className="step-title">Kuryeye Teslim Edildi</div>
                  <div className="step-time" style={{ fontSize: 13, lineHeight: 1.4 }}>Kuryelerimiz bu özel paketi sizlere ulaştırmak için hazırda bekliyor.</div>
                </div>
              </div>
              <div className={`tracking-step ${getStepClass('onway')}`}>
                <div className="step-icon"><i className="fa-solid fa-road"></i></div>
                <div className="step-info">
                  <div className="step-title">Yola Çıktı</div>
                  <div className="step-time" style={{ fontSize: 13, lineHeight: 1.4 }}>Siparişiniz size ulaşıp bu eşsiz lezzeti deneyimlemeniz için yola çıktı ve adım adım sizlere yaklaşıyor.</div>
                </div>
              </div>
              <div className={`tracking-step ${getStepClass('delivered')}`}>
                <div className="step-icon">📦</div>
                <div className="step-info">
                  <div className="step-title">Teslim Edildi</div>
                  <div className="step-time" style={{ fontSize: 13, lineHeight: 1.4 }}>Sevgiyle hazırladık, keyifle yemeniz dileğiyle. Afiyet, bal, şeker olsun!</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="modal-actions" style={{ marginTop: 30 }}>
            <button className="btn-modal-primary" onClick={() => {
              setIsTrackingOpen(false);
              if (trackingOrder?.status === 'cancelled') {
                setTrackingOrder(null);
                if (typeof window !== 'undefined') localStorage.removeItem('trackingOrderId');
              }
            }}>Kapat</button>
          </div>
        </div>
      </div>

      {/* ADMIN LOGIN MODAL */}
      <div className={`custom-modal-overlay ${isLoginOpen ? 'active' : ''}`}>
        <div className="custom-modal-content">
          <h3>Admin Girişi</h3>
          <input 
            type="password" 
            className="custom-modal-input" 
            placeholder="Şifre" 
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
          />
          {loginError && <p style={{ color: '#f44336', margin: '-10px 0 15px 0', fontSize: '13px' }}>{loginError}</p>}
          <div className="modal-actions">
            <button className="btn-modal-secondary" onClick={() => setIsLoginOpen(false)}>İptal</button>
            <button className="btn-modal-primary" onClick={handleLogin}>Giriş Yap</button>
          </div>
        </div>
      </div>

      {/* STORE CLOSED OVERLAY */}
      {!isStoreOpen && (
        <div className="store-closed-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', padding: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <i className="fa-solid fa-store-slash" style={{ fontSize: 64, color: 'var(--primary-color)', marginBottom: 20 }}></i>
          <h2 style={{ fontSize: 28, marginBottom: 10 }}>Şu An Kapalıyız</h2>
          <p style={{ color: '#ccc', maxWidth: 450, lineHeight: 1.6, fontSize: '15px' }}>
            Değerli müşterimiz, şu anda sipariş alamıyoruz. Anlayışınız için teşekkür ederiz.
            {settings?.workingHours && <><br/><br/>Çalışma saatlerimiz: <strong>{settings.workingHours}</strong></>}
          </p>
        </div>
      )}

      {/* TRACKING FAB (Floating Action Button) */}
      {trackingOrder && !isTrackingOpen && (
        <div className="tracking-fab" onClick={() => setIsTrackingOpen(true)} style={{ '--fab-color': fabData.color }}>
          <div className="tracking-fab-icon">
            <i className={`fa-solid ${fabData.icon}`}></i>
          </div>
          <div className="tracking-fab-text">
            <span>{fabData.text}</span>
          </div>
        </div>
      )}

      {/* PREMIUM TOAST */}
      <div className={`premium-toast ${toast ? 'show' : ''} ${toast?.type === 'error' ? 'error' : ''}`}>
        {toast && (
          <>
            <i className="fa-solid fa-xmark toast-close" onClick={() => setToast(null)}></i>
            {toast.type === 'error' ? (
              <div className="toast-content" style={{ padding: '20px 24px', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
                 <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 24 }}></i>
                 {toast.msg}
              </div>
            ) : (
              <>
                <div className="toast-header">
                  <i className={`fa-solid ${toast.type === 'cross-sell' ? 'fa-bell' : 'fa-check-circle'}`} style={{ animation: toast.type === 'cross-sell' ? 'ring 2s infinite' : 'none', color: 'var(--primary-color)' }}></i>
                  {toast.header}
                </div>
                
                <div className="toast-body">
                  {toast.image ? (
                    <div className="toast-img">
                      <Image src={toast.image} alt={toast.title} fill style={{ objectFit: 'cover' }} sizes="70px" />
                    </div>
                  ) : (
                    <div className="toast-img-placeholder"><i className="fa-solid fa-utensils"></i></div>
                  )}
                  
                  <div className="toast-content">
                    <div className="toast-item-title">{toast.title}</div>
                    <div className="toast-msg">"{toast.msg}"</div>
                    <div className="toast-footer">
                      {toast.price && <span className="toast-price">{toast.price} ₺</span>}
                      {toast.action && (
                        <button className="btn-toast-add" onClick={(e) => {
                          e.stopPropagation();
                          toast.action();
                          setToast(null);
                        }}>
                          {toast.actionText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* FLOATING BOTTOM NAV */}
      <div className="floating-bottom-nav" style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'var(--glass-bg)', backdropFilter: 'blur(24px) saturate(200%)', WebkitBackdropFilter: 'blur(24px) saturate(200%)', borderRadius: '40px', padding: '12px 24px', display: 'flex', gap: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)' }}>
        <button onClick={() => { setActiveNav('home'); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{ background: activeNav === 'home' ? 'var(--primary-color)' : 'transparent', border: 'none', color: activeNav === 'home' ? '#000' : 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
          <i className="fa-solid fa-house"></i>
        </button>
        <button onClick={() => { setIsWaiterOpen(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
          <i className="fa-solid fa-bell-concierge"></i>
        </button>
        <button onClick={() => { setIsFavoritesOpen(true); }} style={{ background: activeNav === 'favorites' ? 'var(--primary-color)' : 'transparent', border: 'none', color: activeNav === 'favorites' ? '#000' : 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
          <i className="fa-solid fa-heart"></i>
        </button>
        <button onClick={() => { setIsCartOpen(true); }} style={{ position: 'relative', background: activeNav === 'cart' ? 'var(--primary-color)' : 'transparent', border: 'none', color: activeNav === 'cart' ? '#000' : 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
          <i className="fa-solid fa-cart-shopping"></i>
          {cart.length > 0 && <span style={{ position: 'absolute', top: -2, right: -2, background: '#ef4444', color: '#fff', fontSize: '11px', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--bg-color)' }}>{cart.length}</span>}
        </button>
      </div>

      {/* WAITER MODAL - PREMIUM */}
      <div className={`checkout-overlay ${isWaiterOpen ? 'active' : ''}`} onClick={(e) => { if(e.target.className.includes('checkout-overlay')) setIsWaiterOpen(false); }}>
        <div className={`checkout-sheet ${isWaiterOpen ? 'open' : ''}`} style={{ background: 'var(--surface-color)', height: 'auto', maxHeight: '90vh', minHeight: '30vh', borderRadius: '32px 32px 0 0', display: 'flex', flexDirection: 'column', padding: '24px 20px', boxShadow: '0 -20px 40px rgba(0,0,0,0.5)', borderTop: '1px solid var(--glass-border)', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), #f39c12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', boxShadow: '0 4px 15px rgba(243, 156, 18, 0.4)' }}>
                <i className="fa-solid fa-bell-concierge" style={{ fontSize: '18px' }}></i>
              </div>
              Garson Çağır
            </h2>
            <button onClick={() => setIsWaiterOpen(false)} style={{ background: 'var(--bg-alpha-10)', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>&times;</button>
          </div>
          
          <div style={{ flex: 1, animation: isWaiterOpen ? 'fadeInUp 0.5s ease forwards' : 'none', overflowY: 'auto' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px', lineHeight: '1.4' }}>İsteğiniz veya siparişiniz için masanıza hemen bir arkadaşımızı yönlendiriyoruz. Lütfen masa numaranızı tuşlayın.</p>
            
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Masa Numaranız</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={waiterTableNo} 
                  onChange={(e) => setWaiterTableNo(e.target.value)}
                  placeholder="" 
                  readOnly
                  style={{ width: '100%', background: 'var(--bg-alpha-10)', border: '2px solid', borderColor: waiterTableNo ? 'var(--primary-color)' : 'var(--glass-border)', color: 'var(--text-main)', padding: '16px', borderRadius: '16px', fontSize: '28px', fontWeight: '800', outline: 'none', transition: 'all 0.3s ease', textAlign: 'center', letterSpacing: '4px', boxShadow: waiterTableNo ? '0 0 20px rgba(243, 156, 18, 0.15) inset' : 'none' }}
                />
                {!waiterTableNo && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', color: 'var(--text-muted)', opacity: 0.5, fontSize: '14px', letterSpacing: 'normal', fontWeight: '500', width: '100%', textAlign: 'center' }}>Masa Numaranızı Tuşlayınız 👇</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button key={num} onClick={() => setWaiterTableNo(prev => prev + num)} style={{ background: 'var(--bg-alpha-05)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '24px', fontWeight: '700', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>{num}</button>
              ))}
              <button onClick={() => setWaiterTableNo('')} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '22px', fontWeight: '700', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>C</button>
              <button onClick={() => setWaiterTableNo(prev => prev + '0')} style={{ background: 'var(--bg-alpha-05)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '24px', fontWeight: '700', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>0</button>
              <button onClick={() => setWaiterTableNo(prev => prev.slice(0, -1))} style={{ background: 'var(--bg-alpha-10)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '22px', fontWeight: '700', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}><i className="fa-solid fa-delete-left"></i></button>
            </div>
            
            <button 
              onClick={handleCallWaiter}
              disabled={waiterLoading || !waiterTableNo}
              style={{ 
                width: '100%', 
                background: waiterTableNo ? 'linear-gradient(135deg, var(--primary-color), #f39c12)' : 'var(--bg-alpha-05)', 
                color: waiterTableNo ? '#fff' : 'var(--text-muted)', 
                textShadow: waiterTableNo ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                border: waiterTableNo ? '1px solid transparent' : '1px solid var(--glass-border)', 
                padding: '20px', 
                borderRadius: '20px', 
                fontSize: '18px', 
                fontWeight: '800', 
                cursor: waiterLoading || !waiterTableNo ? 'not-allowed' : 'pointer', 
                transition: 'all 0.3s', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '12px',
                boxShadow: waiterTableNo ? '0 10px 20px rgba(243, 156, 18, 0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                transform: waiterLoading ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {waiterLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane" style={{ animation: waiterTableNo && !waiterLoading ? 'bounce 2s infinite' : 'none' }}></i>}
              {waiterLoading ? 'Çağrılıyor...' : 'Garsonu Çağır'}
            </button>
          </div>
        </div>
      </div>

      {/* FUN WAITER SUCCESS POPUP */}
      <div className={`checkout-overlay ${showWaiterSuccess ? 'active' : ''}`} style={{ zIndex: 10005, alignItems: 'center' }}>
        <div style={{ background: 'var(--surface-color)', padding: '40px 32px', borderRadius: '32px', textAlign: 'center', maxWidth: '320px', width: '90%', border: '2px solid var(--primary-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(243,156,18,0.3) inset', transform: showWaiterSuccess ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)', opacity: showWaiterSuccess ? 1 : 0, transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <div style={{ fontSize: '72px', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🏃‍♂️💨</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '12px' }}>Hemen Geliyoruz!</h2>
          <p style={{ color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.6' }}>Garson arkadaşımız depara kalktı, masanıza doğru uçuyor! Lütfen kemerlerinizi bağlayın 🍽️✨</p>
        </div>
      </div>

      {/* PRODUCT DETAILS MODAL (FULL SCREEN SHEET) */}
      <div className={`checkout-overlay ${isDetailOpen ? 'active' : ''}`} onClick={(e) => { if(e.target.className.includes('checkout-overlay')) { setIsDetailOpen(false); setDetailQuantity(1); } }}>
        <div className={`checkout-sheet ${isDetailOpen ? 'open' : ''}`} style={{ background: 'var(--bg-color)', minHeight: '60vh', maxHeight: '95vh', height: 'auto', borderRadius: '32px 32px 0 0', display: 'flex', flexDirection: 'column' }}>
          {selectedItem && (
            <>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 20px 0 20px' }}>
                <button onClick={() => { setIsDetailOpen(false); setDetailQuantity(1); }} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer' }}>
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>Detaylar</div>
                <button onClick={() => toggleFavorite(selectedItem)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: favorites.some(f => f.id === selectedItem.id) ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                  <i className={favorites.some(f => f.id === selectedItem.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                </button>
              </div>

              {/* Huge Image */}
              <div style={{ position: 'relative', width: '90%', height: '180px', margin: '16px auto', borderRadius: '20px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                <Image src={selectedItem.image} alt={selectedItem.title} fill style={{ objectFit: 'cover' }} sizes="400px" />
              </div>

              {/* Content */}
              <div style={{ flex: 1, background: 'var(--surface-color)', borderRadius: '32px 32px 0 0', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 30px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                
                <div style={{ flex: 1, padding: '20px 20px 16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{selectedItem.emoji} {selectedItem.title}</h2>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}><i className="fa-solid fa-location-dot"></i> Ortaköy Kumrucusu, Osmanbey</div>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-color)', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                    <button onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '18px' }}>-</button>
                    <span style={{ fontWeight: '600', width: '20px', textAlign: 'center' }}>{detailQuantity}</span>
                    <button onClick={() => setDetailQuantity(detailQuantity + 1)} style={{ background: 'var(--primary-color)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '14px', fontWeight: '500' }}>
                    <i className="fa-regular fa-face-smile"></i> Lezzetli
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '14px', fontWeight: '500' }}>
                    <i className="fa-regular fa-clock"></i> 10-15 dk
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '14px', fontWeight: '500' }}>
                    <i className="fa-solid fa-star"></i> 5.0 Puan
                  </div>
                </div>

                {/* Description */}
                <div style={{ color: 'var(--text-muted)', lineHeight: '1.4', fontSize: '14px', marginBottom: '16px' }}>
                  {selectedItem.description || "Gerçek Adana usulü acı ve baharat dengesiyle mangalda nar gibi kızarmış, damak çatlatan klasik lezzet."}
                </div>

                {/* Recommendation Section */}
                {recommendation && (
                  <div style={{ marginTop: '0px', padding: '12px 16px', borderRadius: '16px', background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-color)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-lightbulb"></i> {recommendation.phrase}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                        <Image src={recommendation.item.image} alt={recommendation.item.title} fill style={{ objectFit: 'cover' }} sizes="48px" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>{recommendation.item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{recommendation.item.price} ₺</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(recommendation.item); setToast({type: 'success', header: 'Sepete Eklendi', title: recommendation.item.title, msg: 'Öneri sepete eklendi!', image: recommendation.item.image}); }} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>
                )}
                </div>

                {/* Bottom Add to Cart */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--glass-border)', background: 'var(--surface-color)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Toplam Tutar</div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>{selectedItem.price * detailQuantity} ₺</div>
                  </div>
                  <button onClick={() => {
                    for(let i=0; i<detailQuantity; i++) {
                      addToCart(selectedItem);
                    }
                    setIsDetailOpen(false);
                    setDetailQuantity(1);
                  }} style={{ background: 'var(--primary-color)', color: '#000', padding: '12px 24px', borderRadius: '24px', fontSize: '15px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MIN CART ALERT MODAL */}
      <div className={`modal-overlay ${showMinCartAlert ? 'active' : ''}`} onClick={(e) => { if (e.target.className.includes('modal-overlay')) setShowMinCartAlert(false); }} style={{ zIndex: 10002 }}>
        <div className={`modal-content ${showMinCartAlert ? 'open' : ''}`} style={{ maxWidth: '400px', textAlign: 'center', background: 'var(--surface-color)', borderRadius: '24px', padding: '32px 24px', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary-color)', fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <i className="fa-solid fa-basket-shopping"></i>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-main)' }}>Minimum Sepet Tutarı</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.5', marginBottom: '24px' }}>
            Sipariş verebilmek için sepet tutarınız en az <strong style={{ color: 'var(--primary-color)' }}>{data.settings?.minOrderAmount || 200} ₺</strong> olmalıdır.<br/><br/>
            Şu anki tutar: <strong>{cartTotal} ₺</strong>
          </p>
          <button onClick={() => setShowMinCartAlert(false)} className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '600' }}>
            Alışverişe Devam Et
          </button>
        </div>
      </div>

    </>
  );
}

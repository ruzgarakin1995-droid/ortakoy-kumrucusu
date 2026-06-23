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

export default function Home() {
  const [data, setData] = useState({ banners: [], featured: [], categories: [], settings: null });
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
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
      const allItems = [...(data.banners || []), ...(data.categories.flatMap(c => c.items))].filter(i => i && i.title);
      if (allItems.length > 0) {
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        const randomMsg = toastMessages[Math.floor(Math.random() * toastMessages.length)];
        setToast({
          title: randomItem.title,
          price: randomItem.price,
          image: randomItem.image,
          msg: randomMsg,
          originalItem: randomItem
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
    fetch('/api/data')
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

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = cartTotal - discountAmount;

  // --- Cart Actions ---
  const addToCart = (item) => {
    const isMesrubat = item.title?.toLowerCase().includes('meşrubat');
    setCart([...cart, { ...item, cartId: Date.now() + Math.random(), excludedIngredients: [], selectedDrink: isMesrubat ? 'Kola' : null }]);
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
    if (slider && data.banners.length > 0) {
      slideInterval = setInterval(() => {
        setCurrentSlide(prev => {
          const next = (prev + 1) % data.banners.length;
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
  }, [data.categories, activeTab, data.banners.length]);

  return (
    <>
      {/* HEADER */}
      <header className="hero">
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <button className="admin-profile-btn" onClick={() => setIsLoginOpen(true)}>
            <i className="fa-solid fa-user-shield"></i>
          </button>
        </div>
        <div className="container hero-content" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', position: 'relative' }}>
            <Image src="/ortakoy-logo.png" alt="Ortaköy Kumrucusu Logo" fill style={{ objectFit: 'cover' }} sizes="80px" priority />
          </div>
          <div>
            <h2 className="hero-subtitle" style={{ marginBottom: '4px' }}>Premium Fast Food</h2>
            <h1 className="hero-title" style={{ fontSize: '24px' }}>Ortaköy Kumrucusu</h1>
          </div>
        </div>
        <div className="container hero-info" style={{ marginTop: '16px' }}>
          <span className="info-badge rating"><i className="fa-solid fa-star"></i> 5.0 (60 Yorum)</span>
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
        {!searchQuery && data.banners.length > 0 && (
          <>
            <div 
              className="banner-slider" 
              id="mainBannerSlider"
              onScroll={(e) => {
                const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
                if (index !== currentSlide) setCurrentSlide(index);
              }}
            >
              {data.banners.map((banner, i) => (
                <div key={banner.id} className="banner-card">
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
                    <button className="btn-large" onClick={() => addToCart(banner)}>Siparişe Ekle</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="slider-dots" id="bannerDots" style={{ marginTop: '16px', marginBottom: '32px' }}>
            {data.banners.map((_, idx) => (
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
        {!searchQuery && data.featured.length > 0 && (
          <div className="featured-grid">
            {data.featured.map(item => (
              <div key={item.id} className="featured-card">
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
                    <button className="btn-add-large" onClick={() => addToCart(item)}>Siparişe Ekle</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MENU CATEGORIES */}
        {data.categories.map(cat => {
          const filteredItems = cat.items.filter(item => 
            !searchQuery || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          
          if (searchQuery && filteredItems.length === 0) return null;

          return (
          <section key={cat.id} id={cat.id} className="menu-section">
            <h2 className="section-title">
              {cat.icon && <i className={cat.icon}></i>} {cat.emoji} {cat.title}
            </h2>
            
            {filteredItems.map(item => (
              item.isHighlight ? (
                <div key={item.id} className="card-highlight">
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
                      <button className="btn-add" onClick={() => addToCart(item)}><i className="fa-solid fa-plus"></i></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="list-item">
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
                      <button className="btn-add-small" onClick={() => addToCart(item)}><i className="fa-solid fa-plus"></i></button>
                    </div>
                  </div>
                </div>
              )
            ))}
          </section>
        );
        })}

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
              <div className="social-icon instagram" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
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
              <div className="social-icon whatsapp" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#25d366' }}>
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
              <div className="social-icon google" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#ea4335' }}>
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
            <div className="contact-icon-box" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
              <i className="fa-solid fa-phone"></i>
            </div>
            <div className="contact-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="contact-label" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Telefon</div>
              <a href="tel:05442285208" className="contact-value" style={{ fontSize: '15px', fontWeight: 600, color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='var(--primary-color)'} onMouseOut={(e) => e.target.style.color='inherit'}>0544 228 52 08</a>
            </div>
          </div>

          <div className="contact-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
            <div className="contact-icon-box" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
              <i className="fa-solid fa-mobile-screen"></i>
            </div>
            <div className="contact-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="contact-label" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>WhatsApp</div>
              <a href={"https://wa.me/" + (settings?.socialLinks?.whatsapp?.replace(/[^0-9]/g, '') || "905011610399")} target="_blank" rel="noreferrer" className="contact-value" style={{ fontSize: '15px', fontWeight: 600, color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='#25D366'} onMouseOut={(e) => e.target.style.color='inherit'}>0501 161 03 99</a>
            </div>
          </div>

          <div className="contact-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
            <div className="contact-icon-box" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
              <i className="fa-regular fa-envelope"></i>
            </div>
            <div className="contact-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="contact-label" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>E-posta</div>
              <a href="mailto:ortakoykumrucusu.burhaniye@gmail.com" className="contact-value" style={{ fontSize: '15px', fontWeight: 600, color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='var(--primary-color)'} onMouseOut={(e) => e.target.style.color='inherit'}>ortakoykumrucusu.burhaniye@gmail.com</a>
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
          </div>

          {/* MAP */}
          <div className="map-container" style={{ marginTop: '24px', borderRadius: '12px', overflow: 'hidden', height: '250px', position: 'relative' }}>
            <iframe 
              src="https://maps.google.com/maps?q=Öğretmenler,+Muammer+Aksoy+Cd.+No:34,+10700+Burhaniye/Balıkesir&t=&z=16&ie=UTF8&iwloc=&output=embed" 
              style={{ width: '100%', height: '100%', border: 0, pointerEvents: 'auto' }}
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>

          {/* MAP LINKS */}
          <div className="map-links" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', padding: '0 10px' }}>
            <a href="https://www.google.com/maps/dir/?api=1&destination=Öğretmenler,+Muammer+Aksoy+Cd.+No:34,+10700+Burhaniye/Balıkesir" target="_blank" rel="noreferrer" className="map-link-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', transition: 'transform 0.2s' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5L2 8V21L8 18V5Z" fill="#4285F4"/>
                <path d="M16 8L8 5V18L16 21V8Z" fill="#2B60B8"/>
                <path d="M22 5L16 8V21L22 18V5Z" fill="#4285F4"/>
                <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" fill="#0055FF"/>
                <path d="M12 16L9 11H15L12 16Z" fill="#0055FF"/>
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Google Maps</span>
            </a>
            
            <a href="https://yandex.com.tr/harita/?text=Öğretmenler,+Muammer+Aksoy+Cd.+No:34,+10700+Burhaniye/Balıkesir" target="_blank" rel="noreferrer" className="map-link-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', transition: 'transform 0.2s' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="10" r="7" fill="#FF0000" />
                <rect x="10.5" y="15" width="3" height="7" rx="1.5" fill="#FF0000" />
                <circle cx="12" cy="10" r="3" fill="#1A1A1A" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Yandex Maps</span>
            </a>
            
            <a href="http://maps.apple.com/?daddr=Öğretmenler,+Muammer+Aksoy+Cd.+No:34,+10700+Burhaniye/Balıkesir&dirflg=d" target="_blank" rel="noreferrer" className="map-link-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', transition: 'transform 0.2s' }}>
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

      {/* FLOATING CART BTN */}
      {cart.length > 0 && !isCartOpen && (
        <div className="floating-cart-btn visible" onClick={() => setIsCartOpen(true)}>
          <div className="cart-count">{cart.length}</div>
          <div className="cart-text">Siparişi Gör</div>
          <div className="cart-price">• {finalTotal} ₺</div>
        </div>
      )}

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
                  <div key={item.cartId} className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                          <i className="fa-solid fa-xmark remove-item" onClick={() => removeFromCart(item.cartId)} style={{ cursor: 'pointer', marginLeft: '10px', color: 'rgba(255,255,255,0.5)' }}></i>
                        </div>
                      </div>
                    </div>
                    {item.excludedIngredients.length > 0 && (
                      <div className="cart-item-notes" style={{ width: '100%', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginTop: '4px' }}>
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
                    <i className="fa-solid fa-basket-shopping" style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.2)', marginBottom: '10px' }}></i>
                    <p style={{ fontSize: '14px', margin: 0, color: 'rgba(255,255,255,0.5)' }}>Sepetiniz boş.</p>
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <>
                  <div className="cart-total-row compact-total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', padding: '16px 0', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <strong>Ara Toplam</strong>
                    <strong>{cartTotal} ₺</strong>
                  </div>
                  
                  <div className="delivery-notice compact-notice" style={{ padding: '12px', borderRadius: '8px', background: cartTotal >= threshold ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 193, 7, 0.1)', color: cartTotal >= threshold ? '#4caf50' : 'var(--primary-color)', textAlign: 'center', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}><i className="fa-solid fa-motorcycle"></i> {cartTotal >= threshold ? 'Teslimatınız bizden, afiyet bal şeker olsun! 🛵🎉' : `${threshold - cartTotal} ₺ daha ekleyin, teslimat ücretsiz olsun!`}</span>
                    {cartTotal < threshold && <span style={{ fontSize: '13px', color: '#999', fontStyle: 'italic', fontWeight: '500' }}>Ortalama kurye ücretimiz: {courierFee} ₺'dir.</span>}
                  </div>

                  <button className="btn-checkout-premium compact-btn" onClick={() => setCheckoutStep(2)} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'var(--primary-color)', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                    Devam Et <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </>
              )}
            </div>

            {/* STEP 2: CHECKOUT FORM & COUPON */}
            <div style={{ display: checkoutStep === 2 ? 'block' : 'none' }}>
              <style dangerouslySetInnerHTML={{ __html: `
                .premium-input {
                  width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #fff; font-family: 'Outfit', sans-serif; font-size: 14px; outline: none; transition: all 0.3s;
                }
                .premium-input:focus {
                  border-color: var(--primary-color); background: rgba(0,0,0,0.5); box-shadow: 0 0 0 4px rgba(212,175,55,0.1);
                }
                .premium-payment-btn {
                  flex: 1; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #aaa; cursor: pointer; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 12px; font-weight: 600; transition: all 0.3s; text-align: left;
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

              <div style={{ marginBottom: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Ödeme Yöntemi</div>
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
                    style={{ width: '100%', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, paddingLeft: '44px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
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
              
              <div className="cart-total-row compact-total" style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Genel Toplam</span>
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
      <div className={`edit-item-overlay ${isEditOpen ? 'active' : ''}`} style={{ opacity: isEditOpen ? 1 : 0, pointerEvents: isEditOpen ? 'auto' : 'none', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.3s ease' }}>
        <div className="edit-item-sheet" style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '350px', border: '1px solid var(--glass-border)' }}>
          <div className="edit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px' }}>
              {cart[editingCartIndex]?.title?.toLowerCase().includes('meşrubat') ? 'Meşrubat Seçimi' : 'Ürün Malzemeleri'}
            </h4>
            <i className="fa-solid fa-xmark close-edit" onClick={() => setIsEditOpen(false)} style={{ cursor: 'pointer', fontSize: '20px', color: 'rgba(255,255,255,0.5)' }}></i>
          </div>
          <div className="edit-body" style={{ marginBottom: '20px' }}>
            {cart[editingCartIndex]?.title?.toLowerCase().includes('meşrubat') ? (
              ['Kola', 'Fanta', 'Sprite', 'Ice Tea Limon', 'Ice Tea Şeftali'].map(drink => (
                <div key={drink} className="ingredient-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                <div key={ing} className="ingredient-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
        <div className="custom-modal-content" style={{ maxWidth: 500, padding: 30 }}>
          <h3>Sipariş Takibi</h3>
          <p>Sipariş Numaranız: <strong>{trackingOrder?.id}</strong></p>
          
          <div className="order-tracking-container">
            <div className={`tracking-step ${getStepClass('received')}`}>
              <div className="step-icon"><i className="fa-solid fa-check"></i></div>
              <div className="step-info">
                <div className="step-title">Siparişiniz Alındı</div>
                <div className="step-time">Anında</div>
              </div>
            </div>
            <div className={`tracking-step ${getStepClass('preparing')}`}>
              <div className="step-icon">👨‍🍳</div>
              <div className="step-info">
                <div className="step-title">Hazırlanıyor</div>
                <div className="step-time">Ustalarımız hazırlıyor</div>
              </div>
            </div>
            <div className={`tracking-step ${getStepClass('courier')}`}>
              <div className="step-icon">🏍️</div>
              <div className="step-info">
                <div className="step-title">Kuryeye Teslim Edildi</div>
                <div className="step-time">Yola çıkmak üzere</div>
              </div>
            </div>
            <div className={`tracking-step ${getStepClass('onway')}`}>
              <div className="step-icon"><i className="fa-solid fa-road"></i></div>
              <div className="step-info">
                <div className="step-title">Yola Çıktı</div>
                <div className="step-time">Size doğru geliyor</div>
              </div>
            </div>
            <div className={`tracking-step ${getStepClass('delivered')}`}>
              <div className="step-icon">📦</div>
              <div className="step-info">
                <div className="step-title">Teslim Edildi</div>
                <div className="step-time">Afiyet olsun!</div>
              </div>
            </div>
          </div>
          
          <div className="modal-actions" style={{ marginTop: 30 }}>
            <button className="btn-modal-primary" onClick={() => setIsTrackingOpen(false)}>Kapat</button>
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
        <div className="store-closed-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
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
      <div className={`premium-toast ${toast ? 'show' : ''}`}>
        {toast && (
          <>
            <i className="fa-solid fa-xmark toast-close" onClick={() => setToast(null)}></i>
            <div className="toast-header">
              <i className="fa-solid fa-bell" style={{ animation: 'ring 2s infinite', color: 'var(--primary-color)' }}></i>
              Bunu denemiş miydiniz?
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
                  <span className="toast-price">{toast.price} ₺</span>
                  <button className="btn-toast-add" onClick={(e) => {
                    e.stopPropagation();
                    addToCart(toast.originalItem);
                    setToast(null);
                  }}>
                    + Ekle
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </>
  );
}

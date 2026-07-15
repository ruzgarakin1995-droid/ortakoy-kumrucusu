'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// STYLES
// ============================================================
const colors = {
  bg: 'var(--bg-color)',
  bgCard: 'var(--bg-alpha-04)',
  bgCardHover: 'var(--bg-alpha-07)',
  bgSidebar: 'var(--glass-bg)',
  gold: 'var(--primary-color)',
  goldLight: 'var(--accent-color)',
  goldDark: '#b8961f',
  text: 'var(--text-main)',
  textMuted: 'var(--text-muted)',
  textDim: 'var(--text-alpha-50)',
  border: 'var(--glass-border)',
  danger: '#e74c3c',
  dangerDark: '#c0392b',
  success: '#27ae60',
  info: '#3498db',
  warning: '#f39c12',
  purple: '#9b59b6',
};

const statusColors = {
  received: { bg: 'rgba(52,152,219,0.15)', text: '#3498db', label: 'Alındı' },
  preparing: { bg: 'rgba(243,156,18,0.15)', text: '#f39c12', label: 'Hazırlanıyor' },
  courier: { bg: 'rgba(155,89,182,0.15)', text: '#9b59b6', label: 'Kuryeye Teslim' },
  onway: { bg: 'rgba(52,152,219,0.15)', text: '#3498db', label: 'Yola Çıktı' },
  delivered: { bg: 'rgba(39,174,96,0.15)', text: '#27ae60', label: 'Teslim Edildi' },
  cancelled: { bg: 'rgba(231,76,60,0.15)', text: '#e74c3c', label: 'İptal Edildi' },
};

const statusFlow = ['received', 'preparing', 'courier', 'onway', 'delivered'];

// ============================================================
// HELPERS
// ============================================================
function getToken() {
  if (typeof window !== 'undefined') return localStorage.getItem('adminToken');
  return null;
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

async function apiFetch(url, opts = {}) {
  const fetchOpts = { cache: 'no-store', ...opts, headers: { ...authHeaders(), ...(opts.headers || {}) } };
  const res = await fetch(url, fetchOpts);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatPrice(p) {
  return `₺${Number(p).toLocaleString('tr-TR')}`;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    if (newTheme === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  };

  // Data states
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activeReminders, setActiveReminders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [waiterRequests, setWaiterRequests] = useState([]);

  // Order alarm & notifications
  const prevOrderCountRef = useRef(0);
  const prevWaiterCountRef = useRef(0);
  const [adminToast, setAdminToast] = useState(null);
  const [notifPermission, setNotifPermission] = useState('granted');
  const sharedAudioCtxRef = useRef(null);

  // ---- AUTH & INIT AUDIO ----
  useEffect(() => {
    const initAudioOnInteraction = () => {
      if (!sharedAudioCtxRef.current) {
        sharedAudioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (sharedAudioCtxRef.current.state === 'suspended') {
        sharedAudioCtxRef.current.resume();
      }
    };
    window.addEventListener('click', initAudioOnInteraction, { once: true });
    window.addEventListener('touchstart', initAudioOnInteraction, { once: true });

    const token = getToken();
    if (!token) { router.replace('/'); return; }
    fetch('/api/auth', { method: 'GET', headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => setAuthed(true))
      .catch(() => { localStorage.removeItem('adminToken'); router.replace('/'); })
      .finally(() => setLoading(false));

    return () => {
      window.removeEventListener('click', initAudioOnInteraction);
      window.removeEventListener('touchstart', initAudioOnInteraction);
    };
  }, [router]);

  // ---- LOAD DATA ----
  const loadBanners = useCallback(async () => { try { setBanners(await apiFetch('/api/banners')); } catch {} }, []);
  const loadFeatured = useCallback(async () => { try { setFeatured(await apiFetch('/api/featured')); } catch {} }, []);
  const loadMenu = useCallback(async () => { try { setCategories(await apiFetch('/api/menu')); } catch {} }, []);
  const loadCoupons = useCallback(async () => { try { setCoupons(await apiFetch('/api/coupons')); } catch {} }, []);
  const loadSettings = useCallback(async () => { try { setSettings(await apiFetch('/api/settings')); } catch {} }, []);
  const loadExpenses = useCallback(async () => { try { setExpenses(await apiFetch('/api/expenses')); } catch {} }, []);
  const loadReminders = useCallback(async () => { try { const res = await apiFetch('/api/reminders'); setReminders(Array.isArray(res) ? res : []); } catch {} }, []);
  const loadOrders = useCallback(async () => {
    try {
      const data = await apiFetch('/api/orders');
      const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
      setOrderCount(sorted.length);
    } catch {}
  }, []);

  const loadWaiterRequests = useCallback(async () => {
    try {
      const data = await apiFetch('/api/waiter');
      const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setWaiterRequests(sorted);
    } catch {}
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadBanners(); loadFeatured(); loadMenu(); loadCoupons(); loadOrders(); loadSettings(); loadExpenses(); loadReminders(); loadWaiterRequests();
  }, [authed, loadBanners, loadFeatured, loadMenu, loadCoupons, loadOrders, loadSettings, loadExpenses, loadReminders, loadWaiterRequests]);

  // ---- REMINDER CHECKER ----
  useEffect(() => {
    if (!authed || reminders.length === 0) return;
    
    const checkReminders = () => {
      const now = new Date();
      const triggered = [];
      reminders.forEach(r => {
        if (r.isPaid) return;
        const due = new Date(r.dueDate);
        let triggerDate = new Date(due);
        if (r.reminderAdvance === '1h') triggerDate.setHours(due.getHours() - 1);
        else if (r.reminderAdvance === '1d') triggerDate.setDate(due.getDate() - 1);
        else if (r.reminderAdvance === '1w') triggerDate.setDate(due.getDate() - 7);
        else if (r.reminderAdvance === '10d') triggerDate.setDate(due.getDate() - 10);
        else return; // Hiçbiri or invalid
        
        if (now >= triggerDate) {
          // Check frequency
          if (!r.lastRemindedAt) {
            triggered.push(r);
          } else {
            const last = new Date(r.lastRemindedAt);
            if (r.reminderFrequency === 'hourly' && (now - last) >= 60 * 60 * 1000) triggered.push(r);
            else if (r.reminderFrequency === 'daily' && (now - last) >= 24 * 60 * 60 * 1000) triggered.push(r);
          }
        }
      });
      if (triggered.length > 0) setActiveReminders(prev => {
        const newArr = [...prev];
        triggered.forEach(t => { if (!newArr.find(a => a.id === t.id)) newArr.push(t); });
        return newArr;
      });
    };
    
    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [authed, reminders]);

  async function dismissReminder(id) {
    setActiveReminders(prev => prev.filter(r => r.id !== id));
    await apiFetch('/api/reminders', { method: 'PUT', body: JSON.stringify({ id, lastRemindedAt: new Date().toISOString() }) });
    loadReminders();
  }

  // ---- ORDER POLLING & ALARM ----
  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(async () => {
      try {
        const data = await apiFetch('/api/orders');
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
        if (sorted.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
          // New order arrived!
          playAlarm();
          sendNotification(sorted[0]);
        }
        prevOrderCountRef.current = sorted.length;
        setOrderCount(sorted.length);

        // Check waiter requests
        const waiterData = await apiFetch('/api/waiter');
        const pendingWaiters = waiterData.filter(w => w.status === 'pending');
        if (prevWaiterCountRef.current !== undefined && pendingWaiters.length > prevWaiterCountRef.current) {
          // New waiter request
          playWaiterAlarm();
          sendWaiterNotification(waiterData.find(w => w.status === 'pending'));
        }
        prevWaiterCountRef.current = pendingWaiters.length;
        setWaiterRequests(waiterData);

      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [authed]);

  // Initialize prevOrderCount on first load
  useEffect(() => {
    prevOrderCountRef.current = orderCount;
  }, []);

  // ---- PENDING ALARM (Every 2 mins) ----
  const pendingOrdersRef = useRef(0);
  const pendingWaitersRef = useRef(0);

  useEffect(() => {
    pendingOrdersRef.current = orders.filter(o => o.status === 'received').length;
  }, [orders]);

  useEffect(() => {
    pendingWaitersRef.current = waiterRequests.filter(w => w.status === 'pending').length;
  }, [waiterRequests]);

  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(() => {
      if (pendingOrdersRef.current > 0) {
        playAlarm();
        const msg = `Onayınızı bekleyen ${pendingOrdersRef.current} adet sipariş var.`;
        setAdminToast({ title: '⚠️ Bekleyen Siparişler!', body: msg, type: 'order' });
        setTimeout(() => setAdminToast(null), 8000);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Bekleyen Siparişler Var!', { body: msg, icon: '/ortakoy-logo.png' });
        }
      }
      if (pendingWaitersRef.current > 0) {
        setTimeout(() => {
          playWaiterAlarm();
          const msg = `Bekleyen ${pendingWaitersRef.current} garson talebi var!`;
          setAdminToast({ title: '🛎️ Bekleyen Garson Talebi!', body: msg, type: 'waiter' });
          setTimeout(() => setAdminToast(null), 8000);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🛎️ Bekleyen Garson Talebi!', { body: msg, icon: '/ortakoy-logo.png' });
          }
        }, pendingOrdersRef.current > 0 ? 2000 : 0);
      }
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [authed]);

  function playAlarm() {
    try {
      let ctx = sharedAudioCtxRef.current;
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        sharedAudioCtxRef.current = ctx;
      }
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) { console.error('Audio play error:', e); }
  }

  function playWaiterAlarm() {
    try {
      let ctx = sharedAudioCtxRef.current;
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        sharedAudioCtxRef.current = ctx;
      }
      if (ctx.state === 'suspended') ctx.resume();

      const playTone = (freq, time, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + duration);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + duration);
      };
      playTone(659.25, 0, 0.4);   // E5
      playTone(523.25, 0.4, 0.6); // C5
    } catch (e) { console.error('Audio play error:', e); }
  }

  function sendNotification(order) {
    const msg = `Sipariş #${order.id?.slice(-6) || ''} - ${formatPrice(order.totalAmount || 0)}`;
    setAdminToast({ title: '🔔 Yeni Sipariş!', body: msg, type: 'order' });
    setTimeout(() => setAdminToast(null), 8000);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 Yeni Sipariş!', { body: msg, icon: '/ortakoy-logo.png' });
    }
  }

  function sendWaiterNotification(request) {
    if (!request) return;
    const msg = `Masa numarası: ${request.tableNo}`;
    setAdminToast({ title: '🛎️ Yeni Garson Talebi!', body: msg, type: 'waiter' });
    setTimeout(() => setAdminToast(null), 8000);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🛎️ Yeni Garson Talebi!', { body: msg, icon: '/ortakoy-logo.png' });
    }
  }

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, [authed]);

  async function requestNotificationPermission() {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        if (!sharedAudioCtxRef.current) {
          sharedAudioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (sharedAudioCtxRef.current.state === 'suspended') {
          sharedAudioCtxRef.current.resume();
        }
      }
    }
  }

  // ---- LOGOUT ----
  function handleLogout() {
    localStorage.removeItem('adminToken');
    router.replace('/');
  }

  // ---- LOADING / AUTH GATE ----
  if (loading) return <div style={{ background: colors.bg, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: colors.gold, fontSize: 24, fontFamily: 'Outfit' }}>Yükleniyor...</div></div>;
  if (!authed) return null;

  // ---- NOTIFICATION FORCE GATE ----
  if (notifPermission !== 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
    return (
      <div style={{ background: colors.bg, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', fontFamily: "'Outfit', sans-serif" }}>
        <div className="admin-card" style={{ maxWidth: 450, width: '100%', padding: 40, animation: 'fadeIn 0.5s ease', background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 24 }}>
          <i className="fa-solid fa-bell-slash" style={{ fontSize: 56, color: colors.danger, marginBottom: 24 }}></i>
          <h2 style={{ color: colors.text, marginBottom: 16, fontSize: 24, fontWeight: 600 }}>Bildirim İzni Zorunlu</h2>
          <p style={{ color: colors.textMuted, marginBottom: 32, lineHeight: 1.6, fontSize: 16 }}>
            Yeni siparişleri ve garson taleplerini <strong>anında sesli</strong> olarak duyabilmeniz için tarayıcı bildirimlerine izin vermeniz gerekmektedir. Aksi takdirde siparişleri kaçırabilirsiniz.
          </p>
          {notifPermission === 'denied' ? (
            <div style={{ padding: 20, background: 'rgba(239,68,68,0.1)', color: colors.danger, borderRadius: 16, fontSize: 15, textAlign: 'left', border: '1px solid rgba(239,68,68,0.2)' }}>
              <strong style={{ display: 'block', marginBottom: 8 }}><i className="fa-solid fa-triangle-exclamation"></i> Erişim Reddedildi!</strong> 
              Tarayıcınızın adres çubuğundaki <strong>kilit simgesine</strong> (veya sayfa ayarlarına) tıklayarak Bildirimleri <strong>"İzin Ver"</strong> olarak değiştirin ve sayfayı yenileyin.
            </div>
          ) : (
            <button className="admin-btn admin-btn-gold" style={{ width: '100%', padding: '16px 24px', fontSize: 18 }} onClick={requestNotificationPermission}>
              <i className="fa-solid fa-check"></i> Bildirimlere İzin Ver
            </button>
          )}
        </div>
      </div>
    );
  }

  const newOrders = orders.filter(o => o.status === 'received').length;
  const activeOrders = orders.filter(o => o.status === 'preparing' || o.status === 'courier' || o.status === 'onway').length;

  const tabs = [
    { id: 'dashboard', icon: 'fa-solid fa-chart-pie', label: '📊 Dashboard' },
    { id: 'banners', icon: 'fa-solid fa-images', label: '🎠 Slider Bannerlar' },
    { id: 'featured', icon: 'fa-solid fa-star', label: '⭐ Süper Lezzetler' },
    { id: 'menu', icon: 'fa-solid fa-utensils', label: '🍽️ Menü Yönetimi' },
    { id: 'coupons', icon: 'fa-solid fa-ticket', label: '🎟️ Kupon Kodları' },
    { id: 'orders', icon: 'fa-solid fa-box', label: '📦 Siparişler', badge: newOrders, activeBadge: activeOrders },
    { id: 'waiters', icon: 'fa-solid fa-bell-concierge', label: '🛎️ Garson Talepleri', badge: waiterRequests.filter(r => r.status === 'pending').length },
    { id: 'finance', icon: 'fa-solid fa-chart-line', label: '💰 Maliyet & Finans' },
    { id: 'settings', icon: 'fa-solid fa-store', label: '🏪 İşletme Ayarları' },
    { id: 'design', icon: 'fa-solid fa-palette', label: '🎨 Tasarım Yönetimi' },
  ];

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: colors.text, display: 'flex', position: 'relative' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .admin-shimmer { background: linear-gradient(90deg, ${colors.gold} 0%, ${colors.goldLight} 40%, var(--text-main) 50%, ${colors.goldLight} 60%, ${colors.gold} 100%); background-size: 200% 100%; animation: shimmer 3s infinite linear; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .admin-card { background: ${colors.bgCard}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid ${colors.border}; border-radius: 16px; transition: all 0.3s ease; }
        .admin-card:hover { background: ${colors.bgCardHover}; border-color: rgba(212,175,55,0.2); }
        .admin-btn { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14px; transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 8px; }
        .admin-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
        .admin-btn:active { transform: translateY(0); }
        .admin-btn-gold { background: linear-gradient(135deg, ${colors.gold}, ${colors.goldLight}); color: #000; }
        .admin-btn-danger { background: ${colors.danger}; color: var(--text-main); }
        .admin-btn-danger:hover { background: ${colors.dangerDark}; }
        .admin-btn-ghost { background: var(--bg-alpha-06); color: ${colors.text}; border: 1px solid ${colors.border}; }
        .admin-btn-ghost:hover { background: var(--bg-alpha-10); }
        .admin-btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; }
        .admin-input { width: 100%; padding: 12px 16px; background: var(--bg-alpha-06); border: 1px solid ${colors.border}; border-radius: 10px; color: ${colors.text}; font-family: 'Outfit', sans-serif; font-size: 14px; outline: none; transition: border-color 0.25s; box-sizing: border-box; }
        .admin-input:focus { border-color: ${colors.gold}; }
        .admin-input::placeholder { color: ${colors.textDim}; }
        .admin-select { width: 100%; padding: 12px 16px; background: var(--bg-alpha-06); border: 1px solid ${colors.border}; border-radius: 10px; color: ${colors.text}; font-family: 'Outfit', sans-serif; font-size: 14px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; }
        .admin-select option { background: #1a1a1a; color: var(--text-main); }
        .admin-label { display: block; margin-bottom: 6px; font-size: 13px; color: ${colors.textMuted}; font-weight: 500; }
        .admin-pulse { width: 10px; height: 10px; border-radius: 50%; background: ${colors.danger}; animation: pulse 1.5s infinite; display: inline-block; }
        .admin-sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 998; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid ${colors.border}; font-size: 14px; }
        .admin-table th { color: ${colors.textMuted}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .admin-table tr:hover td { background: var(--bg-alpha-02); }
        .admin-textarea { width: 100%; padding: 12px 16px; background: var(--bg-alpha-06); border: 1px solid ${colors.border}; border-radius: 10px; color: ${colors.text}; font-family: 'Outfit', sans-serif; font-size: 14px; outline: none; resize: vertical; min-height: 80px; box-sizing: border-box; }
        .admin-textarea:focus { border-color: ${colors.gold}; }
        .admin-checkbox { width: 18px; height: 18px; accent-color: ${colors.gold}; cursor: pointer; }
        .admin-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
        .status-flow-btn { padding: 6px 12px; border: 1px solid var(--bg-alpha-10); border-radius: 8px; background: var(--bg-alpha-04); color: ${colors.textMuted}; cursor: pointer; font-family: 'Outfit'; font-size: 11px; transition: all 0.2s; }
        .status-flow-btn:hover { background: rgba(255,255,255,0.08); }
        .status-flow-btn.active { border-color: ${colors.gold}; background: rgba(212,175,55,0.15); color: ${colors.gold}; }
        @media (max-width: 768px) {
          .admin-desktop-sidebar { display: none !important; }
          .admin-content { margin-left: 0 !important; }
        }
        @media (min-width: 769px) {
          .admin-mobile-toggle { display: none !important; }
          .admin-sidebar-overlay { display: none !important; }
          .admin-mobile-sidebar { display: none !important; }
        }
      `}</style>

      {/* ===== SIDEBAR (Desktop) ===== */}
      <aside className="admin-desktop-sidebar" style={{ width: 260, position: 'fixed', top: 0, left: 0, bottom: 0, background: colors.bgSidebar, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', zIndex: 100, backdropFilter: 'blur(20px)' }}>
        <SidebarContent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      </aside>

      {/* ===== SIDEBAR (Mobile overlay) ===== */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      {sidebarOpen && (
        <aside className="admin-mobile-sidebar" style={{ width: 280, position: 'fixed', top: 0, left: 0, bottom: 0, background: colors.bgSidebar, zIndex: 999, animation: 'slideIn 0.3s ease', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}>
          <SidebarContent tabs={tabs} activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} handleLogout={handleLogout} />
        </aside>
      )}

      {/* ===== REMINDERS POPUP ===== */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeReminders.map(r => (
          <div key={r.id} style={{ background: '#2c3e50', borderLeft: '4px solid #f39c12', padding: 16, borderRadius: 8, boxShadow: '0 10px 25px var(--glass-input-focus)', width: 320, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 600, color: '#f39c12', marginBottom: 4 }}><i className="fa-solid fa-bell admin-pulse"></i> Ödeme Hatırlatması</div>
              <button onClick={() => dismissReminder(r.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', opacity: 0.5 }}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div style={{ fontSize: 15, marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-alpha-60)', marginBottom: 12 }}>Tutar: {formatPrice(r.amount)} | Son Ödeme: {new Date(r.dueDate).toLocaleDateString('tr-TR')}</div>
            <button onClick={() => { dismissReminder(r.id); setActiveTab('finance'); }} className="admin-btn admin-btn-sm" style={{ background: 'rgba(243, 156, 18, 0.2)', color: '#f39c12', width: '100%', justifyContent: 'center' }}>Finans Sekmesine Git</button>
          </div>
        ))}
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="admin-content" style={{ flex: 1, marginLeft: 260, minHeight: '100vh' }}>
        {/* Pending Orders Warning Banner */}
        {newOrders > 0 && (
          <div style={{ background: 'rgba(231,76,60,0.1)', borderBottom: '1px solid #e74c3c', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#e74c3c', fontWeight: 600 }}>
            <span className="admin-pulse" style={{ width: 10, height: 10 }}></span>
            {newOrders} adet bekleyen yeni siparişiniz var! Lütfen kontrol edin.
          </div>
        )}

        {/* Header */}
        <header style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: colors.text, fontSize: 20, cursor: 'pointer', padding: 8 }}>
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              {tabs.find(t => t.id === activeTab)?.label || 'Admin'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={toggleTheme} style={{ background: 'var(--theme-btn-bg)', border: '1px solid var(--glass-border)', color: 'var(--theme-btn-color)', padding: '6px', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
              <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
            </button>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> Çıkış
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '24px', animation: 'fadeIn 0.35s ease' }} key={activeTab}>
          {activeTab === 'dashboard' && <DashboardTab banners={banners} featured={featured} categories={categories} coupons={coupons} orders={orders} />}
          {activeTab === 'banners' && <BannersTab banners={banners} reload={loadBanners} />}
          {activeTab === 'featured' && <FeaturedTab featured={featured} reload={loadFeatured} />}
          {activeTab === 'menu' && <MenuTab categories={categories} reload={loadMenu} />}
          {activeTab === 'coupons' && <CouponsTab coupons={coupons} reload={loadCoupons} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} reload={loadOrders} />}
          {activeTab === 'waiters' && <WaitersTab requests={waiterRequests} reload={loadWaiterRequests} />}
          {activeTab === 'settings' && <SettingsTab settings={settings} reload={loadSettings} />}
          {activeTab === 'finance' && <FinanceTab expenses={expenses} categories={categories} orders={orders} reloadExpenses={loadExpenses} reloadCategories={loadMenu} reminders={reminders} reloadReminders={loadReminders} />}
          {activeTab === 'design' && <DesignTab settings={settings} reload={loadSettings} />}
        </div>
      </main>
      <PremiumToast />
      <AIChatAssistant reloadAll={() => { loadMenu(); loadSettings(); }} />
    </div>
  );
}

// ============================================================
// PREMIUM TOAST NOTIFICATION
// ============================================================
function PremiumToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer;
    const handleToast = (e) => {
      setToast(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener('premium-toast', handleToast);
    
    // Override global alert for admin page
    const originalAlert = window.alert;
    window.alert = (msg) => {
      const isError = msg.toLowerCase().includes('hata') || msg.toLowerCase().includes('başarısız') || msg.toLowerCase().includes('zorunlu');
      const event = new CustomEvent('premium-toast', { detail: { message: msg, type: isError ? 'error' : 'success' } });
      window.dispatchEvent(event);
    };

    return () => {
      window.removeEventListener('premium-toast', handleToast);
      window.alert = originalAlert;
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
      <div style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: toast.type === 'error' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
        color: '#fff', padding: '16px 20px', borderRadius: 16,
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        animation: 'toastSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        <div style={{ 
          width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
          color: toast.type === 'error' ? '#ef4444' : '#22c55e',
          fontSize: 18
        }}>
          <i className={"fa-solid " + (toast.type === 'error' ? 'fa-triangle-exclamation' : 'fa-check')}></i>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
            {toast.type === 'error' ? 'Hata' : 'Başarılı'}
          </span>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{toast.message}</span>
        </div>
        <button 
          onClick={() => setToast(null)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: 8, padding: 4 }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </>
  );
}

// ============================================================
// SIDEBAR CONTENT
// ============================================================
function SidebarContent({ tabs, activeTab, setActiveTab, handleLogout }) {
  return (
    <>
      <div style={{ padding: '24px 20px', borderBottom: `1px solid ${colors.border}` }}>
        <h2 className="admin-shimmer" style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Ortaköy Kumrucusu</h2>
        <p style={{ fontSize: 12, color: colors.textMuted, margin: '4px 0 0' }}>Yönetim Paneli</p>
      </div>
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: 'none',
            background: activeTab === tab.id ? 'rgba(212,175,55,0.12)' : 'transparent',
            color: activeTab === tab.id ? colors.gold : colors.textMuted,
            cursor: 'pointer', fontFamily: "'Outfit'", fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
            transition: 'all 0.2s', width: '100%', textAlign: 'left', position: 'relative',
          }}>
            <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{tab.label.split(' ')[0]}</span>
            <span>{tab.label.split(' ').slice(1).join(' ')}</span>
            {((tab.badge && tab.badge > 0) || (tab.activeBadge && tab.activeBadge > 0)) && (
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                {tab.badge > 0 && (
                  <>
                    <span className="admin-pulse" />
                    <span style={{ background: colors.danger, color: 'var(--text-main)', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{tab.badge}</span>
                  </>
                )}
                {tab.activeBadge > 0 && (
                  <span style={{ background: '#3498db', color: 'var(--text-main)', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{tab.activeBadge}</span>
                )}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${colors.border}` }}>
        <button className="admin-btn admin-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i> Çıkış Yap
        </button>
      </div>
    </>
  );
}

// ============================================================
// DASHBOARD TAB
// ============================================================
function DashboardTab({ banners, featured, categories, coupons, orders, expenses = [] }) {
  const [timeFilter, setTimeFilter] = useState('daily');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredOrders = orders.filter(o => {
    if (!o.createdAt) return true;
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    
    if (timeFilter === 'daily') {
      return orderDate.toDateString() === now.toDateString();
    }
    if (timeFilter === 'weekly') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= oneWeekAgo;
    }
    if (timeFilter === 'monthly') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orderDate >= oneMonthAgo;
    }
    if (timeFilter === 'custom') {
      if (!customStart && !customEnd) return true;
      let valid = true;
      if (customStart) valid = valid && orderDate >= new Date(customStart);
      if (customEnd) {
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        valid = valid && orderDate <= end;
      }
      return valid;
    }
    return true;
  });

  const filteredExpenses = expenses.filter(e => {
    if (!e.date) return true;
    const expenseDate = new Date(e.date);
    const now = new Date();
    if (timeFilter === 'daily') return expenseDate.toDateString() === now.toDateString();
    if (timeFilter === 'weekly') return expenseDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (timeFilter === 'monthly') return expenseDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (timeFilter === 'custom') {
      if (!customStart && !customEnd) return true;
      let valid = true;
      if (customStart) valid = valid && expenseDate >= new Date(customStart);
      if (customEnd) {
        const end = new Date(customEnd); end.setHours(23, 59, 59, 999); valid = valid && expenseDate <= end;
      }
      return valid;
    }
    return true;
  });

  const costMap = {};
  categories.forEach(c => c.items?.forEach(i => { costMap[i.title || i.name] = Number(i.cost || 0); }));

  let totalProductCost = 0;
  filteredOrders.forEach(o => {
    if (o.status !== 'cancelled' && o.items) {
      o.items.forEach(item => {
        const itemName = item.title || item.name;
        totalProductCost += (costMap[itemName] || 0) * (item.quantity || 1);
      });
    }
  });

  const totalFixedExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalRevenue = filteredOrders.reduce((sum, o) => o.status !== 'cancelled' ? sum + (o.totalAmount || o.total || 0) : sum, 0);
  const netIncome = totalRevenue - totalProductCost - totalFixedExpenses;

  const totalMenuItems = categories.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  const pendingOrders = filteredOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const completedOrders = filteredOrders.filter(o => o.status === 'delivered').length;
  const activeCoupons = coupons.filter(c => c.isActive).length;

  // Calculate top items
  const itemCounts = {};
  filteredOrders.forEach(o => {
    if (o.status !== 'cancelled' && o.items && Array.isArray(o.items)) {
      o.items.forEach(item => {
        const itemName = item.title || item.name || 'Bilinmeyen Ürün';
        itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.quantity || 1);
      });
    }
  });
  const topItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const stats = [
    { icon: 'fa-solid fa-turkish-lira-sign', label: 'Toplam Ciro', value: formatPrice(totalRevenue), color: '#2ecc71' },
    { icon: 'fa-solid fa-chart-line', label: 'Net Gelir', value: formatPrice(netIncome), color: netIncome >= 0 ? '#1abc9c' : '#e74c3c' },
    { icon: 'fa-solid fa-check-circle', label: 'Tamamlanan Sipariş', value: completedOrders, color: '#4CAF50' },
    { icon: 'fa-solid fa-clock', label: 'Bekleyen Sipariş', value: pendingOrders, color: '#e67e22' },
    { icon: 'fa-solid fa-ticket', label: 'Aktif Kupon', value: activeCoupons, color: '#e74c3c' },
  ];

  let emptyText = "Bu tarih aralığında henüz sipariş yok";
  if (timeFilter === 'daily') emptyText = "Bugün henüz sipariş yok";
  if (timeFilter === 'weekly') emptyText = "Bu hafta henüz sipariş yok";
  if (timeFilter === 'monthly') emptyText = "Bu ay henüz sipariş yok";

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24, padding: '16px 20px', background: 'var(--bg-alpha-02)', borderRadius: 16, border: '1px solid var(--bg-alpha-05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
          <i className="fa-solid fa-calendar-days" style={{ color: colors.gold }}></i>
          <span style={{ fontWeight: 600, color: colors.text }}>Tarih Filtresi:</span>
        </div>
        {['daily', 'weekly', 'monthly', 'custom'].map(f => (
          <button 
            key={f} 
            onClick={() => setTimeFilter(f)}
            style={{ 
              padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.3)',
              background: timeFilter === f ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: timeFilter === f ? colors.gold : colors.text, cursor: 'pointer',
              transition: 'all 0.2s', fontSize: 13, fontWeight: 600
            }}>
            {f === 'daily' ? 'Günlük' : f === 'weekly' ? 'Haftalık' : f === 'monthly' ? 'Aylık' : 'Özel Tarih'}
          </button>
        ))}
        {timeFilter === 'custom' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--bg-alpha-10)', color: colors.text, colorScheme: 'dark', fontSize: 13 }} />
            <span style={{ color: colors.textMuted }}>-</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--bg-alpha-10)', color: colors.text, colorScheme: 'dark', fontSize: 13 }} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} className="admin-card" style={{ padding: '20px 24px', animation: `fadeIn 0.4s ease ${i * 0.05}s both` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={s.icon} style={{ color: s.color, fontSize: 18 }}></i>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: colors.text }}>{s.value}</div>
                <div style={{ fontSize: 12, color: colors.textMuted }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders and Top Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div className="admin-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color: colors.gold }}></i> Son Siparişler
          </h3>
          {filteredOrders.length === 0 ? (
            <p style={{ color: colors.textMuted, textAlign: 'center', padding: 40 }}>{emptyText}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Sipariş</th><th>Müşteri</th><th>Tutar</th><th>Durum</th></tr></thead>
                <tbody>
                  {filteredOrders.slice(0, 5).map(o => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>#{o.id?.slice(-6)}</td>
                      <td>{o.customerInfo?.name || o.customerName || '-'}</td>
                      <td style={{ color: colors.gold, fontWeight: 600 }}>{formatPrice(o.total || o.totalAmount || 0)}</td>
                      <td><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-fire" style={{ color: '#e74c3c' }}></i> En Çok Satan Ürünler
          </h3>
          {topItems.length === 0 ? (
            <p style={{ color: colors.textMuted, textAlign: 'center', padding: 40 }}>{emptyText}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-alpha-03)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: idx < 3 ? 'rgba(212,175,55,0.2)' : 'var(--bg-alpha-10)', color: idx < 3 ? colors.gold : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                  </div>
                  <div style={{ background: 'var(--bg-alpha-10)', padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                    {item.count} adet
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FINANCE TAB
// ============================================================
function FinanceTab({ expenses, categories, orders, reloadExpenses, reloadCategories, reminders, reloadReminders }) {
  const [activeSubTab, setActiveSubTab] = useState('summary'); // summary, products, fixed, extra
  const [expenseForm, setExpenseForm] = useState({ id: '', name: '', amount: '' });
  const [reminderForm, setReminderForm] = useState({ id: '', title: '', amount: '', dueDate: '', reminderAdvance: '1d', reminderFrequency: 'daily' });

  // Calculate Net Profit
  const costMap = {};
  categories.forEach(c => c.items?.forEach(i => { costMap[i.title || i.name] = Number(i.cost || 0); }));

  let totalProductCost = 0;
  let totalRevenue = 0;
  orders.forEach(o => {
    if (o.status !== 'cancelled') {
      totalRevenue += (o.totalAmount || o.total || 0);
      if (o.items) {
        o.items.forEach(item => {
          const itemName = item.title || item.name;
          totalProductCost += (costMap[itemName] || 0) * (item.quantity || 1);
        });
      }
    }
  });

  const totalFixedExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netIncome = totalRevenue - totalProductCost - totalFixedExpenses;

  async function saveExpense(e) {
    e.preventDefault();
    if (expenseForm.id) {
      await apiFetch('/api/expenses', { method: 'PUT', body: JSON.stringify(expenseForm) });
    } else {
      await apiFetch('/api/expenses', { method: 'POST', body: JSON.stringify(expenseForm) });
    }
    setExpenseForm({ id: '', name: '', amount: '' });
    reloadExpenses();
  }

  async function deleteExpense(id) {
    if (confirm('Bu gideri silmek istediğinize emin misiniz?')) {
      await apiFetch('/api/expenses', { method: 'DELETE', body: JSON.stringify({ id }) });
      reloadExpenses();
    }
  }

  async function saveReminder(e) {
    e.preventDefault();
    if (reminderForm.id) {
      await apiFetch('/api/reminders', { method: 'PUT', body: JSON.stringify(reminderForm) });
    } else {
      await apiFetch('/api/reminders', { method: 'POST', body: JSON.stringify(reminderForm) });
    }
    setReminderForm({ id: '', title: '', amount: '', dueDate: '', reminderAdvance: '1d', reminderFrequency: 'daily' });
    reloadReminders();
  }

  async function deleteReminder(id) {
    if (confirm('Bu hatırlatıcıyı silmek istediğinize emin misiniz?')) {
      await apiFetch('/api/reminders', { method: 'DELETE', body: JSON.stringify({ id }) });
      reloadReminders();
    }
  }

  async function markReminderPaid(id) {
    await apiFetch('/api/reminders', { method: 'PUT', body: JSON.stringify({ id, isPaid: true }) });
    reloadReminders();
  }

  async function updateProductCost(categoryId, itemId, newCost) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    const itemIndex = category.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    category.items[itemIndex].cost = Number(newCost);
    await apiFetch('/api/menu', { method: 'PUT', body: JSON.stringify(category) });
    reloadCategories();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>💰 Maliyet & Finans Yönetimi</h2>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: `1px solid var(--bg-alpha-10)` }}>
        {[
          { id: 'summary', label: 'Finansal Özet' },
          { id: 'products', label: 'Ürün Maliyetleri' },
          { id: 'fixed', label: 'Sabit ve Diğer Giderler' },
          { id: 'extra', label: 'Ödemeler / Alarmlar' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveSubTab(tab.id)}
            style={{ 
              background: 'transparent', border: 'none', color: activeSubTab === tab.id ? '#D4AF37' : 'var(--text-alpha-50)',
              padding: '12px 16px', fontSize: 15, fontWeight: activeSubTab === tab.id ? 600 : 400, cursor: 'pointer',
              borderBottom: activeSubTab === tab.id ? `2px solid #D4AF37` : '2px solid transparent', marginBottom: -1
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div className="admin-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#2ecc71', marginBottom: 12 }}><i className="fa-solid fa-coins"></i></div>
            <div style={{ fontSize: 14, color: 'var(--text-alpha-50)' }}>Toplam Ciro</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{formatPrice(totalRevenue)}</div>
          </div>
          <div className="admin-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#f39c12', marginBottom: 12 }}><i className="fa-solid fa-receipt"></i></div>
            <div style={{ fontSize: 14, color: 'var(--text-alpha-50)' }}>Toplam Ürün Maliyeti</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{formatPrice(totalProductCost)}</div>
          </div>
          <div className="admin-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#e67e22', marginBottom: 12 }}><i className="fa-solid fa-money-bill-wave"></i></div>
            <div style={{ fontSize: 14, color: 'var(--text-alpha-50)' }}>Toplam Sabit Giderler</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{formatPrice(totalFixedExpenses)}</div>
          </div>
          <div className="admin-card" style={{ padding: 24, textAlign: 'center', border: `2px solid ${netIncome >= 0 ? '#1abc9c' : '#e74c3c'}` }}>
            <div style={{ fontSize: 32, color: netIncome >= 0 ? '#1abc9c' : '#e74c3c', marginBottom: 12 }}><i className="fa-solid fa-chart-line"></i></div>
            <div style={{ fontSize: 14, color: 'var(--text-alpha-50)' }}>Net Gelir</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{formatPrice(netIncome)}</div>
          </div>
        </div>
      )}

      {activeSubTab === 'products' && (
        <div className="admin-card" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>Ürün Birim Maliyetleri</h3>
          <p style={{ fontSize: 14, color: 'var(--text-alpha-50)', marginBottom: 20 }}>Menüdeki ürünlerin birim satış maliyetlerini (malzeme vb.) buradan güncelleyebilirsiniz. Değişiklikler anında kaydedilir.</p>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Ürün Adı</th>
                <th>Satış Fiyatı</th>
                <th style={{ width: 200 }}>Birim Maliyet (₺)</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => c.items?.map(item => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-alpha-50)' }}>{c.title}</td>
                  <td>{item.title || item.name}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>
                    <input 
                      type="number" 
                      className="admin-input" 
                      style={{ padding: '6px 12px', fontSize: 14 }}
                      defaultValue={item.cost || 0}
                      onBlur={e => {
                        if (e.target.value !== String(item.cost || 0)) {
                          updateProductCost(c.id, item.id, e.target.value);
                        }
                      }}
                    />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'fixed' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="admin-card" style={{ padding: 24, flex: 1, minWidth: 300 }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Gider Listesi</h3>
            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-alpha-50)', padding: 20 }}>Henüz gider eklenmemiş.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Gider Adı</th>
                    <th>Tutar (₺)</th>
                    <th style={{ textAlign: 'right' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id}>
                      <td>{e.name}</td>
                      <td>{formatPrice(e.amount)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setExpenseForm(e)} style={{ marginRight: 8 }}><i className="fa-solid fa-pen"></i></button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteExpense(e.id)}><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--bg-alpha-10)' }}>
                    <td style={{ fontWeight: 700, paddingTop: 16 }}>TOPLAM</td>
                    <td style={{ fontWeight: 700, paddingTop: 16 }} colSpan="2">{formatPrice(expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0))}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
          <form className="admin-card" style={{ padding: 24, width: '100%', maxWidth: 350 }} onSubmit={saveExpense}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>{expenseForm.id ? 'Gideri Düzenle' : 'Yeni Gider Ekle'}</h3>
            <label className="admin-label">Gider Adı (Örn: Elektrik, Kira)</label>
            <input type="text" className="admin-input" required value={expenseForm.name} onChange={e => setExpenseForm({...expenseForm, name: e.target.value})} style={{ marginBottom: 16 }} />
            
            <label className="admin-label">Tutar (₺)</label>
            <input type="number" className="admin-input" required value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ marginBottom: 24 }} />
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="admin-btn admin-btn-gold" style={{ flex: 1, justifyContent: 'center' }}>Kaydet</button>
              {expenseForm.id && (
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setExpenseForm({ id: '', name: '', amount: '' })}>İptal</button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeSubTab === 'extra' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="admin-card" style={{ padding: 24, flex: 1, minWidth: 300 }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Yaklaşan Ödemeler</h3>
            {(!reminders || reminders.length === 0) ? (
              <div style={{ textAlign: 'center', color: 'var(--text-alpha-50)', padding: 20 }}>Henüz ödeme/alarm eklenmemiş.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ödeme Adı</th>
                    <th>Son Ödeme Tarihi</th>
                    <th>Tutar (₺)</th>
                    <th>Durum</th>
                    <th style={{ textAlign: 'right' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map(r => (
                    <tr key={r.id}>
                      <td>{r.title}</td>
                      <td>{new Date(r.dueDate).toLocaleString('tr-TR')}</td>
                      <td>{formatPrice(r.amount)}</td>
                      <td>{r.isPaid ? <span style={{ color: '#2ecc71' }}>Ödendi</span> : <span style={{ color: '#e74c3c' }}>Bekliyor</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        {!r.isPaid && <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => markReminderPaid(r.id)} style={{ marginRight: 8, color: '#2ecc71' }} title="Ödendi İşaretle"><i className="fa-solid fa-check"></i></button>}
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setReminderForm(r)} style={{ marginRight: 8 }}><i className="fa-solid fa-pen"></i></button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteReminder(r.id)}><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <form className="admin-card" style={{ padding: 24, width: '100%', maxWidth: 350 }} onSubmit={saveReminder}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>{reminderForm.id ? 'Ödemeyi Düzenle' : 'Yeni Ödeme/Alarm Ekle'}</h3>
            <label className="admin-label">Ödeme Başlığı (Kira, Fatura vb.)</label>
            <input type="text" className="admin-input" required value={reminderForm.title} onChange={e => setReminderForm({...reminderForm, title: e.target.value})} style={{ marginBottom: 16 }} />
            
            <label className="admin-label">Tutar (₺)</label>
            <input type="number" className="admin-input" required value={reminderForm.amount} onChange={e => setReminderForm({...reminderForm, amount: e.target.value})} style={{ marginBottom: 16 }} />
            
            <label className="admin-label">Son Ödeme Tarihi & Saati</label>
            <input type="datetime-local" className="admin-input" required value={reminderForm.dueDate ? reminderForm.dueDate.slice(0,16) : ''} onChange={e => setReminderForm({...reminderForm, dueDate: new Date(e.target.value).toISOString()})} style={{ marginBottom: 16 }} />
            
            <label className="admin-label">Alarm Ne Zaman Çalsın?</label>
            <select className="admin-select" value={reminderForm.reminderAdvance} onChange={e => setReminderForm({...reminderForm, reminderAdvance: e.target.value})} style={{ marginBottom: 16 }}>
              <option value="none">Hatırlatma Yok</option>
              <option value="1h">1 Saat Önce</option>
              <option value="1d">1 Gün Önce</option>
              <option value="1w">1 Hafta Önce</option>
              <option value="10d">10 Gün Önce</option>
            </select>

            <label className="admin-label">Hatırlatma Sıklığı (Alarm Sürecinde)</label>
            <select className="admin-select" value={reminderForm.reminderFrequency} onChange={e => setReminderForm({...reminderForm, reminderFrequency: e.target.value})} style={{ marginBottom: 24 }}>
              <option value="always">Her Sayfa Yenilendiğinde</option>
              <option value="hourly">Her 1 Saatte Bir</option>
              <option value="daily">Günde 1 Kez</option>
            </select>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="admin-btn admin-btn-gold" style={{ flex: 1, justifyContent: 'center' }}>Kaydet</button>
              {reminderForm.id && (
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setReminderForm({ id: '', title: '', amount: '', dueDate: '', reminderAdvance: '1d', reminderFrequency: 'daily' })}>İptal</button>
              )}
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// ============================================================
function StatusBadge({ status }) {
  const s = statusColors[status] || statusColors.received;
  return <span className="admin-badge" style={{ background: s.bg, color: s.text }}>{s.label}</span>;
}

// ============================================================
// INGREDIENT EDITOR (shared)
// ============================================================
function IngredientsEditor({ ingredients, onChange }) {
  const presets = [
    { type: 'tahil', title: 'Tahıl / Gluten', icon: 'fa-solid fa-wheat-awn' },
    { type: 'sut', title: 'Süt Ürünü', icon: 'fa-solid fa-bottle-droplet' },
    { type: 'dana', title: 'Et Ürünleri', icon: 'fa-solid fa-cow' },
  ];

  function toggle(preset) {
    const exists = ingredients.find(i => i.type === preset.type);
    if (exists) onChange(ingredients.filter(i => i.type !== preset.type));
    else onChange([...ingredients, preset]);
  }

  return (
    <div>
      <label className="admin-label">Alerjen Bilgileri</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {presets.map(p => {
          const active = ingredients.some(i => i.type === p.type);
          return (
            <button key={p.type} type="button" onClick={() => toggle(p)} style={{
              padding: '8px 14px', borderRadius: 10, border: `1px solid ${active ? colors.gold : colors.border}`,
              background: active ? 'rgba(212,175,55,0.15)' : 'var(--bg-alpha-04)',
              color: active ? colors.gold : colors.textMuted, cursor: 'pointer', fontFamily: "'Outfit'", fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}>
              <i className={p.icon}></i> {p.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// CUSTOMIZABLE OPTIONS EDITOR (shared)
// ============================================================
function CustomizableOptionsEditor({ options, onChange }) {
  const [newOpt, setNewOpt] = useState('');
  function handleAdd() {
    if (newOpt.trim() && !options.includes(newOpt.trim())) {
      onChange([...options, newOpt.trim()]);
      setNewOpt('');
    }
  }
  return (
    <div>
      <label className="admin-label">Çıkarılabilir / Eklenebilir Malzemeler (Opsiyonel)</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input 
          className="admin-input" 
          placeholder="Örn: Sosis, Ketçap..." 
          value={newOpt} 
          onChange={e => setNewOpt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
        />
        <button type="button" className="admin-btn admin-btn-ghost" onClick={handleAdd}>Ekle</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((opt, idx) => (
          <div key={idx} style={{ padding: '4px 10px', background: 'var(--bg-alpha-05)', borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${colors.border}` }}>
            {opt}
            <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', color: colors.danger }} onClick={() => onChange(options.filter(o => o !== opt))}></i>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>Boş bırakılırsa ürün tipine (Kumpir, Kumru vb.) göre otomatik liste çıkar.</p>
    </div>
  );
}

// ============================================================
// ITEM FORM (shared for banner/featured/menu)
// ============================================================
function ItemForm({ item, onSave, onCancel, showBadge = true, showHighlight = false, allCategories = [], defaultCategoryId = null }) {
  const [form, setForm] = useState({
    title: item?.title || '', emoji: item?.emoji || '', description: item?.description || '',
    price: item?.price || '', image: item?.image || '', badge: item?.badge || '',
    isHighlight: item?.isHighlight || false, ingredients: item?.ingredients || [],
    customizableIngredients: item?.customizableIngredients || [],
    crossSellItemId: item?.crossSellItemId || 'auto',
    categoryId: defaultCategoryId || ''
  });
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: data
      });
      const result = await res.json();
      if (res.ok && result.url) {
        setForm(prev => ({ ...prev, image: result.url }));
      } else {
        alert(result.error || 'Yükleme başarısız');
      }
    } catch (err) {
      alert('Yükleme hatası');
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    if (!form.title || !form.price) return alert('Başlık ve fiyat zorunludur.');
    onSave({ ...form, price: Number(form.price) });
  }

  return (
    <div className="admin-card" style={{ padding: 24, marginBottom: 16, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label className="admin-label">Başlık *</label>
          <input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ürün adı" />
        </div>
        <div>
          <label className="admin-label">Emoji</label>
          <input className="admin-input" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="🍔" />
        </div>
        <div>
          <label className="admin-label">Fiyat (₺) *</label>
          <input className="admin-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="250" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="admin-label">Görsel URL veya Yeni Görsel Yükle</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="admin-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="/images/foto.png" style={{ flex: 1 }} />
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="img-upload-input" />
            <button type="button" onClick={() => document.getElementById('img-upload-input').click()} className="admin-btn admin-btn-ghost" disabled={uploading} style={{ width: 140, justifyContent: 'center', flexShrink: 0 }}>
              {uploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-upload"></i>} 
              {uploading ? 'Yükleniyor...' : 'Dosya Seç'}
            </button>
          </div>
        </div>
        {showBadge && (
          <div>
            <label className="admin-label">Badge</label>
            <input className="admin-input" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="Popüler" />
          </div>
        )}
        {showHighlight && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
            <input type="checkbox" className="admin-checkbox" checked={form.isHighlight} onChange={e => setForm({ ...form, isHighlight: e.target.checked })} />
            <label style={{ fontSize: 14, color: colors.textMuted }}>Öne Çıkar (isHighlight)</label>
          </div>
        )}
        {allCategories && allCategories.length > 0 && defaultCategoryId && (
          <div>
            <label className="admin-label">Kategori *</label>
            <select className="admin-select" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              {allCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>
          </div>
        )}
        {allCategories && allCategories.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="admin-label">Çapraz Satış Önerisi</label>
            <select className="admin-select" value={form.crossSellItemId} onChange={e => setForm({ ...form, crossSellItemId: e.target.value })}>
              <option value="auto">Rastgele / Otomatik</option>
              {allCategories.map(cat => (
                <optgroup key={cat.id} label={cat.title}>
                  {cat.items?.map(it => (
                    <option key={it.id} value={it.id}>{it.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label className="admin-label" style={{ marginBottom: 0 }}>Açıklama</label>
          <button 
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              if (!form.description) return alert('Lütfen önce kısa bir açıklama veya malzeme listesi yazın.');
              try {
                setForm(prev => ({ ...prev, description: '✨ Yapay zeka yazıyor...' }));
                const token = localStorage.getItem('adminToken');
                const res = await fetch('/api/ai/enhance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ text: form.description, ingredients: form.ingredients })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Bilinmeyen bir hata oluştu');
                setForm(prev => ({ ...prev, description: data.result }));
              } catch (err) {
                alert('Yapay zeka hatası: ' + err.message);
                setForm(prev => ({ ...prev, description: form.description })); 
              }
            }} 
            className="admin-btn admin-btn-sm" 
            style={{ background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)', color: '#fff', border: 'none', gap: 6 }}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI ile Düzenle
          </button>
        </div>
        <textarea className="admin-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ürün açıklaması..." />
      </div>
      <div style={{ marginTop: 16 }}>
        <IngredientsEditor ingredients={form.ingredients} onChange={ing => setForm({ ...form, ingredients: ing })} />
      </div>
      <div style={{ marginTop: 16 }}>
        <CustomizableOptionsEditor options={form.customizableIngredients} onChange={opts => setForm({ ...form, customizableIngredients: opts })} />
      </div>
      {form.image && (
        <div style={{ marginTop: 16 }}>
          <label className="admin-label">Önizleme</label>
          <img src={form.image} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, border: `1px solid ${colors.border}` }} onError={e => { e.target.style.display = 'none'; }} />
        </div>
      )}
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button className="admin-btn admin-btn-gold" onClick={handleSave}>
          <i className="fa-solid fa-check"></i> Kaydet
        </button>
        <button className="admin-btn admin-btn-ghost" onClick={onCancel}>
          <i className="fa-solid fa-xmark"></i> İptal
        </button>
      </div>
    </div>
  );
}

// ============================================================
// BANNERS TAB
// ============================================================
function BannersTab({ banners, reload }) {
  const [editing, setEditing] = useState(null); // null | 'new' | banner object
  const [deleting, setDeleting] = useState(null);

  async function handleSave(formData) {
    try {
      if (editing === 'new') {
        const newBanner = { id: generateId('banner'), ...formData };
        await apiFetch('/api/banners', { method: 'POST', body: JSON.stringify(newBanner) });
      } else {
        const updated = banners.map(b => b.id === editing.id ? { ...b, ...formData } : b);
        await apiFetch('/api/banners', { method: 'PUT', body: JSON.stringify(updated) });
      }
      setEditing(null);
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  async function handleToggleVisibility(bannerId, newIsHidden) {
    try {
      const updated = banners.map(b => b.id === bannerId ? { ...b, isHidden: newIsHidden } : b);
      await apiFetch('/api/banners', { method: 'PUT', body: JSON.stringify(updated) });
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  async function handleDelete(id) {
    try {
      const updated = banners.filter(b => b.id !== id);
      await apiFetch('/api/banners', { method: 'PUT', body: JSON.stringify(updated) });
      setDeleting(null);
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, margin: 0, color: colors.gold }}>Slider (Vitrin)</h2>
        <button className="admin-btn admin-btn-gold" onClick={() => setEditing('new')}>
          <i className="fa-solid fa-plus"></i> Yeni Ekle
        </button>
      </div>

      {editing === 'new' && (
        <ItemForm item={null} onSave={handleSave} onCancel={() => setEditing(null)} showHighlight={false} />
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {banners.map((b, i) => (
          editing?.id === b.id ? (
            <ItemForm key={b.id} item={editing} onSave={handleSave} onCancel={() => setEditing(null)} showHighlight={false} />
          ) : (
          <div key={b.id} className="admin-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center', animation: `fadeIn 0.3s ease ${i * 0.05}s both`, flexWrap: 'wrap', opacity: b.isHidden ? 0.5 : 1 }}>
            {b.image && <img src={b.image} alt={b.title} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, border: `1px solid ${colors.border}`, flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {b.emoji && <span>{b.emoji}</span>}
                <span className="admin-shimmer" style={{ fontWeight: 700, fontSize: 16 }}>{b.title}</span>
                {b.badge && <span className="admin-badge" style={{ background: 'rgba(212,175,55,0.15)', color: colors.gold }}>{b.badge}</span>}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: colors.textMuted, lineHeight: 1.4 }}>{b.description?.slice(0, 100)}...</p>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.gold, marginTop: 4 }}>{formatPrice(b.price)}</div>
            </div>
            <div className="admin-item-actions">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: 44, height: 24 }} title={b.isHidden ? "Satışa Aç" : "Satışa Kapat"}>
                  <input type="checkbox" checked={!b.isHidden} onChange={(e) => handleToggleVisibility(b.id, !e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: b.isHidden ? '#ef4444' : '#22c55e', borderRadius: 24, transition: '.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}></span>
                  <span style={{ position: 'absolute', height: 18, width: 18, left: b.isHidden ? 3 : 23, bottom: 3, backgroundColor: 'white', borderRadius: '50%', transition: '.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}></span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setEditing(b)}>
                  <i className="fa-solid fa-pen"></i> Düzenle
                </button>
                {deleting === b.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(b.id)}>Evet</button>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDeleting(null)}>Hayır</button>
                  </div>
                ) : (
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDeleting(b.id)} style={{ color: colors.danger }}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
          )
        ))}
      </div>
    </div>
  );
}

// ============================================================
// FEATURED TAB
// ============================================================
function FeaturedTab({ featured, reload }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function handleSave(formData) {
    try {
      if (editing === 'new') {
        const newItem = { id: generateId('featured'), ...formData };
        await apiFetch('/api/featured', { method: 'POST', body: JSON.stringify(newItem) });
      } else {
        const updated = featured.map(f => f.id === editing.id ? { ...f, ...formData } : f);
        await apiFetch('/api/featured', { method: 'PUT', body: JSON.stringify(updated) });
      }
      setEditing(null);
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  async function handleToggleVisibility(featuredId, newIsHidden) {
    try {
      const updated = featured.map(f => f.id === featuredId ? { ...f, isHidden: newIsHidden } : f);
      await apiFetch('/api/featured', { method: 'PUT', body: JSON.stringify(updated) });
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  async function handleDelete(id) {
    try {
      const updated = featured.filter(f => f.id !== id);
      await apiFetch('/api/featured', { method: 'PUT', body: JSON.stringify(updated) });
      setDeleting(null);
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, margin: 0, color: colors.gold }}>Süper Lezzetler</h2>
        <button className="admin-btn admin-btn-gold" onClick={() => setEditing('new')}>
          <i className="fa-solid fa-plus"></i> Yeni Ekle
        </button>
      </div>

      {editing === 'new' && (
        <ItemForm item={null} onSave={handleSave} onCancel={() => setEditing(null)} showHighlight={false} />
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {featured.map((f, i) => (
          editing?.id === f.id ? (
            <ItemForm key={f.id} item={editing} onSave={handleSave} onCancel={() => setEditing(null)} showHighlight={false} />
          ) : (
          <div key={f.id} className="admin-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center', animation: `fadeIn 0.3s ease ${i * 0.05}s both`, flexWrap: 'wrap', opacity: f.isHidden ? 0.5 : 1 }}>
            {f.image && <img src={f.image} alt={f.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, border: `1px solid ${colors.border}`, flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {f.emoji && <span>{f.emoji}</span>}
                <span style={{ fontWeight: 700, fontSize: 16 }}>{f.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: colors.textMuted, lineHeight: 1.4 }}>{f.description?.slice(0, 100)}...</p>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.gold, marginTop: 4 }}>{formatPrice(f.price)}</div>
            </div>
            <div className="admin-item-actions">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: 44, height: 24 }} title={f.isHidden ? "Satışa Aç" : "Satışa Kapat"}>
                  <input type="checkbox" checked={!f.isHidden} onChange={(e) => handleToggleVisibility(f.id, !e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: f.isHidden ? '#ef4444' : '#22c55e', borderRadius: 24, transition: '.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}></span>
                  <span style={{ position: 'absolute', height: 18, width: 18, left: f.isHidden ? 3 : 23, bottom: 3, backgroundColor: 'white', borderRadius: '50%', transition: '.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}></span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setEditing(f)}>
                  <i className="fa-solid fa-pen"></i> Düzenle
                </button>
                {deleting === f.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(f.id)}>Evet</button>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDeleting(null)}>Hayır</button>
                  </div>
                ) : (
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDeleting(f.id)} style={{ color: colors.danger }}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
          )
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MENU TAB
// ============================================================
function MenuTab({ categories, reload }) {
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id || '');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.id === selectedCat)) {
      setSelectedCat(categories[0].id);
    }
  }, [categories, selectedCat]);

  const category = categories.find(c => c.id === selectedCat);
  const items = category?.items || [];

  async function handleSave(formData) {
    const targetCatId = formData.categoryId || selectedCat;
    try {
      let updatedCats = categories.map(c => ({ ...c, items: [...c.items] }));
      
      if (editing === 'new') {
         updatedCats = updatedCats.map(c => {
           if (c.id === targetCatId) return { ...c, items: [...c.items, { id: generateId('item'), ...formData }] };
           return c;
         });
      } else {
         const originalCatId = selectedCat;
         if (originalCatId !== targetCatId) {
            updatedCats = updatedCats.map(c => {
               if (c.id === originalCatId) return { ...c, items: c.items.filter(it => it.id !== editing.id) };
               if (c.id === targetCatId) return { ...c, items: [...c.items, { ...editing, ...formData }] };
               return c;
            });
         } else {
            updatedCats = updatedCats.map(c => {
               if (c.id === originalCatId) return { ...c, items: c.items.map(it => it.id === editing.id ? { ...it, ...formData } : it) };
               return c;
            });
         }
      }
      setSelectedCat(targetCatId);
      await apiFetch('/api/menu', { method: 'PUT', body: JSON.stringify(updatedCats) });
      setEditing(null);
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  async function handleAddCategory() {
    if (!newCatTitle) return alert("Kategori adı zorunludur.");
    const newCat = {
      id: generateId('cat'),
      title: newCatTitle,
      emoji: newCatEmoji || '🍽️',
      items: []
    };
    try {
      const updatedCats = [...categories, newCat];
      await apiFetch('/api/menu', { method: 'PUT', body: JSON.stringify(updatedCats) });
      setNewCatTitle('');
      setNewCatEmoji('');
      setIsAddingCat(false);
      setSelectedCat(newCat.id);
      reload();
    } catch(e) { alert('Hata: ' + e.message); }
  }

  async function handleDelete(itemId) {
    try {
      const updatedCats = categories.map(c => {
        if (c.id !== selectedCat) return c;
        return { ...c, items: c.items.filter(it => it.id !== itemId) };
      });
      await apiFetch('/api/menu', { method: 'PUT', body: JSON.stringify(updatedCats) });
      setDeleting(null);
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  async function handleToggleVisibility(itemId, newIsHidden) {
    try {
      const updatedCats = categories.map(c => {
        if (c.id !== selectedCat) return c;
        return { ...c, items: c.items.map(it => it.id === itemId ? { ...it, isHidden: newIsHidden } : it) };
      });
      await apiFetch('/api/menu', { method: 'PUT', body: JSON.stringify(updatedCats) });
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  return (
    <div>
      {/* Category selector */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label className="admin-label">Kategori Seçin</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="admin-select" value={selectedCat} onChange={e => { setSelectedCat(e.target.value); setEditing(null); }}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.title} ({c.items?.length || 0} ürün)</option>)}
            </select>
            <button className="admin-btn admin-btn-ghost" onClick={() => setIsAddingCat(true)} title="Yeni Kategori Ekle"><i className="fa-solid fa-folder-plus"></i></button>
          </div>
        </div>
        <button className="admin-btn admin-btn-gold" onClick={() => setEditing('new')} style={{ marginTop: 20 }}>
          <i className="fa-solid fa-plus"></i> Yeni Ürün
        </button>
      </div>

      {isAddingCat && (
        <div className="admin-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', animation: 'fadeIn 0.3s ease', flexWrap: 'wrap' }}>
           <input className="admin-input" placeholder="Kategori Adı (Örn: İçecekler)" value={newCatTitle} onChange={e => setNewCatTitle(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
           <input className="admin-input" placeholder="Emoji (Örn: 🥤)" value={newCatEmoji} onChange={e => setNewCatEmoji(e.target.value)} style={{ width: 140 }} />
           <button className="admin-btn admin-btn-gold" onClick={handleAddCategory}>Kaydet</button>
           <button className="admin-btn admin-btn-ghost" onClick={() => setIsAddingCat(false)}>İptal</button>
        </div>
      )}

      {editing === 'new' && (
        <ItemForm item={null} onSave={handleSave} onCancel={() => setEditing(null)} showHighlight={true} allCategories={categories} defaultCategoryId={selectedCat} />
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item, i) => (
          editing?.id === item.id ? (
            <ItemForm key={item.id} item={editing} onSave={handleSave} onCancel={() => setEditing(null)} showHighlight={true} allCategories={categories} defaultCategoryId={selectedCat} />
          ) : (
          <div key={item.id} className="admin-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center', animation: `fadeIn 0.3s ease ${i * 0.04}s both`, flexWrap: 'wrap', opacity: item.isHidden ? 0.5 : 1 }}>
            {item.image && <img src={item.image} alt={item.title} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: `1px solid ${colors.border}`, flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                {item.emoji && <span>{item.emoji}</span>}
                <span style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</span>
                {item.badge && <span className="admin-badge" style={{ background: 'rgba(212,175,55,0.15)', color: colors.gold, fontSize: 10 }}>{item.badge}</span>}
                {item.isHighlight && <span className="admin-badge" style={{ background: 'rgba(243,156,18,0.15)', color: '#f39c12', fontSize: 10 }}>⭐ Öne Çıkan</span>}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>{item.description?.slice(0, 80)}...</p>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.gold }}>{formatPrice(item.price)}</span>
            </div>
            <div className="admin-item-actions">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: 44, height: 24 }} title={item.isHidden ? "Satışa Aç" : "Satışa Kapat"}>
                  <input type="checkbox" checked={!item.isHidden} onChange={(e) => handleToggleVisibility(item.id, !e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: item.isHidden ? '#ef4444' : '#22c55e', borderRadius: 24, transition: '.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}></span>
                  <span style={{ position: 'absolute', height: 18, width: 18, left: item.isHidden ? 3 : 23, bottom: 3, backgroundColor: 'white', borderRadius: '50%', transition: '.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}></span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setEditing(item)}>
                  <i className="fa-solid fa-pen"></i>
                </button>
                {deleting === item.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(item.id)}>Sil</button>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDeleting(null)}>×</button>
                  </div>
                ) : (
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDeleting(item.id)} style={{ color: colors.danger }}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
          )
        ))}
        {items.length === 0 && <p style={{ textAlign: 'center', color: colors.textMuted, padding: 40 }}>Bu kategoride ürün bulunamadı.</p>}
      </div>
    </div>
  );
}

// ============================================================
// COUPONS TAB
// ============================================================
function CouponsTab({ coupons, reload }) {
  const [editing, setEditing] = useState(null); // null | 'new' | coupon obj
  const [deleting, setDeleting] = useState(null);

  const emptyForm = { code: '', discountType: 'percentage', discountValue: '', minCartAmount: '', maxUses: '', expiresAt: '', isActive: true };
  const [form, setForm] = useState(emptyForm);

  function startEdit(coupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code || '', discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '', minCartAmount: coupon.minCartAmount || '',
      maxUses: coupon.maxUses || '', expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
      isActive: coupon.isActive !== false,
    });
  }

  function startNew() {
    setEditing('new');
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.code || !form.discountValue) return alert('Kod ve indirim değeri zorunludur.');
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minCartAmount: form.minCartAmount ? Number(form.minCartAmount) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : 0,
        expiresAt: form.expiresAt || null,
      };
      if (editing === 'new') {
        payload.id = generateId('coupon');
        payload.usedCount = 0;
        payload.createdAt = new Date().toISOString();
        await apiFetch('/api/coupons', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        const updated = coupons.map(c => c.id === editing.id ? { ...c, ...payload } : c);
        await apiFetch('/api/coupons', { method: 'PUT', body: JSON.stringify(updated) });
      }
      setEditing(null);
      setForm(emptyForm);
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  async function handleDelete(id) {
    try {
      const updated = coupons.filter(c => c.id !== id);
      await apiFetch('/api/coupons', { method: 'PUT', body: JSON.stringify(updated) });
      setDeleting(null);
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
  }

  function getCouponStatus(c) {
    if (!c.isActive) return { label: 'Pasif', color: colors.textDim, bg: 'var(--bg-alpha-05)' };
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { label: 'Süresi Dolmuş', color: colors.danger, bg: 'rgba(231,76,60,0.12)' };
    if (c.maxUses && c.usedCount >= c.maxUses) return { label: 'Tükenmiş', color: colors.warning, bg: 'rgba(243,156,18,0.12)' };
    return { label: 'Aktif', color: colors.success, bg: 'rgba(39,174,96,0.12)' };
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: colors.textMuted, margin: 0 }}>{coupons.length} kupon kayıtlı</p>
        <button className="admin-btn admin-btn-gold" onClick={startNew}>
          <i className="fa-solid fa-plus"></i> Yeni Kupon
        </button>
      </div>

      {editing && (
        <div className="admin-card" style={{ padding: 24, marginBottom: 20, animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>{editing === 'new' ? 'Yeni Kupon Oluştur' : 'Kuponu Düzenle'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label className="admin-label">Kupon Kodu *</label>
              <input className="admin-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="YILBASI25" style={{ textTransform: 'uppercase' }} />
            </div>
            <div>
              <label className="admin-label">İndirim Türü</label>
              <select className="admin-select" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                <option value="percentage">Yüzde (%)</option>
                <option value="fixed">Sabit Tutar (₺)</option>
              </select>
            </div>
            <div>
              <label className="admin-label">İndirim Değeri *</label>
              <input className="admin-input" type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === 'percentage' ? '20' : '50'} />
            </div>
            <div>
              <label className="admin-label">Min. Sepet Tutarı (₺)</label>
              <input className="admin-input" type="number" value={form.minCartAmount} onChange={e => setForm({ ...form, minCartAmount: e.target.value })} placeholder="100" />
            </div>
            <div>
              <label className="admin-label">Maks. Kullanım</label>
              <input className="admin-input" type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} placeholder="0 = Sınırsız" />
            </div>
            <div>
              <label className="admin-label">Son Kullanma Tarihi</label>
              <input className="admin-input" type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 22 }}>
              <input type="checkbox" className="admin-checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <label style={{ fontSize: 14, color: colors.textMuted }}>Aktif</label>
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button className="admin-btn admin-btn-gold" onClick={handleSave}><i className="fa-solid fa-check"></i> Kaydet</button>
            <button className="admin-btn admin-btn-ghost" onClick={() => { setEditing(null); setForm(emptyForm); }}><i className="fa-solid fa-xmark"></i> İptal</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {coupons.map((c, i) => {
          const st = getCouponStatus(c);
          return (
            <div key={c.id} className="admin-card" style={{ padding: 16, animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <code style={{ background: 'rgba(212,175,55,0.12)', color: colors.gold, padding: '4px 12px', borderRadius: 8, fontWeight: 700, fontSize: 15, fontFamily: "'Outfit'" }}>{c.code}</code>
                    <span className="admin-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: colors.textMuted }}>
                    <span><i className="fa-solid fa-tag" style={{ marginRight: 6 }}></i>{c.discountType === 'percentage' ? `%${c.discountValue}` : `₺${c.discountValue}`} indirim</span>
                    {c.minCartAmount > 0 && <span><i className="fa-solid fa-cart-shopping" style={{ marginRight: 6 }}></i>Min: {formatPrice(c.minCartAmount)}</span>}
                    <span><i className="fa-solid fa-chart-simple" style={{ marginRight: 6 }}></i>{c.usedCount || 0}{c.maxUses ? ` / ${c.maxUses}` : ''} kullanım</span>
                    {c.expiresAt && <span><i className="fa-solid fa-calendar" style={{ marginRight: 6 }}></i>{formatDate(c.expiresAt)}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => startEdit(c)}><i className="fa-solid fa-pen"></i></button>
                  {deleting === c.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(c.id)}>Sil</button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDeleting(null)}>×</button>
                    </div>
                  ) : (
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDeleting(c.id)} style={{ color: colors.danger }}><i className="fa-solid fa-trash"></i></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && <p style={{ textAlign: 'center', color: colors.textMuted, padding: 40 }}>Henüz kupon oluşturulmamış.</p>}
      </div>
    </div>
  );
}

// ============================================================
// ORDERS TAB
// ============================================================
function OrdersTab({ orders, reload }) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterTab, setFilterTab] = useState('active'); // active, all, rejected, approved
  const [dateFilter, setDateFilter] = useState('all'); // all, daily, weekly, monthly, custom
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  
  // cancel note state
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null, note: '' });

  async function updateStatus(orderId, newStatus, note = null) {
    try {
      await apiFetch('/api/orders', { method: 'PUT', body: JSON.stringify({ orderId, status: newStatus, note }) });
      reload();
      if (cancelModal.isOpen) setCancelModal({ isOpen: false, orderId: null, note: '' });
    } catch (e) { alert('Hata: ' + e.message); }
  }

  // Filtering
  const filteredOrders = orders.filter(o => {
    // Status Filter
    if (filterTab === 'active' && (o.status === 'delivered' || o.status === 'cancelled')) return false;
    if (filterTab === 'approved' && o.status !== 'delivered') return false;
    if (filterTab === 'rejected' && o.status !== 'cancelled') return false;

    // Date Filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      if (dateFilter === 'daily') {
        if (orderDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'weekly') {
        const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
        if (orderDate < weekAgo) return false;
      } else if (dateFilter === 'monthly') {
        const monthAgo = new Date(); monthAgo.setMonth(now.getMonth() - 1);
        if (orderDate < monthAgo) return false;
      } else if (dateFilter === 'custom') {
        if (customDateRange.start && customDateRange.end) {
          const start = new Date(customDateRange.start); start.setHours(0,0,0,0);
          const end = new Date(customDateRange.end); end.setHours(23,59,59,999);
          if (orderDate < start || orderDate > end) return false;
        }
      }
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'active', label: 'Aktif Siparişler' },
            { id: 'all', label: 'Tüm Siparişler' },
            { id: 'approved', label: 'Onaylananlar' },
            { id: 'rejected', label: 'Reddedilenler' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap',
                background: filterTab === tab.id ? 'var(--primary-color)' : 'var(--bg-alpha-05)',
                color: filterTab === tab.id ? '#000' : 'var(--text-main)',
                transition: 'all 0.3s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Filter & Reload */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)}
            className="admin-input" 
            style={{ width: 'auto', padding: '8px 12px', height: 'auto', fontSize: '14px', background: 'var(--bg-alpha-06)', color: 'var(--text-main)' }}
          >
            <option value="all" style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>Tüm Zamanlar</option>
            <option value="daily" style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>Günlük (Bugün)</option>
            <option value="weekly" style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>Haftalık</option>
            <option value="monthly" style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>Aylık</option>
            <option value="custom" style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>Özel Tarih</option>
          </select>

          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="date" className="admin-input" style={{ width: 'auto', padding: '6px 10px', height: 'auto', fontSize: '13px' }} value={customDateRange.start} onChange={e => setCustomDateRange({...customDateRange, start: e.target.value})} />
              <span style={{ color: colors.textMuted }}>-</span>
              <input type="date" className="admin-input" style={{ width: 'auto', padding: '6px 10px', height: 'auto', fontSize: '13px' }} value={customDateRange.end} onChange={e => setCustomDateRange({...customDateRange, end: e.target.value})} />
            </div>
          )}

          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={reload}>
            <i className="fa-solid fa-rotate"></i> Yenile
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px', color: colors.textMuted, fontSize: '14px' }}>
        Listelenen sipariş sayısı: <strong>{filteredOrders.length}</strong>
      </div>

      {/* Cancel Modal */}
      {cancelModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="admin-card" style={{ width: 400, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', color: colors.danger }}>Siparişi İptal Et</h3>
            <p style={{ fontSize: 14, color: colors.textMuted, marginBottom: 16 }}>Lütfen iptal sebebini yazın. Bu not sipariş geçmişine kaydedilecektir.</p>
            <textarea 
              className="admin-input" 
              rows="4" 
              placeholder="İptal notu..." 
              value={cancelModal.note} 
              onChange={e => setCancelModal({...cancelModal, note: e.target.value})} 
              style={{ marginBottom: 16 }} 
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="admin-btn admin-btn-ghost" onClick={() => setCancelModal({ isOpen: false, orderId: null, note: '' })}>Vazgeç</button>
              <button className="admin-btn" style={{ background: colors.danger, color: 'var(--text-main)' }} onClick={() => updateStatus(cancelModal.orderId, 'cancelled', cancelModal.note)}>İptali Onayla</button>
            </div>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="admin-card" style={{ padding: 60, textAlign: 'center' }}>
          <i className="fa-solid fa-inbox" style={{ fontSize: 48, color: colors.textDim, marginBottom: 16 }}></i>
          <p style={{ color: colors.textMuted, fontSize: 16 }}>Bu filtrelere uygun sipariş bulunamadı</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filteredOrders.map((order, i) => {
            const isNew = order.status === 'received';
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="admin-card" style={{ overflow: 'hidden', animation: `fadeIn 0.3s ease ${i * 0.04}s both`, borderColor: isNew ? 'rgba(231,76,60,0.3)' : undefined }}>
                {/* Order header */}
                <div onClick={() => setExpandedOrder(isExpanded ? null : order.id)} style={{ padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isNew && <span className="admin-pulse" />}
                    <span style={{ fontWeight: 700, fontSize: 15 }}>#{order.id?.slice(-6)}</span>
                  </div>
                  <StatusBadge status={order.status} />
                  <span style={{ color: colors.textMuted, fontSize: 13 }}>{order.customerInfo?.name || 'Anonim'}</span>
                  <span style={{ color: colors.gold, fontWeight: 700, fontSize: 15, marginLeft: 'auto' }}>{formatPrice(order.total || 0)}</span>
                  <span style={{ color: colors.textMuted, fontSize: 12 }}>{formatDate(order.createdAt)}</span>
                  <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: colors.textDim, fontSize: 12 }}></i>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${colors.border}`, animation: 'fadeIn 0.25s ease' }}>
                    {/* Customer info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, padding: '16px 0' }}>
                      <div>
                        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Müşteri</div>
                        <div style={{ fontWeight: 600 }}>{order.customerInfo?.name || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Telefon</div>
                        <div>{order.customerInfo?.phone || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Adres</div>
                        <div style={{ fontSize: 13, lineHeight: 1.4 }}>{order.customerInfo?.address || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Ödeme</div>
                        <div>{order.customerInfo?.paymentMethod === 'kredi_karti' ? '💳 Kredi Kartı' : order.customerInfo?.paymentMethod === 'nakit' ? '💵 Nakit' : order.customerInfo?.paymentMethod || '-'}</div>
                      </div>
                      {order.customerInfo?.notes && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Not</div>
                          <div style={{ fontSize: 13, color: colors.warning }}>{order.customerInfo?.notes}</div>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>Ürünler</div>
                        <div style={{ overflowX: 'auto' }}>
                          <table className="admin-table">
                            <thead><tr><th>Ürün</th><th>Adet</th><th>Fiyat</th><th>Toplam</th></tr></thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <div style={{ fontWeight: 500 }}>{item.title || item.name}</div>
                                    {item.excludedIngredients && item.excludedIngredients.length > 0 && (
                                      <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 4 }}>
                                        <i className="fa-solid fa-ban" style={{ marginRight: 4 }}></i> Çıkarılan: {item.excludedIngredients.join(', ')}
                                      </div>
                                    )}
                                    {item.selectedDrink && (
                                      <div style={{ fontSize: 11, color: '#3498db', marginTop: 4 }}>
                                        <i className="fa-solid fa-bottle-droplet" style={{ marginRight: 4 }}></i> İçecek: {item.selectedDrink}
                                      </div>
                                    )}
                                  </td>
                                  <td>{item.quantity || 1}</td>
                                  <td>{formatPrice(item.price || 0)}</td>
                                  <td style={{ color: colors.gold }}>{formatPrice((item.price || 0) * (item.quantity || 1))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {order.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 8, fontSize: 14 }}>
                            <span style={{ color: colors.textMuted }}>Kupon İndirimi:</span>
                            <span style={{ color: colors.success, fontWeight: 600 }}>-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 8, fontSize: 16 }}>
                          <span style={{ color: colors.textMuted }}>Genel Toplam:</span>
                          <span style={{ color: colors.gold, fontWeight: 700 }}>{formatPrice(order.total || 0)}</span>
                        </div>
                      </div>
                    )}

                    {/* Status flow */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: colors.textMuted }}>Sipariş Durumu Güncelle</div>
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button 
                            onClick={() => setCancelModal({ isOpen: true, orderId: order.id, note: '' })}
                            style={{ background: 'transparent', border: '1px solid ' + colors.danger, color: colors.danger, borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            <i className="fa-solid fa-ban"></i> Siparişi İptal Et
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {statusFlow.map((st, idx) => {
                          const isCurrent = order.status === st;
                          const sc = statusColors[st];
                          return (
                            <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <button
                                className={`status-flow-btn ${isCurrent ? 'active' : ''}`}
                                onClick={() => updateStatus(order.id, st)}
                                style={isCurrent ? { borderColor: sc.text, background: sc.bg, color: sc.text } : undefined}
                                disabled={order.status === 'cancelled'}
                              >
                                {sc.label}
                              </button>
                              {idx < statusFlow.length - 1 && <i className="fa-solid fa-arrow-right" style={{ color: colors.textDim, fontSize: 10, margin: '0 2px' }}></i>}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Cancelled Alert Box */}
                      {order.status === 'cancelled' && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(231,76,60,0.1)', borderLeft: '4px solid ' + colors.danger, borderRadius: '4px' }}>
                          <div style={{ fontWeight: 600, color: colors.danger, marginBottom: '4px' }}><i className="fa-solid fa-circle-exclamation"></i> Bu Sipariş İptal Edildi</div>
                          {order.statusHistory?.find(h => h.status === 'cancelled')?.note && (
                            <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>İptal Notu: {order.statusHistory.find(h => h.status === 'cancelled').note}</div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AIChatAssistant({ reloadAll }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Merhaba! Ben Çatı Asistanı. Menü fiyatlarını veya stok durumlarını değiştirmek için bana yazabilirsiniz.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const localApiKey = localStorage.getItem('geminiApiKey');
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'X-AI-API-Key': localApiKey || ''
        },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        if (data.actionExecuted) {
          reloadAll();
          alert('Asistan: İşlem gerçekleştirildi!');
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `Hata: ${data.error}` }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Bağlantı hatası oluştu.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', width: '60px', height: '60px',
          borderRadius: '50%', background: 'linear-gradient(135deg, #f39c12, #d35400)',
          color: '#fff', fontSize: '24px', border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(243, 156, 18, 0.4)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className={isOpen ? "fa-solid fa-times" : "fa-solid fa-robot"}></i>
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '100px', right: '24px', width: '350px', height: '500px',
          background: 'var(--surface-color)', border: '1px solid var(--glass-border)',
          borderRadius: '20px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', zIndex: 9998,
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ background: 'linear-gradient(135deg, #f39c12, #d35400)', padding: '16px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              <i className="fa-solid fa-robot"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Çatı Asistan</h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Yapay Zeka Destekli</p>
            </div>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  background: msg.role === 'user' ? '#f39c12' : 'var(--glass-bg)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
                  padding: '12px 16px', borderRadius: '16px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                  fontSize: '14px', lineHeight: '1.5',
                  border: msg.role === 'ai' ? '1px solid var(--glass-border)' : 'none'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--glass-bg)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', border: '1px solid var(--glass-border)' }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ color: 'var(--text-muted)' }}></i>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', background: 'var(--surface-color)', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Mesajınızı yazın..."
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
              disabled={loading}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#f39c12', color: '#fff', border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// SETTINGS TAB
// ============================================================
function SettingsTab({ settings, reload }) {
  const [form, setForm] = useState(settings || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      const localKey = localStorage.getItem('geminiApiKey');
      setForm({ ...settings, ai: { ...settings.ai, geminiApiKey: settings.ai?.geminiApiKey || localKey || '' } });
    }
  }, [settings]);

  async function handleSave() {
    setSaving(true);
    try {
      await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(form) });
      if (form.ai?.geminiApiKey) {
        localStorage.setItem('geminiApiKey', form.ai.geminiApiKey);
      } else {
        localStorage.removeItem('geminiApiKey');
      }
      reload();
      alert('Ayarlar başarıyla kaydedildi!');
    } catch (e) { alert('Hata: ' + e.message); }
    setSaving(false);
  }

  if (!settings) return <div>Yükleniyor...</div>;

  return (
    <div className="admin-card" style={{ padding: 24, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Şirket Ayarları</h2>
        <button className="admin-btn" style={{ background: colors.gold, color: '#000' }} onClick={handleSave} disabled={saving}>
          {saving ? 'Kaydediliyor...' : <><i className="fa-solid fa-save"></i> Kaydet</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        
        {/* Main Settings */}
        <div>
          <h3 style={{ fontSize: 16, color: colors.gold, marginBottom: 16, borderBottom: '1px solid ' + colors.border, paddingBottom: 8 }}>Genel Durum</h3>
          
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}>Mağaza Durumu (Açık/Kapalı)</div>
            <select className="admin-input" style={{ background: 'var(--bg-alpha-06)', color: 'var(--text-main)' }} value={form.isStoreOpen ? 'true' : 'false'} onChange={e => setForm({...form, isStoreOpen: e.target.value === 'true'})}>
              <option value="true" style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>Açık (Sipariş Alınabilir)</option>
              <option value="false" style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>Kapalı (Bakım / Servis Dışı)</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}>Çalışma Saatleri</div>
            <input type="text" className="admin-input" value={form.workingHours || ''} onChange={e => setForm({...form, workingHours: e.target.value})} placeholder="Örn: 10:00 - 02:00" />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}>Ücretsiz Kargo Sepet Alt Limiti (TL)</div>
            <input type="number" className="admin-input" value={form.freeShippingThreshold || ''} onChange={e => setForm({...form, freeShippingThreshold: Number(e.target.value)})} />
          </label>
          
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}>Minimum Sipariş Tutarı (TL)</div>
            <input type="number" className="admin-input" value={form.minOrderAmount || ''} onChange={e => setForm({...form, minOrderAmount: Number(e.target.value)})} />
          </label>
          
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}>Ortalama Kurye Ücreti (Sepet İçi Uyarı) (TL)</div>
            <input type="number" className="admin-input" value={form.courierFee || ''} onChange={e => setForm({...form, courierFee: Number(e.target.value)})} />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}>Google Yıldız Puanı (Örn: 5.0)</div>
            <input type="text" className="admin-input" value={form.ratingValue || ''} onChange={e => setForm({...form, ratingValue: e.target.value})} placeholder="5.0" />
          </label>
          
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}>Google Yorum Sayısı (Örn: 60)</div>
            <input type="text" className="admin-input" value={form.ratingCount || ''} onChange={e => setForm({...form, ratingCount: e.target.value})} placeholder="60" />
          </label>
        </div>

        {/* Links */}
        <div>
          <h3 style={{ fontSize: 16, color: colors.gold, marginBottom: 16, borderBottom: '1px solid ' + colors.border, paddingBottom: 8 }}>Dış Platform Linkleri</h3>
          
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-solid fa-motorcycle" style={{color: '#e00000'}}></i> Yemeksepeti Linki</div>
            <input type="text" className="admin-input" value={form.deliveryLinks?.yemeksepeti || ''} onChange={e => setForm({...form, deliveryLinks: {...form.deliveryLinks, yemeksepeti: e.target.value}})} placeholder="https://..." />
          </label>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-solid fa-motorcycle" style={{color: '#5d3ebc'}}></i> Getir Yemek Linki</div>
            <input type="text" className="admin-input" value={form.deliveryLinks?.getir || ''} onChange={e => setForm({...form, deliveryLinks: {...form.deliveryLinks, getir: e.target.value}})} placeholder="https://..." />
          </label>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-solid fa-motorcycle" style={{color: '#ff7c00'}}></i> Migros Yemek Linki</div>
            <input type="text" className="admin-input" value={form.deliveryLinks?.migros || ''} onChange={e => setForm({...form, deliveryLinks: {...form.deliveryLinks, migros: e.target.value}})} placeholder="https://..." />
          </label>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-solid fa-motorcycle" style={{color: '#F27A1A'}}></i> Trendyol Go Linki</div>
            <input type="text" className="admin-input" value={form.deliveryLinks?.trendyolGo || ''} onChange={e => setForm({...form, deliveryLinks: {...form.deliveryLinks, trendyolGo: e.target.value}})} placeholder="https://..." />
          </label>

          <h3 style={{ fontSize: 16, color: colors.gold, marginTop: 32, marginBottom: 16, borderBottom: '1px solid ' + colors.border, paddingBottom: 8 }}>İletişim & Sosyal Medya</h3>
          
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-brands fa-whatsapp" style={{color: '#25D366'}}></i> WhatsApp Numarası</div>
            <input type="text" className="admin-input" value={form.socialLinks?.whatsapp || ''} onChange={e => setForm({...form, socialLinks: {...form.socialLinks, whatsapp: e.target.value}})} placeholder="905..." />
          </label>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-brands fa-instagram" style={{color: '#E1306C'}}></i> Instagram Linki</div>
            <input type="text" className="admin-input" value={form.socialLinks?.instagram || ''} onChange={e => setForm({...form, socialLinks: {...form.socialLinks, instagram: e.target.value}})} placeholder="https://..." />
          </label>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-brands fa-google" style={{color: '#4285F4'}}></i> Google Yorum Linki</div>
            <input type="text" className="admin-input" value={form.socialLinks?.googleReview || ''} onChange={e => setForm({...form, socialLinks: {...form.socialLinks, googleReview: e.target.value}})} placeholder="https://..." />
          </label>

          <h3 style={{ fontSize: 16, color: colors.gold, marginTop: 32, marginBottom: 16, borderBottom: '1px solid ' + colors.border, paddingBottom: 8 }}>Mağaza WiFi Bilgileri</h3>
          
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-solid fa-wifi" style={{color: '#3498db'}}></i> WiFi Ağ Adı</div>
            <input type="text" className="admin-input" value={form.wifi?.name || ''} onChange={e => setForm({...form, wifi: {...form.wifi, name: e.target.value}})} placeholder="Ağ Adı" />
          </label>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-solid fa-key" style={{color: '#f1c40f'}}></i> WiFi Şifresi</div>
            <input type="text" className="admin-input" value={form.wifi?.password || ''} onChange={e => setForm({...form, wifi: {...form.wifi, password: e.target.value}})} placeholder="Şifre" />
          </label>

          <h3 style={{ fontSize: 16, color: colors.gold, marginTop: 32, marginBottom: 16, borderBottom: '1px solid ' + colors.border, paddingBottom: 8 }}>Yapay Zeka (AI) Entegrasyonu</h3>
          
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}><i className="fa-solid fa-wand-magic-sparkles" style={{color: '#9b59b6'}}></i> Google Gemini API Key</div>
            <input type="password" className="admin-input" value={form.ai?.geminiApiKey || ''} onChange={e => setForm({...form, ai: {...form.ai, geminiApiKey: e.target.value}})} placeholder="AIzaSy..." />
            <div style={{ marginTop: 6, fontSize: 11, color: colors.textMuted }}>Menü eklerken veya düzenlerken yapay zeka desteğini kullanmak için geçerli bir Gemini API Key girin.</div>
          </label>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// DESIGN TAB
// ============================================================
function DesignTab({ settings, reload }) {
  const [saving, setSaving] = useState(false);
  const [customColor, setCustomColor] = useState(settings?.themeColor || '#eab308');

  async function handleSelectColor(colorHex) {
    if (settings?.themeColor === colorHex) return;
    setSaving(true);
    try {
      await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify({ ...settings, themeColor: colorHex }) });
      reload();
      alert('Tasarım rengi başarıyla güncellendi!');
    } catch (e) {
      alert('Hata: ' + e.message);
    }
    setSaving(false);
  }

  async function handleSelectBg(bgId) {
    if (settings?.bgThemeId === bgId && !settings?.customBgImage) return;
    setSaving(true);
    try {
      await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify({ ...settings, bgThemeId: bgId, customBgImage: null }) });
      reload();
      alert('Arka plan teması başarıyla güncellendi!');
    } catch (e) {
      alert('Hata: ' + e.message);
    }
    setSaving(false);
  }

  const [bgUploading, setBgUploading] = useState(false);
  async function handleCustomBgUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setBgUploading(true);
    const data = new FormData();
    data.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: data
      });
      const result = await res.json();
      if (res.ok && result.url) {
        await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify({ ...settings, bgThemeId: 'custom', customBgImage: result.url }) });
        reload();
        alert('Özel arka plan başarıyla yüklendi!');
      } else {
        alert(result.error || 'Yükleme başarısız');
      }
    } catch (err) {
      alert('Yükleme hatası');
    } finally {
      setBgUploading(false);
    }
  }

  const getSvgBg = (svgStr) => `url("data:image/svg+xml,${encodeURIComponent(svgStr)}")`;

  const THEME_BACKGROUNDS = [
    { id: 'default', name: 'Sade (Varsayılan)', bg: 'none', icon: 'fa-solid fa-ban' },
    { id: 'dots', name: 'Noktalı Desen', bg: getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='2.5' fill='#9ca3af' fill-opacity='0.4'/></svg>`), icon: 'fa-solid fa-ellipsis' },
    { id: 'diagonal', name: 'Çapraz Çizgiler', bg: getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M0 40L40 0M-10 10L10 -10M30 50L50 30' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.2'/></svg>`), icon: 'fa-solid fa-slash' },
    { id: 'waves', name: 'Dalgalı Desen', bg: getSvgBg(`<svg width='40' height='20' xmlns='http://www.w3.org/2000/svg'><path d='M0 10 Q 10 0, 20 10 T 40 10' fill='none' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.25'/></svg>`), icon: 'fa-solid fa-water' },
    { id: 'checkers', name: 'Kareli Desen', bg: getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' fill='#9ca3af' fill-opacity='0.15'/><rect x='20' y='20' width='20' height='20' fill='#9ca3af' fill-opacity='0.15'/></svg>`), icon: 'fa-solid fa-chess-board' },
    { id: 'grid', name: 'Izgara Desen', bg: getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0v40M0 20h40' fill='none' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.2'/></svg>`), icon: 'fa-solid fa-table-cells' },
    { id: 'rings', name: 'Halkalı Desen', bg: getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='14' fill='none' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.25'/></svg>`), icon: 'fa-solid fa-bullseye' },
    { id: 'zigzag', name: 'Geometrik Desen', bg: getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M0 40 L40 0 Z' fill='none' stroke='#9ca3af' stroke-opacity='0.2' stroke-width='3'/></svg>`), icon: 'fa-solid fa-shapes' },
    { id: 'diamonds', name: 'Elmas Desen', bg: getSvgBg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='#9ca3af' stroke-opacity='0.2' stroke-width='2'/></svg>`), icon: 'fa-regular fa-gem' }
  ];

  const THEME_COLORS = [
    { name: 'Sarı (Varsayılan)', hex: '#eab308' },
    { name: 'Turuncu', hex: '#f97316' },
    { name: 'Kırmızı', hex: '#ef4444' },
    { name: 'Yeşil', hex: '#22c55e' },
    { name: 'Mavi', hex: '#3b82f6' },
    { name: 'Mor', hex: '#a855f7' },
    { name: 'Pembe', hex: '#ec4899' },
    { name: 'Siyah', hex: '#18181b' },
    { name: 'Kahverengi', hex: '#8b4513' },
    { name: 'Lacivert', hex: '#1e3a8a' },
    { name: 'Bordo', hex: '#7f1d1d' },
    { name: 'Zümrüt', hex: '#065f46' },
    { name: 'Turkuaz', hex: '#0d9488' },
    { name: 'Hardal', hex: '#ca8a04' },
    { name: 'Gümüş Gri', hex: '#9ca3af' }
  ];

  return (
    <div className="admin-card" style={{ padding: 24, animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ margin: 0, fontSize: 20, marginBottom: 8 }}>Tasarım Yönetimi</h2>
      <p style={{ color: colors.textMuted, marginBottom: 24, fontSize: 14 }}>
        Müşteri ekranındaki ana butonların ve öne çıkan alanların rengini anında değiştirebilirsiniz. Koyu renkler seçildiğinde yazı rengi otomatik olarak beyaza döner.
      </p>

      <h3 style={{ fontSize: 16, color: colors.gold, marginTop: 16, marginBottom: 16, borderBottom: '1px solid ' + colors.border, paddingBottom: 8 }}>Hazır Renkler</h3>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {THEME_COLORS.map(c => {
          const isActive = settings?.themeColor === c.hex || (!settings?.themeColor && c.hex === '#eab308');
          return (
            <button 
              key={c.hex}
              disabled={saving}
              onClick={() => handleSelectColor(c.hex)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                background: 'var(--surface-color)',
                border: isActive ? `2px solid ${c.hex}` : '2px solid var(--glass-border)',
                borderRadius: 12, padding: 16, cursor: 'pointer',
                opacity: saving ? 0.5 : 1,
                transition: 'all 0.2s',
                width: 140
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: c.hex, boxShadow: `0 4px 12px ${c.hex}66` }}></div>
              <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: isActive ? 700 : 500 }}>{c.name}</span>
            </button>
          );
        })}
      </div>

      <h3 style={{ fontSize: 16, color: colors.gold, marginTop: 32, marginBottom: 16, borderBottom: '1px solid ' + colors.border, paddingBottom: 8 }}>Özel Renk Oluştur</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <input 
          type="color" 
          value={customColor} 
          onChange={(e) => setCustomColor(e.target.value)} 
          style={{ width: 48, height: 48, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }} 
        />
        <button 
          onClick={() => handleSelectColor(customColor)}
          disabled={saving}
          className="admin-btn"
          style={{ background: 'var(--surface-color)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
        >
          {saving ? 'Kaydediliyor...' : 'Seçili Özel Rengi Uygula'}
        </button>
      </div>

      <h3 style={{ fontSize: 16, color: colors.gold, marginTop: 40, marginBottom: 16, borderBottom: '1px solid ' + colors.border, paddingBottom: 8 }}>Arka Plan Deseni (Tema)</h3>
      <p style={{ color: colors.textMuted, marginBottom: 24, fontSize: 14 }}>
        Müşteri ekranının arka planına işletmenizin konseptine uygun hafif desenler ekleyebilirsiniz.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {THEME_BACKGROUNDS.map(bg => {
          const isActive = settings?.bgThemeId === bg.id || (!settings?.bgThemeId && bg.id === 'default');
          return (
            <button 
              key={bg.id}
              disabled={saving}
              onClick={() => handleSelectBg(bg.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                background: 'var(--surface-color)',
                border: isActive ? `2px solid var(--accent-color)` : '2px solid var(--glass-border)',
                borderRadius: 12, padding: 16, cursor: 'pointer',
                opacity: saving ? 0.5 : 1,
                transition: 'all 0.2s',
                width: 140,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: bg.bg, zIndex: 0 }}></div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-color)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <i className={bg.icon} style={{ color: 'var(--text-muted)' }}></i>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: isActive ? 700 : 500, zIndex: 1, textShadow: '0 0 10px var(--bg-color), 0 0 10px var(--bg-color)' }}>{bg.name}</span>
            </button>
          );
        })}
      </div>

      <h3 style={{ fontSize: 16, color: colors.gold, marginTop: 40, marginBottom: 16, borderBottom: '1px solid ' + colors.border, paddingBottom: 8 }}>Özel Arka Plan Görseli Yükle (Premium Glass Efekti)</h3>
      <p style={{ color: colors.textMuted, marginBottom: 24, fontSize: 14 }}>
        Kendi görselinizi yükleyerek işletmenize tamamen özel bir arka plan oluşturabilirsiniz. Görselinizin üzerine otomatik olarak premium bir "glass" (buzlu cam) efekti uygulanacaktır.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <label className="admin-btn" style={{ background: 'var(--primary-color)', color: '#000', cursor: 'pointer', opacity: bgUploading ? 0.5 : 1 }}>
          <i className="fa-solid fa-upload"></i> {bgUploading ? 'Yükleniyor...' : 'Görsel Seç ve Yükle'}
          <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleCustomBgUpload} disabled={bgUploading} />
        </label>
        
        {settings?.customBgImage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={settings.customBgImage} alt="Custom Bg" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--glass-border)' }} />
            <button onClick={() => handleSelectBg('default')} className="admin-btn" style={{ background: '#ef4444', color: '#fff' }}>Kaldır</button>
          </div>
        )}
      </div>
    </div>
  );
}

function WaitersTab({ requests, reload }) {
  const handleComplete = async (id) => {
    try {
      const res = await fetch(`/api/waiter`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ id, status: 'completed' })
      });
      if (res.ok) {
        reload();
        alert('Garson talebi başarıyla tamamlandı.');
      } else {
        if (res.status === 404) {
          // Sistem resetlenmiş olabilir, sayfayı yenile
          reload();
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.error || 'Hata oluştu.');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Bağlantı hatası.');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('İptal etmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/waiter`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ id, status: 'cancelled' })
      });
      if (res.ok) {
        reload();
        alert('Garson talebi iptal edildi.');
      } else {
        if (res.status === 404) {
          reload();
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.error || 'Hata oluştu.');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Bağlantı hatası.');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending').slice(0, 50);

  return (
    <div>
      <h3 style={{ marginBottom: 16, color: 'var(--text-main)', fontSize: 18 }}>Bekleyen Talepler</h3>
      
      {pendingRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-alpha-05)', borderRadius: 20, border: '1px solid var(--glass-border)', marginBottom: 32 }}>
          <i className="fa-solid fa-bell-concierge" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }}></i>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Şu an bekleyen garson talebi bulunmuyor.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px', marginBottom: 32 }}>
          {pendingRequests.map(req => (
            <div key={req.id || req._id} style={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: 'rgba(243, 156, 18, 0.1)', color: '#f39c12', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', border: '1px solid rgba(243, 156, 18, 0.3)' }}>
                  {req.tableNo}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>Masa {req.tableNo}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}><i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i>{new Date(req.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handleComplete(req.id || req._id)} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'}>
                  <i className="fa-solid fa-check" style={{ marginRight: '8px' }}></i> Tamamlandı
                </button>
                <button onClick={() => handleCancel(req.id || req._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>
                  İptal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pastRequests.length > 0 && (
        <>
          <h3 style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 18, borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>Geçmiş Talepler (Son 50)</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {pastRequests.map(req => (
              <div key={req.id || req._id} style={{ background: 'var(--bg-alpha-03)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: 'var(--bg-alpha-10)', color: 'var(--text-muted)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800' }}>
                    {req.tableNo}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>Masa {req.tableNo}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-alpha-50)' }}>
                      <i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i>
                      {new Date(req.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      {req.updatedAt && ` - ${new Date(req.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: req.status === 'completed' ? '#22c55e' : '#ef4444', fontSize: '14px', fontWeight: '600', padding: '6px 12px', background: req.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                  <i className={`fa-solid ${req.status === 'completed' ? 'fa-check' : 'fa-xmark'}`}></i> 
                  {req.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

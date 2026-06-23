'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// STYLES
// ============================================================
const colors = {
  bg: '#0d0d0d',
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardHover: 'rgba(255,255,255,0.07)',
  bgSidebar: 'rgba(13,13,13,0.97)',
  gold: '#d4af37',
  goldLight: '#e8c94a',
  goldDark: '#b8961f',
  text: '#f5f5f5',
  textMuted: '#999',
  textDim: '#666',
  border: 'rgba(255,255,255,0.08)',
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

  // Data states
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [orderCount, setOrderCount] = useState(0);

  // Order alarm
  const prevOrderCountRef = useRef(0);
  const alarmAudioRef = useRef(null);

  // ---- AUTH ----
  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace('/'); return; }
    fetch('/api/auth', { method: 'GET', headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => setAuthed(true))
      .catch(() => { localStorage.removeItem('adminToken'); router.replace('/'); })
      .finally(() => setLoading(false));
  }, [router]);

  // ---- LOAD DATA ----
  const loadBanners = useCallback(async () => { try { setBanners(await apiFetch('/api/banners')); } catch {} }, []);
  const loadFeatured = useCallback(async () => { try { setFeatured(await apiFetch('/api/featured')); } catch {} }, []);
  const loadMenu = useCallback(async () => { try { setCategories(await apiFetch('/api/menu')); } catch {} }, []);
  const loadCoupons = useCallback(async () => { try { setCoupons(await apiFetch('/api/coupons')); } catch {} }, []);
  const loadSettings = useCallback(async () => { try { setSettings(await apiFetch('/api/settings')); } catch {} }, []);
  const loadOrders = useCallback(async () => {
    try {
      const data = await apiFetch('/api/orders');
      const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
      setOrderCount(sorted.length);
    } catch {}
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadBanners(); loadFeatured(); loadMenu(); loadCoupons(); loadOrders(); loadSettings();
  }, [authed, loadBanners, loadFeatured, loadMenu, loadCoupons, loadOrders, loadSettings]);

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
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [authed]);

  // Initialize prevOrderCount on first load
  useEffect(() => {
    prevOrderCountRef.current = orderCount;
  }, []);

  function playAlarm() {
    try {
      if (!alarmAudioRef.current) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
      }
    } catch {}
  }

  function sendNotification(order) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 Yeni Sipariş!', { body: `Sipariş #${order.id?.slice(-6) || ''} - ${formatPrice(order.totalAmount || 0)}`, icon: '/images/logo.png' });
    }
  }

  // Request notification permission
  useEffect(() => {
    if (authed && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [authed]);

  // ---- LOGOUT ----
  function handleLogout() {
    localStorage.removeItem('adminToken');
    router.replace('/');
  }

  // ---- LOADING / AUTH GATE ----
  if (loading) return <div style={{ background: colors.bg, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: colors.gold, fontSize: 24, fontFamily: 'Outfit' }}>Yükleniyor...</div></div>;
  if (!authed) return null;

  const newOrders = orders.filter(o => o.status === 'received').length;

  const tabs = [
    { id: 'dashboard', icon: 'fa-solid fa-chart-pie', label: '📊 Dashboard' },
    { id: 'banners', icon: 'fa-solid fa-images', label: '🎠 Slider Bannerlar' },
    { id: 'featured', icon: 'fa-solid fa-star', label: '⭐ Süper Lezzetler' },
    { id: 'menu', icon: 'fa-solid fa-utensils', label: '🍽️ Menü Yönetimi' },
    { id: 'coupons', icon: 'fa-solid fa-ticket', label: '🎟️ Kupon Kodları' },
    { id: 'orders', icon: 'fa-solid fa-box', label: '📦 Siparişler', badge: newOrders },
    { id: 'settings', icon: 'fa-solid fa-store', label: '🏪 İşletme Ayarları' },
  ];

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: colors.text, display: 'flex', position: 'relative' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .admin-shimmer { background: linear-gradient(90deg, ${colors.gold} 0%, ${colors.goldLight} 40%, #fff 50%, ${colors.goldLight} 60%, ${colors.gold} 100%); background-size: 200% 100%; animation: shimmer 3s infinite linear; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .admin-card { background: ${colors.bgCard}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid ${colors.border}; border-radius: 16px; transition: all 0.3s ease; }
        .admin-card:hover { background: ${colors.bgCardHover}; border-color: rgba(212,175,55,0.2); }
        .admin-btn { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14px; transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 8px; }
        .admin-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
        .admin-btn:active { transform: translateY(0); }
        .admin-btn-gold { background: linear-gradient(135deg, ${colors.gold}, ${colors.goldLight}); color: #000; }
        .admin-btn-danger { background: ${colors.danger}; color: #fff; }
        .admin-btn-danger:hover { background: ${colors.dangerDark}; }
        .admin-btn-ghost { background: rgba(255,255,255,0.06); color: ${colors.text}; border: 1px solid ${colors.border}; }
        .admin-btn-ghost:hover { background: rgba(255,255,255,0.1); }
        .admin-btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; }
        .admin-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.06); border: 1px solid ${colors.border}; border-radius: 10px; color: ${colors.text}; font-family: 'Outfit', sans-serif; font-size: 14px; outline: none; transition: border-color 0.25s; box-sizing: border-box; }
        .admin-input:focus { border-color: ${colors.gold}; }
        .admin-input::placeholder { color: ${colors.textDim}; }
        .admin-select { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.06); border: 1px solid ${colors.border}; border-radius: 10px; color: ${colors.text}; font-family: 'Outfit', sans-serif; font-size: 14px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; }
        .admin-select option { background: #1a1a1a; color: #fff; }
        .admin-label { display: block; margin-bottom: 6px; font-size: 13px; color: ${colors.textMuted}; font-weight: 500; }
        .admin-pulse { width: 10px; height: 10px; border-radius: 50%; background: ${colors.danger}; animation: pulse 1.5s infinite; display: inline-block; }
        .admin-sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 998; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid ${colors.border}; font-size: 14px; }
        .admin-table th { color: ${colors.textMuted}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .admin-table tr:hover td { background: rgba(255,255,255,0.02); }
        .admin-textarea { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.06); border: 1px solid ${colors.border}; border-radius: 10px; color: ${colors.text}; font-family: 'Outfit', sans-serif; font-size: 14px; outline: none; resize: vertical; min-height: 80px; box-sizing: border-box; }
        .admin-textarea:focus { border-color: ${colors.gold}; }
        .admin-checkbox { width: 18px; height: 18px; accent-color: ${colors.gold}; cursor: pointer; }
        .admin-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
        .status-flow-btn { padding: 6px 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.04); color: ${colors.textMuted}; cursor: pointer; font-family: 'Outfit'; font-size: 11px; transition: all 0.2s; }
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

      {/* ===== MAIN CONTENT ===== */}
      <main className="admin-content" style={{ flex: 1, marginLeft: 260, minHeight: '100vh' }}>
        {/* Header */}
        <header style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(13,13,13,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: colors.text, fontSize: 20, cursor: 'pointer', padding: 8 }}>
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              {tabs.find(t => t.id === activeTab)?.label || 'Admin'}
            </h1>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Çıkış
          </button>
        </header>

        {/* Content */}
        <div style={{ padding: '24px', animation: 'fadeIn 0.35s ease' }} key={activeTab}>
          {activeTab === 'dashboard' && <DashboardTab banners={banners} featured={featured} categories={categories} coupons={coupons} orders={orders} />}
          {activeTab === 'banners' && <BannersTab banners={banners} reload={loadBanners} />}
          {activeTab === 'featured' && <FeaturedTab featured={featured} reload={loadFeatured} />}
          {activeTab === 'menu' && <MenuTab categories={categories} reload={loadMenu} />}
          {activeTab === 'coupons' && <CouponsTab coupons={coupons} reload={loadCoupons} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} reload={loadOrders} />}
          {activeTab === 'settings' && <SettingsTab settings={settings} reload={loadSettings} />}
        </div>
      </main>
    </div>
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
            {tab.badge > 0 && (
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="admin-pulse" />
                <span style={{ background: colors.danger, color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{tab.badge}</span>
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
function DashboardTab({ banners, featured, categories, coupons, orders }) {
  const totalMenuItems = categories.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status !== 'delivered').length;
  const activeCoupons = coupons.filter(c => c.isActive).length;

  const stats = [
    { icon: 'fa-solid fa-images', label: 'Banner', value: banners.length, color: '#3498db' },
    { icon: 'fa-solid fa-star', label: 'Süper Lezzet', value: featured.length, color: '#f39c12' },
    { icon: 'fa-solid fa-utensils', label: 'Menü Öğesi', value: totalMenuItems, color: '#27ae60' },
    { icon: 'fa-solid fa-layer-group', label: 'Kategori', value: categories.length, color: '#9b59b6' },
    { icon: 'fa-solid fa-ticket', label: 'Aktif Kupon', value: activeCoupons, color: '#e74c3c' },
    { icon: 'fa-solid fa-box', label: 'Toplam Sipariş', value: orders.length, color: colors.gold },
    { icon: 'fa-solid fa-clock', label: 'Bekleyen', value: pendingOrders, color: '#e67e22' },
    { icon: 'fa-solid fa-turkish-lira-sign', label: 'Toplam Gelir', value: formatPrice(totalRevenue), color: '#2ecc71' },
  ];

  return (
    <div>
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

      {/* Recent orders */}
      <div className="admin-card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: colors.gold }}></i> Son Siparişler
        </h3>
        {orders.length === 0 ? (
          <p style={{ color: colors.textMuted, textAlign: 'center', padding: 40 }}>Henüz sipariş yok</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Sipariş</th><th>Müşteri</th><th>Tutar</th><th>Durum</th><th>Tarih</th></tr></thead>
              <tbody>
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>#{o.id?.slice(-6)}</td>
                    <td>{o.customerName || o.customer?.name || '-'}</td>
                    <td style={{ color: colors.gold, fontWeight: 600 }}>{formatPrice(o.totalAmount || 0)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ color: colors.textMuted, fontSize: 13 }}>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// STATUS BADGE
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
              background: active ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
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
          <div key={idx} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${colors.border}` }}>
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
function ItemForm({ item, onSave, onCancel, showBadge = true, showHighlight = false }) {
  const [form, setForm] = useState({
    title: item?.title || '', emoji: item?.emoji || '', description: item?.description || '',
    price: item?.price || '', image: item?.image || '', badge: item?.badge || '',
    isHighlight: item?.isHighlight || false, ingredients: item?.ingredients || [],
    customizableIngredients: item?.customizableIngredients || [],
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
      </div>
      <div style={{ marginTop: 16 }}>
        <label className="admin-label">Açıklama</label>
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
        <p style={{ color: colors.textMuted, margin: 0 }}>{banners.length} banner kayıtlı</p>
        <button className="admin-btn admin-btn-gold" onClick={() => setEditing('new')}>
          <i className="fa-solid fa-plus"></i> Yeni Banner
        </button>
      </div>

      {editing && (
        <ItemForm item={editing === 'new' ? null : editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {banners.map((b, i) => (
          <div key={b.id} className="admin-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center', animation: `fadeIn 0.3s ease ${i * 0.05}s both`, flexWrap: 'wrap' }}>
            {b.image && <img src={b.image} alt={b.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, border: `1px solid ${colors.border}`, flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {b.emoji && <span>{b.emoji}</span>}
                <span className="admin-shimmer" style={{ fontWeight: 700, fontSize: 16 }}>{b.title}</span>
                {b.badge && <span className="admin-badge" style={{ background: 'rgba(212,175,55,0.15)', color: colors.gold }}>{b.badge}</span>}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: colors.textMuted, lineHeight: 1.4 }}>{b.description?.slice(0, 100)}...</p>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.gold, marginTop: 4 }}>{formatPrice(b.price)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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
        <p style={{ color: colors.textMuted, margin: 0 }}>{featured.length} süper lezzet kayıtlı</p>
        <button className="admin-btn admin-btn-gold" onClick={() => setEditing('new')}>
          <i className="fa-solid fa-plus"></i> Yeni Lezzet
        </button>
      </div>

      {editing && (
        <ItemForm item={editing === 'new' ? null : editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {featured.map((f, i) => (
          <div key={f.id} className="admin-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center', animation: `fadeIn 0.3s ease ${i * 0.05}s both`, flexWrap: 'wrap' }}>
            {f.image && <img src={f.image} alt={f.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, border: `1px solid ${colors.border}`, flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {f.emoji && <span>{f.emoji}</span>}
                <span style={{ fontWeight: 700, fontSize: 16 }}>{f.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: colors.textMuted, lineHeight: 1.4 }}>{f.description?.slice(0, 100)}...</p>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.gold, marginTop: 4 }}>{formatPrice(f.price)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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

  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.id === selectedCat)) {
      setSelectedCat(categories[0].id);
    }
  }, [categories, selectedCat]);

  const category = categories.find(c => c.id === selectedCat);
  const items = category?.items || [];

  async function handleSave(formData) {
    try {
      const updatedCats = categories.map(c => {
        if (c.id !== selectedCat) return c;
        if (editing === 'new') {
          return { ...c, items: [...c.items, { id: generateId('item'), ...formData }] };
        }
        return { ...c, items: c.items.map(it => it.id === editing.id ? { ...it, ...formData } : it) };
      });
      await apiFetch('/api/menu', { method: 'PUT', body: JSON.stringify(updatedCats) });
      setEditing(null);
      reload();
    } catch (e) { alert('Hata: ' + e.message); }
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

  return (
    <div>
      {/* Category selector */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label className="admin-label">Kategori Seçin</label>
          <select className="admin-select" value={selectedCat} onChange={e => { setSelectedCat(e.target.value); setEditing(null); }}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.title} ({c.items?.length || 0} ürün)</option>)}
          </select>
        </div>
        <button className="admin-btn admin-btn-gold" onClick={() => setEditing('new')} style={{ marginTop: 20 }}>
          <i className="fa-solid fa-plus"></i> Yeni Ürün
        </button>
      </div>

      {editing && (
        <ItemForm item={editing === 'new' ? null : editing} onSave={handleSave} onCancel={() => setEditing(null)} showHighlight={true} />
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item, i) => (
          <div key={item.id} className="admin-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center', animation: `fadeIn 0.3s ease ${i * 0.04}s both`, flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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
    if (!c.isActive) return { label: 'Pasif', color: colors.textDim, bg: 'rgba(255,255,255,0.05)' };
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
                background: filterTab === tab.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                color: filterTab === tab.id ? '#000' : '#fff',
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
            style={{ width: 'auto', padding: '8px 12px', height: 'auto', fontSize: '14px' }}
          >
            <option value="all">Tüm Zamanlar</option>
            <option value="daily">Günlük (Bugün)</option>
            <option value="weekly">Haftalık</option>
            <option value="monthly">Aylık</option>
            <option value="custom">Özel Tarih</option>
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
              <button className="admin-btn" style={{ background: colors.danger, color: '#fff' }} onClick={() => updateStatus(cancelModal.orderId, 'cancelled', cancelModal.note)}>İptali Onayla</button>
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
                                  <td style={{ fontWeight: 500 }}>{item.title || item.name}</td>
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
                            <div style={{ fontSize: '13px', color: '#fff' }}>İptal Notu: {order.statusHistory.find(h => h.status === 'cancelled').note}</div>
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

// ============================================================
// SETTINGS TAB
// ============================================================
function SettingsTab({ settings, reload }) {
  const [form, setForm] = useState(settings || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  async function handleSave() {
    setSaving(true);
    try {
      await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(form) });
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
            <select className="admin-input" value={form.isStoreOpen ? 'true' : 'false'} onChange={e => setForm({...form, isStoreOpen: e.target.value === 'true'})}>
              <option value="true">Açık (Sipariş Alınabilir)</option>
              <option value="false">Kapalı (Bakım / Servis Dışı)</option>
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
            <div style={{ marginBottom: 6, fontSize: 13, color: colors.textMuted }}>Ortalama Kurye Ücreti (Sepet İçi Uyarı) (TL)</div>
            <input type="number" className="admin-input" value={form.courierFee || ''} onChange={e => setForm({...form, courierFee: Number(e.target.value)})} />
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

        </div>
      </div>
    </div>
  );
}

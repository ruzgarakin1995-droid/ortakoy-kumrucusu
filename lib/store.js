// Data storage abstraction
// Development: In-memory store (persists during server process lifetime)
// Production: Vercel KV (persistent Redis)

import { initialBanners, initialFeatured, initialCategories, initialCoupons, initialOrders, initialSettings, initialExpenses } from './initialData';

// In-memory fallback store
const memoryStore = globalThis.memoryStore || new Map();
if (!globalThis.memoryStore) globalThis.memoryStore = memoryStore;

let initialized = globalThis.storeInitialized || false;

function initializeMemoryStore() {
  if (initialized) return;
  memoryStore.set('banners', JSON.parse(JSON.stringify(initialBanners)));
  memoryStore.set('featured', JSON.parse(JSON.stringify(initialFeatured)));
  memoryStore.set('categories', JSON.parse(JSON.stringify(initialCategories)));
  memoryStore.set('coupons', JSON.parse(JSON.stringify(initialCoupons)));
  memoryStore.set('orders', JSON.parse(JSON.stringify(initialOrders)));
  memoryStore.set('settings', JSON.parse(JSON.stringify(initialSettings)));
  memoryStore.set('expenses', JSON.parse(JSON.stringify(initialExpenses)));
  memoryStore.set('sessions', []);
  initialized = true;
  globalThis.storeInitialized = true;
}

// Check if Vercel KV is available
function getKVUrl() { return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.STORAGE_REST_API_URL || process.env.STORAGE_REDIS_REST_URL || Object.entries(process.env).find(([k]) => k.endsWith('_REST_URL') || k.endsWith('_REST_API_URL'))?.[1]; }
function getKVToken() { return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.STORAGE_REST_API_TOKEN || process.env.STORAGE_REDIS_REST_TOKEN || Object.entries(process.env).find(([k]) => k.endsWith('_REST_TOKEN') || k.endsWith('_REST_API_TOKEN'))?.[1]; }

function isKVAvailable() {
  return !!((getKVUrl() && getKVToken()) || process.env.KV_REDIS_URL);
}

let redisClient = null;

async function getKV() {
  if (getKVUrl() && getKVToken()) {
    const { createClient } = await import('@vercel/kv');
    return createClient({ url: getKVUrl(), token: getKVToken() });
  } else if (process.env.KV_REDIS_URL) {
    if (!redisClient) {
      const Redis = (await import('ioredis')).default;
      redisClient = new Redis(process.env.KV_REDIS_URL);
      redisClient.originalSet = redisClient.set;
      redisClient.set = async (k, v) => await redisClient.originalSet(k, JSON.stringify(v));
      redisClient.originalGet = redisClient.get;
      redisClient.get = async (k) => {
        const val = await redisClient.originalGet(k);
        if (!val) return null;
        try { return JSON.parse(val); } catch(e) { return val; }
      }
    }
    return redisClient;
  }
}

// Generic get/set functions
export async function getData(key) {
  if (isKVAvailable()) {
    try {
      const kv = await getKV();
      const data = await kv.get(key);
      if (data === null) {
        // Initialize with default data
        const defaults = getDefaultData(key);
        if (defaults !== undefined) {
          await kv.set(key, defaults);
          return defaults;
        }
      }
      return data;
    } catch (e) {
      console.error('KV error, falling back to memory:', e);
    }
  }
  
  initializeMemoryStore();
  return memoryStore.get(key) || null;
}

export async function setData(key, value) {
  if (isKVAvailable()) {
    try {
      const kv = await getKV();
      await kv.set(key, value);
      return;
    } catch (e) {
      console.error('KV error, falling back to memory:', e);
    }
  }
  
  initializeMemoryStore();
  memoryStore.set(key, value);
}

function getDefaultData(key) {
  const defaults = {
    banners: initialBanners,
    featured: initialFeatured,
    categories: initialCategories,
    coupons: initialCoupons,
    orders: initialOrders,
    settings: initialSettings,
    expenses: initialExpenses,
    sessions: []
  };
  return defaults[key];
}

// ==================== BANNERS ====================
export async function getBanners() {
  return (await getData('banners')) || [];
}

export async function setBanners(banners) {
  await setData('banners', banners);
}

// ==================== FEATURED ====================
export async function getFeatured() {
  return (await getData('featured')) || [];
}

export async function setFeatured(featured) {
  await setData('featured', featured);
}

// ==================== CATEGORIES ====================
export async function getCategories() {
  return (await getData('categories')) || [];
}

export async function setCategories(categories) {
  await setData('categories', categories);
}

// ==================== COUPONS ====================
export async function getCoupons() {
  return (await getData('coupons')) || [];
}

export async function setCoupons(coupons) {
  await setData('coupons', coupons);
}

// ==================== ORDERS ====================
export async function getOrders() {
  return (await getData('orders')) || [];
}

export async function setOrders(orders) {
  await setData('orders', orders);
}

// ==================== SESSIONS ====================
export async function getSessions() {
  return (await getData('sessions')) || [];
}

export async function setSessions(sessions) {
  await setData('sessions', sessions);
}

// ==================== AUTH HELPERS ====================
export async function createSession(token) {
  const sessions = await getSessions();
  sessions.push({ token, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
  await setSessions(sessions);
}

export async function validateSession(token) {
  if (!token) return false;
  
  // Stateless check for Vercel Serverless Functions
  const expectedToken = 'static-admin-token-' + (process.env.ADMIN_PASSWORD || 'Burak.baser0123');
  if (token === expectedToken) return true;

  // Fallback to memory store check
  const sessions = await getSessions();
  const now = Date.now();
  // Filter out expired sessions (24 hours)
  const validSessions = sessions.filter(s => (now - new Date(s.createdAt).getTime()) < 24 * 60 * 60 * 1000);
  if (sessions.length !== validSessions.length) {
    await setData('sessions', validSessions);
  }
  return validSessions.some(s => s.token === token);
}

// ==================== SETTINGS ====================
export async function getSettings() { return getData('settings'); }
export async function setSettings(settings) { return setData('settings', settings); }

export async function getExpenses() { return getData('expenses'); }
export async function setExpenses(expenses) { return setData('expenses', expenses); }

export async function removeSession(token) {
  const sessions = await getSessions();
  await setSessions(sessions.filter(s => s.token !== token));
}

// ==================== VAPID KEYS (PUSH NOTIFICATIONS) ====================
export async function getVapidKeys() {
  return (await getData('vapidKeys')) || null;
}

export async function setVapidKeys(keys) {
  await setData('vapidKeys', keys);
}

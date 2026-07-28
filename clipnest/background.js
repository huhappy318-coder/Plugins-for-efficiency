const api = typeof browser !== 'undefined' ? browser : chrome;
const MAX_ITEMS = 50;

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    const { type, data } = message || {};
    if (!['text', 'link', 'image'].includes(type) || !data) throw new Error('Unsupported clipboard item');
    await handleMessage(type, data);
    sendResponse({ status: 'success' });
  })().catch((error) => sendResponse({ status: 'error', error: error.message }));
  return true;
});

async function getStorage(key) { if (typeof browser !== 'undefined') return api.storage.local.get(key); return new Promise((resolve) => api.storage.local.get(key, resolve)); }
async function setStorage(value) { if (typeof browser !== 'undefined') return api.storage.local.set(value); return new Promise((resolve) => api.storage.local.set(value, resolve)); }

async function handleMessage(type, data) {
  const key = `clipnest_${type}`;
  const stored = await getStorage(key);
  const item = type === 'image' ? { id: generateId(), src: data.src, pageUrl: data.pageUrl, time: Date.now() } : { id: generateId(), content: data.content, time: Date.now() };
  const isSame = (candidate) => type === 'image' ? candidate.src === item.src && candidate.pageUrl === item.pageUrl : candidate.content === item.content;
  const items = [item, ...(Array.isArray(stored[key]) ? stored[key] : []).filter((candidate) => !isSame(candidate))];
  await setStorage({ [key]: items.slice(0, MAX_ITEMS) });
  if (items.length > MAX_ITEMS) showNotification();
}

function generateId() { return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`; }
function showNotification() { api.notifications.create('storage-full', { type: 'basic', iconUrl: api.runtime.getURL('icons/icon48.png'), title: 'ClipNest', message: '已达到 50 条记录上限，最早的一条已移除。' }); }

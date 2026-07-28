const api = typeof browser !== 'undefined' ? browser : chrome;
const types = ['text', 'link', 'image'];
const state = { activeType: 'text', items: { text: [], link: [], image: [] } };

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));
  document.getElementById('clear-btn').addEventListener('click', clearAll);
  loadData();
});

async function storageGet(keys) {
  if (typeof browser !== 'undefined') return api.storage.local.get(keys);
  return new Promise((resolve) => api.storage.local.get(keys, resolve));
}

async function storageSet(value) {
  if (typeof browser !== 'undefined') return api.storage.local.set(value);
  return new Promise((resolve) => api.storage.local.set(value, resolve));
}

async function loadData() {
  const data = await storageGet(types.map((type) => `clipnest_${type}`));
  types.forEach((type) => { state.items[type] = Array.isArray(data[`clipnest_${type}`]) ? data[`clipnest_${type}`] : []; });
  renderAll();
}

function activateTab(type) {
  state.activeType = type;
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === type));
  document.querySelectorAll('.tab-content').forEach((panel) => panel.classList.toggle('active', panel.id === `${type}-content`));
  const tab = document.querySelector('.tab.active');
  const indicator = document.querySelector('.tab-indicator');
  indicator.style.left = `${tab.offsetLeft}px`;
  indicator.style.width = `${tab.offsetWidth}px`;
  updateCount();
}

function renderAll() { types.forEach((type) => renderList(type)); activateTab(state.activeType); }

function renderList(type) {
  const list = document.getElementById(`${type}-list`);
  list.replaceChildren();
  if (!state.items[type].length) {
    list.append(createText('p', 'empty-state', '还没有保存任何内容'));
    return;
  }
  state.items[type].forEach((item) => list.append(createItem(type, item)));
}

function createItem(type, item) {
  const row = document.createElement('div');
  row.className = `item ${type}-item`;
  row.dataset.id = item.id;
  const content = document.createElement('div');
  content.className = 'content';
  const actions = document.createElement('div');
  actions.className = 'actions';
  if (type === 'image') {
    const image = document.createElement('img');
    image.className = 'thumbnail'; image.src = item.src; image.alt = '已记录图片';
    image.addEventListener('error', () => image.replaceWith(createText('div', 'placeholder', '图片已失效')));
    content.append(image, createText('div', 'source', `来自：${safeDomain(item.pageUrl)}`), createText('div', 'time', formatTime(item.time)));
    actions.append(createButton('跳转来源页', () => openLink(item.pageUrl)), createButton('删除', () => deleteItem(type, item.id), 'delete-btn'));
  } else {
    const value = String(item.content || '');
    const preview = createText('div', type === 'link' ? 'domain' : 'preview', type === 'link' ? safeDomain(value) : value.slice(0, 50));
    if (type === 'link') preview.addEventListener('click', () => openLink(value));
    content.append(preview, createText('div', 'time', formatTime(item.time)));
    actions.append(createButton('复制', (button) => copyText(value, button), 'copy-btn'), createButton('删除', () => deleteItem(type, item.id), 'delete-btn'));
  }
  row.append(content, actions);
  return row;
}

function createText(tag, className, text) { const element = document.createElement(tag); element.className = className; element.textContent = text; return element; }
function createButton(label, handler, className = '') { const button = document.createElement('button'); button.type = 'button'; button.className = `btn ${className}`.trim(); button.textContent = label; button.addEventListener('click', () => handler(button)); return button; }
async function copyText(text, button) { await navigator.clipboard.writeText(text); const original = button.textContent; button.textContent = '已复制'; setTimeout(() => { button.textContent = original; }, 1200); }
function openLink(url) { api.tabs.create({ url }); }
async function deleteItem(type, id) { state.items[type] = state.items[type].filter((item) => item.id !== id); await storageSet({ [`clipnest_${type}`]: state.items[type] }); renderList(type); updateCount(); }
async function clearAll() { if (!confirm('确定要清空所有剪贴板历史记录吗？此操作不可恢复。')) return; types.forEach((type) => { state.items[type] = []; }); await storageSet({ clipnest_text: [], clipnest_link: [], clipnest_image: [] }); renderAll(); }
function updateCount() { document.getElementById('count').textContent = String(state.items[state.activeType].length); }
function safeDomain(value) { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return '无效地址'; } }
function formatTime(timestamp) { const diff = Date.now() - Number(timestamp); if (diff < 60_000) return '刚刚'; if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`; if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`; return new Date(timestamp).toLocaleDateString('zh-CN'); }

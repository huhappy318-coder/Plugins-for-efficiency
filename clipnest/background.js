// 兼容 Chrome 和 Firefox 的 API
const api = typeof browser !== 'undefined' ? browser : chrome;

// Service Worker 安装事件（V3 要求）
self.addEventListener('install', () => {
    console.log('ClipNest Service Worker installed');
    // 立即激活，不需要等待旧的 Service Worker 完成
    self.skipWaiting();
});

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
    console.log('ClipNest Service Worker activated');
    // 立即控制所有打开的标签页
    event.waitUntil(self.clients.claim());
});

// 监听来自 content.js 的消息
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        const { type, data } = message;
        if (type && data) {
            handleMessage(type, data);
        }
        sendResponse({ status: 'success' });
    } catch (error) {
        console.error('处理消息失败:', error);
        sendResponse({ status: 'error', error: error.message });
    }
    // 保持消息通道开放
    return true;
});

// 处理消息
async function handleMessage(type, data) {
    const key = `clipnest_${type}`;
    const now = Date.now();
    const id = generateId();

    // 获取现有数据
    const storageData = await new Promise((resolve) => {
        api.storage.local.get(key, resolve);
    });

    let items = storageData[key] || [];

    // 去重逻辑
    if (type === 'text' || type === 'link') {
        items = items.filter(item => item.content !== data.content);
    } else if (type === 'image') {
        items = items.filter(item => item.src !== data.src || item.pageUrl !== data.pageUrl);
    }

    // 添加新项到顶部
    const newItem = type === 'image'
        ? { id, src: data.src, pageUrl: data.pageUrl, time: now }
        : { id, content: data.content, time: now };

    items.unshift(newItem);

    // 限制最多保存50条
    if (items.length > 50) {
        items.pop();
        showNotification();
    }

    // 保存到 storage
    await new Promise((resolve) => {
        api.storage.local.set({ [key]: items }, resolve);
    });
}

// 生成唯一 ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 显示通知
function showNotification() {
    const options = {
        type: 'basic',
        iconUrl: api.runtime.getURL('icons/icon48.png'),
        title: 'ClipNest',
        message: '已存满50条，最早的一条已自动移除'
    };

    try {
        api.notifications.create('storage-full', options);
    } catch (error) {
        console.error('显示通知失败:', error);
    }
}
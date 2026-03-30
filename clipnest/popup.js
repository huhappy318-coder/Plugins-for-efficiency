// 兼容 Chrome 和 Firefox 的 API
const api = typeof browser !== 'undefined' ? browser : chrome;

// 页面加载时读取数据
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initEventListeners();
});

// 初始化事件监听器
function initEventListeners() {
    // Tab 切换
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', handleTabClick);
    });

    // 清空全部按钮
    document.getElementById('clear-btn').addEventListener('click', handleClearAll);
}

// 加载存储的数据
async function loadData() {
    try {
        const data = await new Promise((resolve) => {
            api.storage.local.get(['clipnest_text', 'clipnest_link', 'clipnest_image'], resolve);
        });

        // 渲染各个列表
        renderTextList(data.clipnest_text || []);
        renderLinkList(data.clipnest_link || []);
        renderImageList(data.clipnest_image || []);

        // 更新计数
        updateCount();
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// 渲染文字列表
function renderTextList(items) {
    const list = document.getElementById('text-list');

    if (items.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
                <p>还没有复制过任何文字</p>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map(item => `
        <div class="item text-item" data-id="${item.id}">
            <div class="content">
                <div class="preview">${escapeHtml(item.content.substring(0, 50))}${item.content.length > 50 ? '...' : ''}</div>
                <div class="time">${formatTime(item.time)}</div>
            </div>
            <div class="actions">
                <button class="btn copy-btn" onclick="copyText('${item.content}', this)">复制</button>
                <button class="btn delete-btn" onclick="deleteItem('text', '${item.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 渲染链接列表
function renderLinkList(items) {
    const list = document.getElementById('link-list');

    if (items.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <p>还没有复制过任何链接</p>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map(item => {
        const url = new URL(item.content);
        const domain = url.hostname.replace('www.', '');
        return `
            <div class="item link-item" data-id="${item.id}">
                <div class="content">
                    <div class="domain">${domain}</div>
                    <div class="url" onclick="openLink('${item.content}')">${escapeHtml(item.content)}</div>
                    <div class="time">${formatTime(item.time)}</div>
                </div>
                <div class="actions">
                    <button class="btn copy-btn" onclick="copyText('${item.content}', this)">复制</button>
                    <button class="btn delete-btn" onclick="deleteItem('link', '${item.id}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染图片列表
function renderImageList(items) {
    const list = document.getElementById('image-list');

    if (items.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>还没有复制过任何图片</p>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map(item => {
        const pageUrl = new URL(item.pageUrl);
        const domain = pageUrl.hostname.replace('www.', '');
        return `
            <div class="item image-item" data-id="${item.id}">
                <div class="content">
                    <img class="thumbnail" src="${item.src}" alt="图片" onload="this.style.opacity=1" onerror="handleImageError(this)"/>
                    <div class="source">来自：${domain}</div>
                    <div class="time">${formatTime(item.time)}</div>
                </div>
                <div class="actions">
                    <button class="btn jump-btn" onclick="openLink('${item.pageUrl}')">跳转来源页</button>
                    <button class="btn delete-btn" onclick="deleteItem('image', '${item.id}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

// Tab 切换处理
function handleTabClick(event) {
    const tab = event.target;
    const tabType = tab.dataset.tab;

    // 更新 Tab 激活状态
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // 更新 Tab 内容显示
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabType}-content`).classList.add('active');

    // 更新 Tab 指示器位置
    const activeTab = document.querySelector('.tab.active');
    const indicator = document.querySelector('.tab-indicator');
    indicator.style.left = activeTab.offsetLeft + 'px';
    indicator.style.width = activeTab.offsetWidth + 'px';

    // 更新计数
    updateCount();
}

// 复制文本到剪贴板
function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✓ 已复制';
        btn.classList.add('copied');

        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 1500);
    }).catch(err => {
        console.error('复制失败:', err);
    });
}

// 打开链接
function openLink(url) {
    api.tabs.create({ url });
}

// 删除单个项目
async function deleteItem(type, id) {
    try {
        const key = `clipnest_${type}`;
        const data = await new Promise((resolve) => {
            api.storage.local.get(key, resolve);
        });

        const items = data[key] || [];
        const updatedItems = items.filter(item => item.id !== id);

        await new Promise((resolve) => {
            api.storage.local.set({ [key]: updatedItems }, resolve);
        });

        // 动画效果
        const item = document.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.classList.add('fade-out');
            setTimeout(() => {
                item.remove();
                // 重新渲染列表以显示空状态
                if (type === 'text') renderTextList(updatedItems);
                if (type === 'link') renderLinkList(updatedItems);
                if (type === 'image') renderImageList(updatedItems);
                updateCount();
            }, 300);
        }
    } catch (error) {
        console.error('删除失败:', error);
    }
}

// 清空全部
async function handleClearAll() {
    const confirmed = confirm('确定要清空所有剪贴板历史记录吗？此操作不可恢复！');
    if (!confirmed) return;

    try {
        await new Promise((resolve) => {
            api.storage.local.set({
                clipnest_text: [],
                clipnest_link: [],
                clipnest_image: []
            }, resolve);
        });

        // 重新渲染列表
        renderTextList([]);
        renderLinkList([]);
        renderImageList([]);
        updateCount();
    } catch (error) {
        console.error('清空失败:', error);
    }
}

// 更新计数
function updateCount() {
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    let count = 0;

    if (activeTab === 'text') {
        const list = document.getElementById('text-list');
        count = list.children.length > 0 && list.children[0].classList.contains('empty-state') ? 0 : list.children.length;
    } else if (activeTab === 'link') {
        const list = document.getElementById('link-list');
        count = list.children.length > 0 && list.children[0].classList.contains('empty-state') ? 0 : list.children.length;
    } else if (activeTab === 'image') {
        const list = document.getElementById('image-list');
        count = list.children.length > 0 && list.children[0].classList.contains('empty-state') ? 0 : list.children.length;
    }

    document.getElementById('count').textContent = count;
}

// 格式化时间
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    // 小于1分钟
    if (diff < 60000) {
        return '刚刚';
    }

    // 小于1小时
    if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
    }

    // 小于24小时
    if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
    }

    // 大于等于24小时
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// HTML 转义
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"]/g, m => map[m]);
}

// 图片加载失败处理
function handleImageError(img) {
    img.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.textContent = '图片已失效';
    img.parentNode.insertBefore(placeholder, img.nextSibling);
}
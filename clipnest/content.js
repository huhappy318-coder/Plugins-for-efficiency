// 兼容 Chrome 和 Firefox 的 API
const api = typeof browser !== 'undefined' ? browser : chrome;

// 监听 copy 事件
document.addEventListener('copy', (e) => {
    try {
        const selection = window.getSelection().toString().trim();
        if (selection) {
            // 判断是链接还是文字
            if (/^https?:\/\//.test(selection)) {
                sendToBackground('link', { content: selection });
            } else {
                sendToBackground('text', { content: selection });
            }
        }
    } catch (error) {
        console.error('监听复制事件失败:', error);
    }
});

// 监听图片元素的 copy 和 contextmenu 事件
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('copy', (e) => {
            try {
                sendToBackground('image', {
                    src: img.src,
                    pageUrl: window.location.href
                });
            } catch (error) {
                console.error('复制图片失败:', error);
            }
        });

        img.addEventListener('contextmenu', (e) => {
            // 右键菜单也可以捕获图片信息
            try {
                sendToBackground('image', {
                    src: img.src,
                    pageUrl: window.location.href
                });
            } catch (error) {
                console.error('右键菜单捕获图片失败:', error);
            }
        });
    });
});

// 发送消息到 background.js
function sendToBackground(type, data) {
    const message = {
        type: type,
        data: data
    };

    api.runtime.sendMessage(message, (response) => {
        if (api.runtime.lastError) {
            console.error('发送消息失败:', api.runtime.lastError);
        }
    });
}
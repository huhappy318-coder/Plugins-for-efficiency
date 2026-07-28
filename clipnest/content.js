const api = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('copy', (event) => {
  const image = event.target instanceof Element ? event.target.closest('img') : null;
  if (image && image.src) {
    sendToBackground('image', { src: image.src, pageUrl: location.href });
    return;
  }
  const selection = window.getSelection().toString().trim();
  if (!selection) return;
  sendToBackground(/^https?:\/\//i.test(selection) ? 'link' : 'text', { content: selection });
}, true);

function sendToBackground(type, data) {
  try {
    const result = api.runtime.sendMessage({ type, data });
    if (result && typeof result.catch === 'function') result.catch(() => {});
  } catch (error) {
    console.warn('ClipNest capture failed', error);
  }
}

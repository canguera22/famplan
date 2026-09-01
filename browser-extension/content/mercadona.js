/**
 * Isolated-world content script on https://tienda.mercadona.es/*.
 *
 * It owns no Mercadona logic. Its only job is to relay adapter calls between
 * the extension service worker and the injected page script that runs in the
 * page's own authenticated context (content/mercadona-page.js).
 */

const CHANNEL_REQ = "mesa:page-request";
const CHANNEL_RES = "mesa:page-response";

const pending = new Map();
let seq = 0;

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const msg = event.data;
  if (!msg || msg.channel !== CHANNEL_RES) return;
  const entry = pending.get(msg.id);
  if (!entry) return;

  if (msg.progress) {
    entry.onProgress?.(msg.progress);
    return;
  }
  pending.delete(msg.id);
  entry.resolve(msg.ok ? { ok: true, value: msg.value } : { ok: false, error: msg.error });
});

function callAdapter(method, args, onProgress) {
  const id = `mesa-${Date.now()}-${seq++}`;
  return new Promise((resolve) => {
    pending.set(id, { resolve, onProgress });
    window.postMessage({ channel: CHANNEL_REQ, id, method, args }, location.origin);
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        resolve({ ok: false, error: { message: "Mercadona page script did not respond." } });
      }
    }, 120000);
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "mesa:adapter-call") return false;
  callAdapter(message.method, message.args ?? [], (progress) => {
    chrome.runtime.sendMessage({ type: "mesa:adapter-event", jobId: message.jobId, progress }).catch(() => {});
  }).then(sendResponse);
  return true;
});

function detectMercadonaPage() {
  return { isMercadona: location.hostname.endsWith("mercadona.es"), href: location.href };
}
void detectMercadonaPage;

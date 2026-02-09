export {};

type BridgeMessage<TPayload = any> = {
  type: string;
  id?: string;
  timestamp?: number;
  payload?: TPayload;
  response?: any;
};

declare const acquireVsCodeApi: () => { postMessage: (msg: any) => void };

const vscode = acquireVsCodeApi();

let currentResult: any = null;

function post(type: string, payload?: any): void {
  vscode.postMessage({ type, id: genId(), timestamp: Date.now(), payload });
}

function genId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = { zh: '中文', en: 'English', ja: '日本語', auto: '自动' };
  return names[code] || code;
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms)) return '';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function renderResult(result: any): void {
  const app = document.getElementById('app');
  if (!app) return;

  if (!result) {
    app.innerHTML = `<p style="color: var(--vscode-descriptionForeground);">暂无翻译结果</p>`;
    return;
  }

  const translation = String(result.translation || '');
  const pronunciation = String(result.pronunciation || '');
  const alternatives: string[] = Array.isArray(result.alternatives) ? result.alternatives : [];
  const meta = result.meta || {};

  const lang = meta.sourceLang && meta.targetLang
    ? `${getLanguageName(meta.sourceLang)} → ${getLanguageName(meta.targetLang)}`
    : '';

  app.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="font-size: 14px; line-height: 1.6;">${escapeHtml(translation)}</div>
      ${pronunciation ? `<div style="font-style: italic; color: var(--vscode-textLink-foreground);">${escapeHtml(pronunciation)}</div>` : ''}

      ${(lang || meta.provider || meta.duration) ? `
        <div style="font-size: 11px; color: var(--vscode-descriptionForeground); display:flex; gap:10px; flex-wrap: wrap;">
          ${lang ? `<span>${escapeHtml(lang)}</span>` : ''}
          ${meta.provider ? `<span>${escapeHtml(String(meta.provider))}</span>` : ''}
          ${meta.duration ? `<span>${escapeHtml(formatDuration(Number(meta.duration)))}</span>` : ''}
        </div>
      ` : ''}

      <div style="display:flex; gap:8px;">
        <button class="action-copy" style="flex:1;">复制</button>
        <button class="action-expand" style="flex:1;">详情</button>
        <button class="action-replace" style="flex:1;">替换</button>
      </div>

      ${alternatives.length ? `
        <div style="border-top:1px solid var(--vscode-panel-border); padding-top:8px;">
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">其他翻译</div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${alternatives.map((alt, i) => `<div class="alternative-item" data-index="${i}" style="cursor:pointer; padding:4px 0;">${escapeHtml(String(alt))}</div>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function showProgress(message?: string): void {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `<p style="color: var(--vscode-descriptionForeground);">${escapeHtml(message || '正在翻译...')}</p>`;
}

function showError(error: string): void {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `<p style="color: var(--vscode-errorForeground);">${escapeHtml(error)}</p>`;
}

window.addEventListener('message', (event: MessageEvent<BridgeMessage>) => {
  const message = event.data;
  if (!message || !message.type) return;

  if (message.type === 'translate.result') {
    currentResult = message.payload?.result;
    renderResult(currentResult);
  } else if (message.type === 'translate.progress') {
    showProgress(message.payload?.message);
  } else if (message.type === 'translate.error') {
    showError(String(message.payload?.error || '翻译失败'));
  }
});

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  if (target.classList.contains('action-copy')) {
    post('action.copy');
  } else if (target.classList.contains('action-expand')) {
    post('action.expand');
  } else if (target.classList.contains('action-replace')) {
    post('action.replace');
  } else if (target.classList.contains('alternative-item')) {
    const index = Number(target.getAttribute('data-index'));
    if (Number.isFinite(index)) {
      post('action.selectAlternative', { index });
    }
  }
});

post('panel.focus');
showProgress('等待翻译结果...');

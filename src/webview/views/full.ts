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

function render(): void {
  const app = document.getElementById('app');
  if (!app) return;

  if (!currentResult) {
    app.innerHTML = `<p style="color: var(--vscode-descriptionForeground);">暂无翻译结果</p>`;
    return;
  }

  const r = currentResult;
  const alternatives: string[] = Array.isArray(r.alternatives) ? r.alternatives : [];
  const explanations: any[] = Array.isArray(r.explanations) ? r.explanations : [];
  const examples: any[] = Array.isArray(r.examples) ? r.examples : [];

  app.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div>
        <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">原文</div>
        <div style="font-size: 13px; color: var(--vscode-descriptionForeground);">${escapeHtml(String(r.original || ''))}</div>
      </div>

      <div>
        <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">翻译</div>
        <div style="font-size: 16px; line-height: 1.7; padding: 12px; border-left: 3px solid var(--vscode-button-primaryBackground); background: var(--vscode-textBlockQuote-background);">${escapeHtml(String(r.translation || ''))}</div>
        ${r.pronunciation ? `<div style="margin-top:8px; font-style: italic; color: var(--vscode-textLink-foreground);">${escapeHtml(String(r.pronunciation))}</div>` : ''}
      </div>

      ${alternatives.length ? `
        <div>
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">其他翻译</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${alternatives.map((alt, i) => `<div class="alternative-item" data-index="${i}" style="cursor:pointer; padding:8px; background: var(--vscode-editor-inactiveSelectionBackground);">${escapeHtml(String(alt))}</div>`).join('')}
          </div>
        </div>
      ` : ''}

      ${explanations.length ? `
        <div>
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">词汇/释义</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${explanations.map((e) => `<div style="padding:8px; background: var(--vscode-editor-inactiveSelectionBackground);">
              <div style="font-weight:600;">${escapeHtml(String(e.word || ''))}</div>
              <div style="color: var(--vscode-descriptionForeground);">${escapeHtml(String(e.meaning || e.definition || ''))}</div>
            </div>`).join('')}
          </div>
        </div>
      ` : ''}

      ${examples.length ? `
        <div>
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">例句</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${examples.map((ex) => `<div style="padding:8px; background: var(--vscode-editor-inactiveSelectionBackground);">
              <div style="color: var(--vscode-descriptionForeground);">${escapeHtml(String(ex.original || ex.source || ''))}</div>
              <div>${escapeHtml(String(ex.translation || ex.target || ''))}</div>
            </div>`).join('')}
          </div>
        </div>
      ` : ''}

      <div style="display:flex; gap:8px;">
        <button class="action-copy" style="flex:1;">复制</button>
        <button class="action-replace" style="flex:1;">替换</button>
        <button class="action-sendToSimple" style="flex:1;">回到简版</button>
      </div>
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
    render();
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
  } else if (target.classList.contains('action-replace')) {
    post('action.replace');
  } else if (target.classList.contains('action-sendToSimple')) {
    post('action.sendToSimple');
  } else if (target.classList.contains('alternative-item')) {
    const index = Number(target.getAttribute('data-index'));
    if (Number.isFinite(index)) {
      post('action.selectAlternative', { index });
    }
  }
});

post('panel.focus');
showProgress('等待翻译结果...');

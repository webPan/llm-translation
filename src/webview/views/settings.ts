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

const pending = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void; timeout: number }>();

function genId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function post(type: string, payload?: any): void {
  vscode.postMessage({ type, id: genId(), timestamp: Date.now(), payload });
}

function request(type: string, payload?: any): Promise<any> {
  const id = genId();
  const message = { type, id, timestamp: Date.now(), payload };

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Request timeout: ${type}`));
    }, 15000);

    pending.set(id, { resolve, reject, timeout });
    vscode.postMessage(message);
  });
}

window.addEventListener('message', (event: MessageEvent<BridgeMessage>) => {
  const message = event.data;
  if (!message) return;

  if (message.id && Object.prototype.hasOwnProperty.call(message, 'response')) {
    const p = pending.get(message.id);
    if (!p) return;
    window.clearTimeout(p.timeout);
    pending.delete(message.id);

    const resp = message.response;
    if (resp && typeof resp === 'object' && 'error' in resp) {
      p.reject(new Error(String((resp as any).error)));
    } else {
      p.resolve(resp);
    }

    return;
  }
});

async function loadConfiguration(): Promise<void> {
  const config = await request('config.get');
  const defaultProvider = document.getElementById('default-provider') as HTMLSelectElement | null;
  const displayMode = document.getElementById('display-mode') as HTMLSelectElement | null;
  const targetLang = document.getElementById('target-lang') as HTMLSelectElement | null;

  if (defaultProvider) defaultProvider.value = config?.defaultProvider || 'deepseek';
  if (displayMode) displayMode.value = config?.displayMode || 'simple';
  if (targetLang) targetLang.value = config?.defaultTargetLang || 'zh';

  await loadProviders();
}

async function loadProviders(): Promise<void> {
  const data = await request('config.providers.get');
  const providers = data?.providers ? Object.values(data.providers) as any[] : [];

  const providerList = document.getElementById('provider-list');
  if (!providerList) return;

  if (!providers.length) {
    providerList.innerHTML = '<p style="color: var(--vscode-descriptionForeground);">暂无配置的服务商</p>';
    return;
  }

  providerList.innerHTML = providers.map((p) => {
    const configured = !!p.apiKey;
    return `
      <div style="padding: 12px; background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 4px;">
        <div style="font-weight: 600; margin-bottom: 8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:8px; background:${configured ? 'var(--vscode-testing-iconPassed)' : 'var(--vscode-testing-iconFailed)'};"></span>
          ${escapeHtml(String(p.name || p.id))}
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="display:block; margin-bottom:6px;">API Key</label>
            <input type="password" id="apiKey-${escapeHtml(String(p.id))}" value="${escapeHtml(String(p.apiKey || ''))}" placeholder="输入 API Key" style="width:100%;" />
          </div>

          <div>
            <label style="display:block; margin-bottom:6px;">Base URL</label>
            <input type="text" id="endpoint-${escapeHtml(String(p.id))}" value="${escapeHtml(String(p.apiEndpoint || p.baseUrl || ''))}" placeholder="https://api.example.com" style="width:100%;" />
          </div>

          <div>
            <label style="display:block; margin-bottom:6px;">模型</label>
            <input type="text" id="model-${escapeHtml(String(p.id))}" value="${escapeHtml(String(p.model || ''))}" placeholder="model" style="width:100%;" />
          </div>

          <button class="btn-save-provider" data-provider-id="${escapeHtml(String(p.id))}">保存</button>
        </div>
      </div>
    `;
  }).join('');
}

async function saveGeneralSettings(): Promise<void> {
  const defaultProvider = (document.getElementById('default-provider') as HTMLSelectElement | null)?.value;
  const displayMode = (document.getElementById('display-mode') as HTMLSelectElement | null)?.value;
  const targetLang = (document.getElementById('target-lang') as HTMLSelectElement | null)?.value;

  await request('config.update', { key: 'defaultProvider', value: defaultProvider });
  await request('config.update', { key: 'displayMode', value: displayMode });
  await request('config.update', { key: 'defaultTargetLang', value: targetLang });

  post('notification.show', { message: '设置已保存', type: 'info' });
}

async function saveProviderConfig(providerId: string): Promise<void> {
  const apiKey = (document.getElementById(`apiKey-${providerId}`) as HTMLInputElement | null)?.value || '';
  const apiEndpoint = (document.getElementById(`endpoint-${providerId}`) as HTMLInputElement | null)?.value || '';
  const model = (document.getElementById(`model-${providerId}`) as HTMLInputElement | null)?.value || '';

  await request('config.providers.update', {
    providerId,
    config: {
      apiKey,
      apiEndpoint,
      model,
    },
  });

  post('notification.show', { message: '服务商配置已保存', type: 'info' });
  await loadProviders();
}

function switchTab(tabName: string): void {
  document.querySelectorAll<HTMLButtonElement>('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  document.querySelectorAll<HTMLElement>('.tab-content').forEach((content) => {
    content.classList.remove('active');
  });

  document.getElementById(`tab-${tabName}`)?.classList.add('active');
}

function init(): void {
  document.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.classList.contains('tab')) {
      const tabName = target.dataset.tab;
      if (tabName) switchTab(tabName);
      return;
    }

    if (target.id === 'save-general') {
      try {
        await saveGeneralSettings();
      } catch (err) {
        post('notification.show', { message: (err as Error).message || '保存失败', type: 'error' });
      }
      return;
    }

    if (target.classList.contains('btn-save-provider')) {
      const providerId = target.getAttribute('data-provider-id');
      if (!providerId) return;
      try {
        await saveProviderConfig(providerId);
      } catch (err) {
        post('notification.show', { message: (err as Error).message || '保存失败', type: 'error' });
      }
      return;
    }

    if (target.id === 'add-template') {
      post('notification.show', { message: '模板编辑功能开发中...', type: 'info' });
      return;
    }

    if (target.id === 'add-provider') {
      post('notification.show', { message: '请通过内置服务商配置项进行配置', type: 'info' });
      return;
    }
  });

  loadConfiguration().catch((err) => {
    post('notification.show', { message: err?.message || '加载配置失败', type: 'error' });
  });

  post('panel.focus');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

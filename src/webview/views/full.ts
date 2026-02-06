/**
 * 完整翻译页面入口
 *
 * 使用 Lit 和 @vscode-elements/elements
 */

import '../components/translation/full-page';
import type { FullPage } from '../components/translation';
import { showToast } from '../core/toast';

// 获取 VS Code API（只能获取一次）
const vscode = (window as any).acquireVsCodeApi();

function post(type: string, payload?: any): void {
  vscode.postMessage({ type, id: genId(), timestamp: Date.now(), payload });
}

function genId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}


async function init() {
  const app = document.getElementById('app') as FullPage | null;
  if (!app) {
    console.error('App element not found');
    return;
  }

  console.log('[Full] App element found, setting up...');

  // 初始状态
  app.state = 'loading';
  app.stateMessage = '等待翻译结果...';

  // 监听操作事件 - 使用 document 级别监听以确保能捕获到事件
  document.addEventListener('action', (e: Event) => {
    const detail = (e as CustomEvent<{ action: string; [key: string]: any }>).detail;
    const { action, ...rest } = detail;

    console.log('[Full] Action received:', action, rest);

    switch (action) {
      case 'copy':
        post('action.copy');
        break;
      case 'copySuccess':
        showToast(rest.message || '复制成功');
        break;
      case 'copyError':
        showToast(rest.message || '复制失败');
        break;
      case 'replace':
        post('action.replace');
        break;
      case 'sendToSimple':
        post('action.sendToSimple');
        break;
      case 'selectAlternative':
        post('action.selectAlternative', { index: rest.index });
        break;
    }
  });

  // 监听来自 Extension 的消息
  window.addEventListener('message', (event: MessageEvent) => {
    const message = event.data;
    if (!message || !message.type) return;

    switch (message.type) {
      case 'translate.result':
        app.result = message.payload?.result || null;
        app.state = 'idle';
        break;
      case 'translate.start':
        app.state = 'loading';
        app.stateMessage = message.payload?.message || '正在翻译...';
        app.result = null;
        break;
      case 'translate.error':
        app.state = 'error';
        app.stateMessage = message.payload?.error || '翻译失败';
        app.result = null;
        break;
    }
  });

  // 通知面板已就绪
  post('panel.focus');
}

// 等待 DOM 就绪
document.addEventListener('DOMContentLoaded', init);

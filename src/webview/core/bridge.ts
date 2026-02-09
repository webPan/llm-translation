/**
 * Webview 消息桥接模块
 * 提供与 VS Code Extension 通信的基础能力
 */

export interface BridgeMessage<TPayload = any, TResponse = any> {
  type: string;
  id?: string;
  timestamp?: number;
  payload?: TPayload;
  response?: TResponse;
}

type PendingRequest = {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeout: number;
};

declare const acquireVsCodeApi: () => {
  postMessage: (msg: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const vscode = acquireVsCodeApi();
const pendingRequests = new Map<string, PendingRequest>();
const DEFAULT_TIMEOUT = 15000;

function generateId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 发送消息（无需响应）
 */
export function post<TPayload = any>(type: string, payload?: TPayload): void {
  const message: BridgeMessage<TPayload> = {
    type,
    id: generateId(),
    timestamp: Date.now(),
    payload,
  };
  vscode.postMessage(message);
}

/**
 * 发送请求并等待响应
 */
export function request<TPayload = any, TResponse = any>(
  type: string,
  payload?: TPayload,
  timeoutMs = DEFAULT_TIMEOUT,
): Promise<TResponse> {
  const id = generateId();
  const message: BridgeMessage<TPayload> = {
    type,
    id,
    timestamp: Date.now(),
    payload,
  };

  return new Promise<TResponse>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Request timeout: ${type}`));
    }, timeoutMs);

    pendingRequests.set(id, { resolve, reject, timeout });
    vscode.postMessage(message);
  });
}

/**
 * 监听来自 VS Code 的消息
 */
export function onMessage<TPayload = any>(
  type: string,
  handler: (payload: TPayload) => void,
): () => void {
  const listener = (event: MessageEvent<BridgeMessage>) => {
    const message = event.data;
    if (!message || message.type !== type) return;
    handler(message.payload as TPayload);
  };

  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

/**
 * 处理响应消息
 */
function handleResponse(message: BridgeMessage): void {
  if (!message.id || !Object.prototype.hasOwnProperty.call(message, 'response')) {
    return;
  }

  const pending = pendingRequests.get(message.id);
  if (!pending) return;

  window.clearTimeout(pending.timeout);
  pendingRequests.delete(message.id);

  const response = message.response;
  if (response && typeof response === 'object' && 'error' in response) {
    pending.reject(new Error(String(response.error)));
  } else {
    pending.resolve(response);
  }
}

// 全局消息监听，处理响应
window.addEventListener('message', (event: MessageEvent<BridgeMessage>) => {
  const message = event.data;
  if (!message) return;
  handleResponse(message);
});

/**
 * 状态管理
 */
export const state = {
  get: vscode.getState.bind(vscode),
  set: vscode.setState.bind(vscode),
};

/**
 * 工具函数
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function ready(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

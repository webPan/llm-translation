"use strict";
/**
 * Webview 消息桥接模块
 * 提供与 VS Code Extension 通信的基础能力
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = void 0;
exports.post = post;
exports.request = request;
exports.onMessage = onMessage;
exports.escapeHtml = escapeHtml;
exports.ready = ready;
const vscode = acquireVsCodeApi();
const pendingRequests = new Map();
const DEFAULT_TIMEOUT = 15000;
function generateId() {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
/**
 * 发送消息（无需响应）
 */
function post(type, payload) {
    const message = {
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
function request(type, payload, timeoutMs = DEFAULT_TIMEOUT) {
    const id = generateId();
    const message = {
        type,
        id,
        timestamp: Date.now(),
        payload,
    };
    return new Promise((resolve, reject) => {
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
function onMessage(type, handler) {
    const listener = (event) => {
        const message = event.data;
        if (!message || message.type !== type)
            return;
        handler(message.payload);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
}
/**
 * 处理响应消息
 */
function handleResponse(message) {
    if (!message.id || !Object.prototype.hasOwnProperty.call(message, 'response')) {
        return;
    }
    const pending = pendingRequests.get(message.id);
    if (!pending)
        return;
    window.clearTimeout(pending.timeout);
    pendingRequests.delete(message.id);
    const response = message.response;
    if (response && typeof response === 'object' && 'error' in response) {
        pending.reject(new Error(String(response.error)));
    }
    else {
        pending.resolve(response);
    }
}
// 全局消息监听，处理响应
window.addEventListener('message', (event) => {
    const message = event.data;
    if (!message)
        return;
    handleResponse(message);
});
/**
 * 状态管理
 */
exports.state = {
    get: vscode.getState.bind(vscode),
    set: vscode.setState.bind(vscode),
};
/**
 * 工具函数
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    }
    else {
        callback();
    }
}
//# sourceMappingURL=bridge.js.map
"use strict";
/**
 * VS Code Webview 消息桥接
 * 处理 VS Code Extension Host 和 Webview 之间的双向通信
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseManager = exports.ExtensionBridge = exports.WebviewBridge = void 0;
// ============================================================================
// 响应管理器
// ============================================================================
class ResponseManager {
    constructor() {
        this.pendingRequests = new Map();
        this.timeoutMs = 30000; // 30 秒超时
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    createRequest(requestId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error(`Request timeout: ${requestId}`));
            }, this.timeoutMs);
            this.pendingRequests.set(requestId, { resolve, reject, timeout });
        });
    }
    resolveRequest(requestId, value) {
        const request = this.pendingRequests.get(requestId);
        if (request) {
            clearTimeout(request.timeout);
            request.resolve(value);
            this.pendingRequests.delete(requestId);
        }
    }
    rejectRequest(requestId, error) {
        const request = this.pendingRequests.get(requestId);
        if (request) {
            clearTimeout(request.timeout);
            request.reject(error);
            this.pendingRequests.delete(requestId);
        }
    }
    clear() {
        this.pendingRequests.forEach(({ timeout }) => clearTimeout(timeout));
        this.pendingRequests.clear();
    }
}
exports.ResponseManager = ResponseManager;
// ============================================================================
// Webview 端桥接
// ============================================================================
/**
 * Webview 端的消息桥接类
 * 用于在 Webview 中与 VS Code Extension Host 通信
 */
class WebviewBridge {
    constructor() {
        this.handlers = {};
        this.responseManager = new ResponseManager();
        this.messageQueue = [];
        this.isConnected = false;
        // 在 Webview 环境中获取 VS Code API
        if (typeof window !== 'undefined' && window.acquireVsCodeApi) {
            this.vscode = window.acquireVsCodeApi();
            this.isConnected = true;
            this.setupMessageListener();
        }
        else {
            console.warn('[WebviewBridge] VS Code API not available, running in standalone mode');
        }
    }
    /**
     * 设置消息监听器
     */
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            const message = event.data;
            if (!message || !message.type)
                return;
            this.handleMessage(message);
        });
    }
    /**
     * 处理接收到的消息
     */
    handleMessage(message) {
        const { type, id } = message;
        // 如果是响应消息，解析对应的请求
        if (id && 'response' in message) {
            this.responseManager.resolveRequest(id, message.response);
            return;
        }
        // 调用对应的消息处理器
        const handler = this.handlers[type];
        if (handler) {
            try {
                const result = handler(message);
                // 如果有请求 ID，发送响应
                if (id && result instanceof Promise) {
                    result.then((response) => {
                        this.sendMessage({ ...message, id, response });
                    }).catch((error) => {
                        this.sendMessage({ ...message, id, response: { error: error.message } });
                    });
                }
            }
            catch (error) {
                console.error(`[WebviewBridge] Error handling ${type}:`, error);
                if (id) {
                    this.sendMessage({ ...message, id, response: { error: error.message } });
                }
            }
        }
    }
    /**
     * 发送消息到 VS Code
     */
    sendMessage(message) {
        if (this.isConnected && this.vscode) {
            this.vscode.postMessage(message);
        }
        else {
            // 离线模式：将消息加入队列
            this.messageQueue.push(message);
        }
    }
    /**
     * 发送请求并等待响应
     */
    async sendRequest(message) {
        const requestId = this.responseManager.generateRequestId();
        const messageWithId = { ...message, id: requestId };
        this.sendMessage(messageWithId);
        try {
            return await this.responseManager.createRequest(requestId);
        }
        catch (error) {
            console.error(`[WebviewBridge] Request failed:`, error);
            throw error;
        }
    }
    /**
     * 注册消息处理器
     */
    on(type, handler) {
        this.handlers[type] = handler;
    }
    /**
     * 移除消息处理器
     */
    off(type) {
        delete this.handlers[type];
    }
    /**
     * 获取 VS Code API
     */
    getVsCodeApi() {
        return this.vscode;
    }
    /**
     * 获取 Webview 状态
     */
    getState() {
        return this.vscode?.getState() || {};
    }
    /**
     * 设置 Webview 状态
     */
    setState(state) {
        if (this.vscode) {
            this.vscode.setState(state);
        }
    }
    /**
     * 清理资源
     */
    dispose() {
        this.responseManager.clear();
        this.handlers = {};
        this.messageQueue = [];
    }
}
exports.WebviewBridge = WebviewBridge;
// ============================================================================
// Extension 端桥接
// ============================================================================
/**
 * Extension 端的消息桥接类
 * 用于在 VS Code Extension Host 中与 Webview 通信
 */
class ExtensionBridge {
    constructor(webview) {
        this.handlers = {};
        if (webview) {
            this.attachWebview(webview);
        }
    }
    /**
     * 附加 Webview
     */
    attachWebview(webview) {
        this.webview = webview;
    }
    /**
     * 设置消息监听器
     */
    setupMessageListener() {
        if (!this.webview) {
            throw new Error('[ExtensionBridge] Webview not attached');
        }
        return this.webview.onDidReceiveMessage((data) => {
            const message = data;
            if (!message || !message.type)
                return;
            this.handleMessage(message);
        });
    }
    /**
     * 处理接收到的消息
     */
    async handleMessage(message) {
        const { type, id } = message;
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`[ExtensionBridge] No handler for message type: ${type}`);
            return;
        }
        try {
            const result = await handler(message);
            // 如果有请求 ID，发送响应
            if (id !== undefined && this.webview) {
                this.webview.postMessage({ ...message, response: result });
            }
        }
        catch (error) {
            console.error(`[ExtensionBridge] Error handling ${type}:`, error);
            if (id !== undefined && this.webview) {
                this.webview.postMessage({
                    ...message,
                    response: { error: error.message },
                });
            }
        }
    }
    /**
     * 发送消息到 Webview
     */
    sendMessage(message) {
        if (this.webview) {
            this.webview.postMessage(message);
        }
        else {
            console.warn('[ExtensionBridge] Webview not attached, message not sent:', message);
        }
    }
    /**
     * 注册消息处理器
     */
    on(type, handler) {
        this.handlers[type] = handler;
    }
    /**
     * 移除消息处理器
     */
    off(type) {
        delete this.handlers[type];
    }
    /**
     * 清理资源
     */
    dispose() {
        this.handlers = {};
        this.webview = undefined;
    }
}
exports.ExtensionBridge = ExtensionBridge;
//# sourceMappingURL=bridge.js.map
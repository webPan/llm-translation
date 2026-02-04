"use strict";
/**
 * Lit 基础组件
 * 所有 Lit 组件的基类，提供通用的功能和工具方法
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repeat = exports.unsafeHTML = exports.classMap = exports.property = exports.customElement = exports.html = exports.BaseComponent = void 0;
exports.createIconButton = createIconButton;
exports.createLoadingIndicator = createLoadingIndicator;
exports.createErrorAlert = createErrorAlert;
const lit_1 = require("lit");
Object.defineProperty(exports, "html", { enumerable: true, get: function () { return lit_1.html; } });
const decorators_js_1 = require("lit/decorators.js");
Object.defineProperty(exports, "customElement", { enumerable: true, get: function () { return decorators_js_1.customElement; } });
Object.defineProperty(exports, "property", { enumerable: true, get: function () { return decorators_js_1.property; } });
const class_map_js_1 = require("lit/directives/class-map.js");
Object.defineProperty(exports, "classMap", { enumerable: true, get: function () { return class_map_js_1.classMap; } });
const unsafe_html_js_1 = require("lit/directives/unsafe-html.js");
Object.defineProperty(exports, "unsafeHTML", { enumerable: true, get: function () { return unsafe_html_js_1.unsafeHTML; } });
const repeat_js_1 = require("lit/directives/repeat.js");
Object.defineProperty(exports, "repeat", { enumerable: true, get: function () { return repeat_js_1.repeat; } });
const bridge_1 = require("../../common/bridge");
const utils_1 = require("../../common/utils");
// ============================================================================
// 基础组件类
// ============================================================================
/**
 * VS Code Webview 基础组件
 * 提供主题、消息通信等通用功能
 */
class BaseComponent extends lit_1.LitElement {
    constructor() {
        super();
        // 主题相关
        this.themeKind = 'dark';
        // 加载状态
        this.isLoading = false;
        // 初始化消息桥接
        this.bridge = new bridge_1.WebviewBridge();
        // 初始化主题
        this.themeColors = (0, utils_1.getThemeColors)();
        this.setupTheme();
        // 设置组件样式
        this.setupComponentStyles();
    }
    /**
     * 设置主题
     */
    setupTheme() {
        // 初始检测主题
        this.themeKind = (0, utils_1.detectTheme)();
        this.themeColors = (0, utils_1.getThemeColors)();
        (0, utils_1.applyThemeColors)(this.themeColors);
        // 监听主题变化
        (0, utils_1.onThemeChange)((theme, colors) => {
            this.themeKind = theme;
            this.themeColors = colors;
            (0, utils_1.applyThemeColors)(colors);
            this.requestUpdate();
        });
    }
    /**
     * 设置组件样式
     */
    setupComponentStyles() {
        // 应用主题颜色到 CSS 变量
        (0, utils_1.applyThemeColors)(this.themeColors);
    }
    /**
     * 发送消息到 VS Code
     */
    sendMessage(type, payload) {
        this.bridge.sendMessage({
            type,
            id: this.generateMessageId(),
            timestamp: Date.now(),
            payload,
        });
    }
    /**
     * 发送请求并等待响应
     */
    async sendRequest(type, payload) {
        return this.bridge.sendRequest({
            type,
            id: this.generateMessageId(),
            timestamp: Date.now(),
            payload,
        });
    }
    /**
     * 生成消息 ID
     */
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 创建带样式的元素
     */
    styledElement(tag, styles, content) {
        const styleStr = Object.entries(styles)
            .map(([key, value]) => `${this.kebabCase(key)}: ${value}`)
            .join('; ');
        return (0, lit_1.html) `<${tag} style="${styleStr}">${content}</${tag}>`;
    }
    /**
     * 转换为 kebab-case
     */
    kebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    /**
     * 显示通知
     */
    async showNotification(message, type = 'info', actions) {
        const response = await this.sendRequest('notification.show', {
            message,
            type,
            actions,
        });
        return response?.action;
    }
    /**
     * 复制文本到剪贴板
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            await this.showNotification('已复制到剪贴板', 'info');
            return true;
        }
        catch (error) {
            await this.showNotification('复制失败', 'error');
            return false;
        }
    }
    /**
     * 格式化日期时间
     */
    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    /**
     * 截断文本
     */
    truncate(text, maxLength, suffix = '...') {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }
    /**
     * 连接时调用
     */
    connectedCallback() {
        super.connectedCallback();
        this.onConnected();
    }
    /**
     * 断开连接时调用
     */
    disconnectedCallback() {
        super.disconnectedCallback();
        this.onDisconnected();
        this.bridge.dispose();
    }
    /**
     * 组件连接完成后的回调
     */
    onConnected() {
        // 子类可以重写此方法
    }
    /**
     * 组件断开连接后的回调
     */
    onDisconnected() {
        // 子类可以重写此方法
    }
    /**
     * 获取主题相关的 CSS 变量
     */
    getThemeVars() {
        return {
            '--background': 'var(--theme-background)',
            '--foreground': 'var(--theme-foreground)',
            '--primary': 'var(--theme-primary)',
            '--secondary': 'var(--theme-secondary)',
            '--border': 'var(--theme-border)',
            '--error': 'var(--theme-error)',
            '--warning': 'var(--theme-warning)',
            '--info': 'var(--theme-info)',
        };
    }
    /**
     * 创建基础样式
     */
    createBaseStyles() {
        return `
      :host {
        display: block;
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size);
        color: var(--theme-foreground, var(--vscode-foreground));
      }

      * {
        box-sizing: border-box;
      }

      .btn {
        padding: 8px 16px;
        background: var(--theme-primary, var(--vscode-button-primaryBackground));
        color: var(--theme-primary-foreground, var(--vscode-button-primaryForeground));
        border: none;
        border-radius: 2px;
        cursor: pointer;
        font-size: 13px;
        transition: opacity 0.2s;
      }

      .btn:hover {
        opacity: 0.9;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
      }

      .input {
        padding: 8px 12px;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        border-radius: 2px;
        font-family: inherit;
      }

      .input:focus {
        outline: 1px solid var(--theme-primary, var(--vscode-focusBorder));
        outline-offset: -1px;
      }

      .card {
        padding: 16px;
        background: var(--vscode-editor-inactiveSelectionBackground);
        border-radius: 4px;
      }

      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        color: var(--vscode-descriptionForeground);
      }

      .error {
        padding: 12px;
        background: var(--vscode-errorBackground);
        color: var(--vscode-errorForeground);
        border-radius: 4px;
        border-left: 4px solid var(--vscode-errorForeground);
      }
    `;
    }
}
exports.BaseComponent = BaseComponent;
__decorate([
    (0, decorators_js_1.property)({ type: Boolean })
], BaseComponent.prototype, "isLoading", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: String })
], BaseComponent.prototype, "error", void 0);
// ============================================================================
// 工具函数
// ============================================================================
/**
 * 创建带图标的按钮
 */
function createIconButton(icon, label, onClick, options) {
    const { variant = 'primary', disabled = false, title } = options || {};
    return (0, lit_1.html) `
    <button
      class="btn btn-${variant}"
      ?disabled="${disabled}"
      title="${title || label}"
      @click="${onClick}"
    >
      <span class="icon">${icon}</span>
      <span class="label">${label}</span>
    </button>
  `;
}
/**
 * 创建加载指示器
 */
function createLoadingIndicator(message) {
    return (0, lit_1.html) `
    <div class="loading">
      <div class="spinner"></div>
      ${message ? (0, lit_1.html) `<span>${message}</span>` : ''}
    </div>
  `;
}
/**
 * 创建错误提示
 */
function createErrorAlert(message, actions) {
    return (0, lit_1.html) `
    <div class="error">
      <p>${message}</p>
      ${actions && actions.length > 0
        ? (0, lit_1.html) `
            <div class="error-actions">
              ${(0, repeat_js_1.repeat)(actions, (action) => action.label, (action) => (0, lit_1.html) `
                  <button class="btn btn-secondary" @click="${action.action}">
                    ${action.label}
                  </button>
                `)}
            </div>
          `
        : ''}
    </div>
  `;
}
//# sourceMappingURL=base-component.js.map
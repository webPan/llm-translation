"use strict";
/**
 * Webview 公共工具函数
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectTheme = detectTheme;
exports.getThemeColors = getThemeColors;
exports.applyThemeColors = applyThemeColors;
exports.onThemeChange = onThemeChange;
exports.adjustColorBrightness = adjustColorBrightness;
exports.getContrastColor = getContrastColor;
exports.debounce = debounce;
exports.throttle = throttle;
exports.deepClone = deepClone;
exports.formatDateTime = formatDateTime;
exports.formatDuration = formatDuration;
exports.getWebviewResourceUri = getWebviewResourceUri;
exports.getNonce = getNonce;
exports.getUserFriendlyError = getUserFriendlyError;
exports.isValidUrl = isValidUrl;
exports.isValidEmail = isValidEmail;
exports.truncateText = truncateText;
const vscode = __importStar(require("vscode"));
// ============================================================================
// 主题工具
// ============================================================================
/**
 * 检测当前主题类型
 */
function detectTheme() {
    if (typeof document === 'undefined') {
        return 'dark';
    }
    const body = document.body;
    if (!body)
        return 'dark';
    const computedStyle = window.getComputedStyle(body);
    // 检测高对比度模式
    if (computedStyle.getPropertyValue('--vscode-high-contrast')) {
        return 'highContrast';
    }
    // 检测背景色亮度来判断主题
    const bgColor = computedStyle.getPropertyValue('--vscode-editor-background').trim();
    if (bgColor) {
        const rgb = hexToRgb(bgColor) || { r: 0, g: 0, b: 0 };
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? 'light' : 'dark';
    }
    return 'dark';
}
/**
 * 获取主题颜色
 */
function getThemeColors() {
    if (typeof document === 'undefined') {
        return {
            background: '#1e1e1e',
            foreground: '#cccccc',
            primary: '#007acc',
            secondary: '#3d3d3d',
            border: '#454545',
            error: '#f48771',
            warning: '#cca700',
            info: '#75beff',
        };
    }
    const getVar = (name) => {
        const styles = getComputedStyle(document.body);
        return styles.getPropertyValue(name).trim() || '';
    };
    return {
        background: getVar('--vscode-editor-background'),
        foreground: getVar('--vscode-editor-foreground'),
        primary: getVar('--vscode-button-primaryBackground'),
        secondary: getVar('--vscode-button-secondaryBackground'),
        border: getVar('--vscode-panel-border'),
        error: getVar('--vscode-errorForeground'),
        warning: getVar('--vscode-editorWarning-foreground'),
        info: getVar('--vscode-infoForeground'),
    };
}
/**
 * 将主题颜色应用到 CSS 变量
 */
function applyThemeColors(colors) {
    if (typeof document === 'undefined')
        return;
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
        if (value) {
            root.style.setProperty(`--theme-${key}`, value);
        }
    });
}
/**
 * 监听主题变化
 */
function onThemeChange(callback) {
    if (typeof document === 'undefined') {
        return () => { };
    }
    let observer = null;
    const checkTheme = () => {
        const theme = detectTheme();
        const colors = getThemeColors();
        callback(theme, colors);
    };
    // 监听 body 类名变化
    observer = new MutationObserver(checkTheme);
    if (document.body) {
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });
    }
    // 初始调用
    checkTheme();
    // 返回清理函数
    return () => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    };
}
// ============================================================================
// 颜色工具
// ============================================================================
/**
 * 十六进制转 RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}
/**
 * 调整颜色亮度
 */
function adjustColorBrightness(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb)
        return hex;
    const adjust = (value) => {
        const adjusted = Math.round(value + (value * percent / 100));
        return Math.max(0, Math.min(255, adjusted));
    };
    const toHex = (value) => {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(adjust(rgb.r))}${toHex(adjust(rgb.g))}${toHex(adjust(rgb.b))}`;
}
/**
 * 计算对比颜色（黑或白）
 */
function getContrastColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb)
        return '#ffffff';
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}
// ============================================================================
// DOM 工具
// ============================================================================
/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout = null;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}
/**
 * 节流函数
 */
function throttle(func, limit) {
    let inThrottle = false;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
/**
 * 深度克隆对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map((item) => deepClone(item));
    }
    if (obj instanceof Object) {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
}
/**
 * 格式化日期时间
 */
function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}
/**
 * 格式化持续时间
 */
function formatDuration(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
// ============================================================================
// URL 工具
// ============================================================================
/**
 * 构建 webview 资源 URI
 */
function getWebviewResourceUri(webview, context, relativePath) {
    return webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'out', 'webview', relativePath));
}
/**
 * 构建非托管资源 URI（用于开发）
 */
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
// ============================================================================
// 错误工具
// ============================================================================
/**
 * 获取用户友好的错误信息
 */
function getUserFriendlyError(error) {
    if (typeof error === 'string') {
        return error;
    }
    if (error instanceof Error) {
        // 检查常见的错误类型
        if (error.message.includes('ECONNREFUSED')) {
            return '无法连接到服务器，请检查网络连接';
        }
        if (error.message.includes('ETIMEDOUT')) {
            return '请求超时，请稍后重试';
        }
        if (error.message.includes('401') || error.message.includes('403')) {
            return 'API Key 无效或已过期，请检查配置';
        }
        if (error.message.includes('429')) {
            return '请求过于频繁，请稍后重试';
        }
        if (error.message.includes('500')) {
            return '服务器错误，请稍后重试';
        }
        return error.message;
    }
    return '发生未知错误';
}
// ============================================================================
// 数据验证工具
// ============================================================================
/**
 * 验证字符串是否为有效 URL
 */
function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * 验证邮箱格式
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * 截断文本
 */
function truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
}
//# sourceMappingURL=utils.js.map
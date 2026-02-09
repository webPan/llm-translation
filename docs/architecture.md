# LLM Translation VS Code 插件 - 系统架构设计

## 1. 项目概述

一个基于大语言模型的 VS Code 翻译插件，支持多种主流 LLM 服务商，提供可自定义的提示词模板和结构化的翻译结果解析。

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| Extension | VS Code Extension API + TypeScript |
| Webview UI | Lit (Web Components) + @vscode-elements/elements |
| 样式 | VS Code CSS Variables |
| 构建 | esbuild / tsc |

## 3. 系统架构（三层设计）

```
┌─────────────────────────────────────────────────────────────┐
│                      VS Code Extension                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Extension Host (Main)                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │  │
│  │  │ Commands │  │Providers │  │ Config Services      │ │  │
│  │  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘ │  │
│  │       └─────────────┴─────────────────────┘             │  │
│  │                     │                                   │  │
│  │                     ▼                                   │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │            Controllers                           │   │  │
│  │  │  SettingsPanelController                        │   │  │
│  │  │  SimplePanelController                          │   │  │
│  │  │  FullPanelController                            │   │  │
│  │  │         (仅管理 Webview 生命周期)                 │   │  │
│  │  └──────────────────┬──────────────────────────────┘   │  │
│  └─────────────────────┼──────────────────────────────────┘  │
│                        │ postMessage                         │
│  ┌─────────────────────┼──────────────────────────────────┐  │
│  │                     ▼          Webview (Browser)        │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │              View Entry Points                    │   │  │
│  │  │    settings.ts | simple.ts | full.ts             │   │  │
│  │  └────────────────────┬────────────────────────────┘   │  │
│  │                       │                                 │  │
│  │                       ▼                                 │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │           UI Components (Lit)                     │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │  │
│  │  │  │ settings │ │ provider │ │ result-card      │ │   │  │
│  │  │  │ -form    │ │ -card    │ │                  │ │   │  │
│  │  │  └──────────┘ └──────────┘ └──────────────────┘ │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 4. 目录结构

```
src/
├── extension.ts                 # 插件入口
├── commands/                    # 命令注册
│   ├── config.ts                # 配置命令（打开设置面板）
│   └── translate.ts             # 翻译命令
├── providers/                   # LLM 提供商
│   ├── base.ts                  # Provider 基类接口
│   ├── index.ts                 # ProviderManager 管理器
│   ├── qwen.ts                  # 千问 (Qwen)
│   ├── deepseek.ts              # DeepSeek
│   ├── kimi.ts                  # Kimi
│   └── glm.ts                   # 智谱 GLM
├── services/                    # 核心服务
│   ├── promptManager.ts         # 提示词模板管理
│   ├── parser.ts                # 翻译结果解析器
│   ├── translator.ts            # 翻译服务主逻辑
│   └── statusBar.ts             # 状态栏管理
├── types/                       # 类型定义
│   ├── index.ts                 # 统一导出
│   ├── language.ts              # 语言相关
│   ├── provider.ts              # Provider 相关
│   ├── translation.ts           # 翻译相关
│   ├── config.ts                # 配置相关
│   └── api.ts                   # API 请求/响应
└── webview/                     # Webview 三层架构
    ├── controllers/             # Panel Controllers (VS Code 端)
    │   ├── index.ts             # 统一导出
    │   ├── BasePanelController.ts
    │   ├── SettingsPanelController.ts
    │   ├── SimplePanelController.ts
    │   └── FullPanelController.ts
    ├── components/              # UI 组件 (Lit Web Components)
    │   ├── common/              # 通用组件
    │   │   └── base-element.ts  # 基础元素类
    │   ├── settings/            # 设置相关组件
    │   │   ├── settings-page.ts # 设置页面组件
    │   │   ├── settings-form.ts # 常规设置表单
    │   │   └── provider-card.ts # 服务商卡片
    │   └── translation/         # 翻译结果组件
    ├── views/                   # View Entry Points (Webview 端)
    │   ├── settings.ts
    │   ├── simple.ts
    │   └── full.ts
    └── core/                    # Webview 核心基础设施
        └── bridge.ts            # 消息桥接模块
```

## 5. 分层职责

### 5.1 Controllers (`controllers/`)

**运行环境**: Node.js (Extension Host)

**职责**:
- 创建/管理 `WebviewPanel` 生命周期
- 返回 HTML 骨架（引用 `views/*.js`）
- 注册消息处理器
- 调用 VS Code API

**约束**:
- ❌ 不包含业务 UI 代码
- ❌ 不内联 HTML/CSS

```typescript
// 示例：Controller 的 HTML 方法
protected getHtmlContent(): string {
  const scriptUri = this.getResourceUri('views/settings.js');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="...">
</head>
<body>
  <div id="app"></div>
  <script src="${scriptUri}"></script>
</body>
</html>`;
}
```

### 5.2 UI Components (`components/`)

**运行环境**: 浏览器 (Webview)

**职责**:
- 使用 Lit 定义 Web Components
- 封装业务逻辑和样式
- 通过 `properties` 接收数据
- 通过 `events` 与父组件通信

**规范**:
- 继承 `LitElement`
- 使用 `@vscode-elements/elements` 作为基础组件
- 样式使用 VS Code CSS Variables

```typescript
// 示例：Lit 组件基本结构
@customElement('provider-card')
export class ProviderCard extends LitElement {
  @property({ type: Object }) provider!: ProviderConfig;
  
  render() {
    return html`
      <vscode-textfield 
        .value="${this.provider.apiKey}"
        @change="${this._handleChange}">
      </vscode-textfield>
    `;
  }
}
```

### 5.3 View Entry Points (`views/`)

**运行环境**: 浏览器 (Webview)

**职责**:
- 导入并注册 Web Components
- 初始化页面布局
- 通过 `bridge.ts` 与 Controller 通信

**约束**:
- ❌ 不直接调用 VS Code API

```typescript
// 示例：View Entry
import '../components/settings/provider-card';
import { request, post } from '../core/bridge';

async function init() {
  const config = await request('config.get');
  // 渲染组件...
}
```

## 6. 通信协议

### 6.1 消息格式

```typescript
interface BridgeMessage<TPayload = any, TResponse = any> {
  type: string;
  id?: string;
  timestamp?: number;
  payload?: TPayload;
  response?: TResponse;
}
```

### 6.2 常用消息类型

| 类型 | 方向 | 说明 |
|------|------|------|
| `config.get` | View → Controller | 获取配置 |
| `config.update` | View → Controller | 更新配置 |
| `notification.show` | View → Controller | 显示通知 |
| `translate.result` | Controller → View | 翻译结果 |
| `action.copy` | View → Controller | 复制操作 |

### 6.3 Bridge API

```typescript
// 发送消息（无需响应）
post('notification.show', { message: '保存成功', type: 'info' });

// 发送请求并等待响应
const config = await request<Config>('config.get');

// 监听消息
onMessage('translate.result', (result) => {
  // 更新 UI
});
```

## 7. 开发规范

### 7.1 命名规范

| 层级 | 文件命名 | 类/标签命名 |
|------|----------|-------------|
| Controller | `XxxPanelController.ts` | `XxxPanelController` |
| Component | `xxx-xxx.ts` | `XxxXxx` / `<xxx-xxx>` |
| View | `xxx.ts` | - |

### 7.2 创建新组件流程

1. 在 `components/{category}/` 创建组件文件
2. 继承 `LitElement`，使用 `@vscode-elements` 组件
3. 在 View 中 `import` 注册组件
4. Controller 保持不变

### 7.3 CSS 变量

使用 VS Code 提供的 CSS Variables 保持一致性：

```css
:host {
  --background: var(--vscode-editor-background);
  --foreground: var(--vscode-editor-foreground);
  --primary: var(--vscode-button-primaryBackground);
  --border: var(--vscode-panel-border);
}
```
## 参考资源

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
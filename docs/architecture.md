# LLM Translation VS Code 插件 - 系统架构设计

## 1. 项目概述

一个基于大语言模型的 VS Code 翻译插件，支持多种主流 LLM 服务商，提供可自定义的提示词模板和结构化的翻译结果解析。

## 2. 技术栈

- **框架**: VS Code Extension API
- **语言**: TypeScript
- **UI 框架**: 
  - Webview 容器: VS Code Webview API
  - 组件库: Lit (Web Components)
  - UI 组件: @vscode-elements/elements（VS Code 官方 Web Components UI 库）
- **HTTP 客户端**: Axios / Fetch API
- **构建工具**: esbuild
- **状态管理**: Lit Context API

## 3. 系统架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           VS Code Extension                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  Extension Host │  │    Commands     │  │    Configuration        │  │
│  │  (main thread)  │  │   (翻译命令)    │  │   (设置管理)            │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
│           │                    │                        │               │
│           ▼                    ▼                        ▼               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Core Services                               │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │   │
│  │  │ LLM Provider │ │   Parser     │ │    Prompt Manager        │ │   │
│  │  │   Manager    │ │   Engine     │ │   (模板引擎)             │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      LLM Providers                               │   │
│  │  ┌────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐ │   │
│  │  │ Qwen   │ │ DeepSeek │ │  Kimi  │ │  GLM   │ │  Custom...   │ │   │
│  │  │(千问)  │ │          │ │        │ │        │ │              │ │   │
│  │  └────────┘ └──────────┘ └────────┘ └────────┘ └──────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Webview UI Layer                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐│   │
│  │  │  Panel Controllers (VS Code 端)                             ││   │
│  │  │  Settings | Simple | Full Panel Controllers                ││   │
│  │  └──────────────────────┬──────────────────────────────────────┘│   │
│  │                         │ Message Bridge                        │   │
│  │  ┌──────────────────────▼──────────────────────────────────────┐│   │
│  │  │  Webview Components (Browser 端)                            ││   │
│  │  │  ┌────────────┐ ┌────────────┐ ┌────────────────────────┐  ││   │
│  │  │  │ Lit/React  │ │ Lit/React  │ │  Lit/React             │  ││   │
│  │  │  │ Settings   │ │ Translation│ │  Provider Config       │  ││   │
│  │  │  │ Panel      │ │ Result     │ │  Components            │  ││   │
│  │  │  └────────────┘ └────────────┘ └────────────────────────┘  ││   │
│  │  └─────────────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4. 目录结构

```
llm-translation/
├── src/
│   ├── extension.ts              # 插件入口
│   ├── commands/                 # 命令注册
│   │   ├── translate.ts          # 翻译命令
│   │   └── config.ts             # 配置命令
│   ├── providers/                # LLM 提供商
│   │   ├── base.ts               # 基类接口
│   │   ├── qwen.ts               # 千问
│   │   ├── deepseek.ts           # DeepSeek
│   │   ├── kimi.ts               # Kimi
│   │   ├── glm.ts                # 智谱 GLM
│   │   └── index.ts              # 提供商管理
│   ├── services/                 # 核心服务
│   │   ├── promptManager.ts      # 提示词管理
│   │   ├── parser.ts             # 结果解析器
│   │   └── translator.ts         # 翻译服务
│   ├── webview/                  # Webview 架构（双层设计）
│   │   ├── common/               # 公共代码
│   │   │   ├── bridge.ts         # VS Code 消息桥接
│   │   │   ├── types.ts          # Webview 共享类型
│   │   │   └── utils.ts          # 工具函数
│   │   ├── components/           # UI 组件（Webview 端）
│   │   │   ├── lit/              # Lit Web Components
│   │   │   │   ├── base-component.ts
│   │   │   │   ├── settings-panel.ts
│   │   │   │   ├── translation-result.ts
│   │   │   │   ├── provider-config.ts
│   │   │   │   ├── prompt-editor.ts
│   │   │   │   └── language-selector.ts
│   │   │   └── react/            # React 组件（可选）
│   │   │       ├── SettingsPanel.tsx
│   │   │       └── index.tsx
│   │   ├── panels/               # 面板控制器（VS Code 端）
│   │   │   ├── BasePanelController.ts
│   │   │   ├── SettingsPanelController.ts
│   │   │   ├── SimplePanelController.ts
│   │   │   └── FullPanelController.ts
│   │   └── views/                # 视图入口（Webview 端）
│   │       ├── settings.ts       # 设置页面入口
│   │       ├── simple.ts         # 简单面板入口
│   │       └── full.ts           # 完整面板入口
│   ├── types/                    # 类型定义
│   │   └── index.ts
│   └── utils/                    # 工具函数
│       ├── http.ts
│       └── statusBar.ts
├── package.json                  # 插件清单
├── tsconfig.json                 # TypeScript 配置
├── build-webview.js              # Webview 构建脚本
└── README.md
```

## 5. 数据流

```
用户选中文本
    │
    ▼
触发翻译命令 ──► 获取配置 ──► 构建 Prompt ──► 调用 LLM API
                                               │
                                               ▼
显示结果 ◄── 解析响应 ◄── 接收响应 ◄───────────┘
    │
    ▼
渲染 Webview / 显示消息
```

## 6. 核心接口设计

### 6.1 LLM Provider 接口

```typescript
interface LLMProvider {
  readonly name: string;
  readonly id: string;
  translate(text: string, options: TranslateOptions): Promise<TranslationResult>;
  validateConfig(config: ProviderConfig): boolean;
}

interface TranslateOptions {
  sourceLang: Language;
  targetLang: Language;
  promptTemplate?: string;
  model?: string;
}

interface TranslationResult {
  original: string;
  translation: string;
  pronunciation?: string;
  alternatives?: string[];
  explanations?: Explanation[];
  examples?: Example[];
  raw?: any;
}
```

### 6.2 Prompt 模板接口

```typescript
interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  outputFormat: OutputFormat;
}

interface OutputFormat {
  type: 'json' | 'markdown' | 'plain';
  schema?: Record<string, string>;
}
```

### 6.3 显示模式接口

```typescript
type DisplayMode = 'simple' | 'normal';

interface DisplayModeConfig {
  mode: DisplayMode;
  simple: {
    autoHide: boolean;
    autoHideDelay: number;
    showAlternatives: boolean;
    maxAlternatives: number;
    position: 'above' | 'below' | 'auto';
    // 显示控制
    showPronunciation: boolean;
    showLanguageDirection: boolean;
    showProvider: boolean;
    showDuration: boolean;
    showExpandButton: boolean;
  };
}

interface SimpleModeResult {
  primary: string;
  alternatives?: string[];
  pronunciation?: string;
  sourceLang: string;
  targetLang: string;
  provider: string;
  duration: number;
}
```
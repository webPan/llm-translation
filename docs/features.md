# 功能模块设计

## 1. 核心功能模块

### 1.1 翻译命令模块 (Translate Command)

| 功能       | 描述                                | 快捷键         |
| ---------- | ----------------------------------- | -------------- |
| Transform  | 智能翻译选中文本（中<->英自动识别） | `Ctrl+Shift+T` |
| 翻译并替换 | 翻译后替换原文                      | `Ctrl+Shift+R` |

**功能细节：**

- **智能语言检测**：自动识别选中文本的主导语言
  - 选中英文 → 自动翻译为中文
  - 选中中文 → 自动翻译为英文
  - 混合文本 → 根据字符占比确定主导语言（中文字符 vs 英文字符）
- 支持手动指定目标语言（通过设置或快速选择）

### 1.2 LLM 提供商模块 (Provider Module)

#### 支持的提供商

| 提供商      | API 地址                         | 默认模型       | 特点       |
| ----------- | -------------------------------- | -------------- | ---------- |
| 千问 (Qwen) | `https://dashscope.aliyuncs.com` | qwen-turbo     | 中文优化   |
| DeepSeek    | `https://api.deepseek.com`       | deepseek-chat  | 性价比高   |
| Kimi        | `https://api.moonshot.cn`        | moonshot-v1-8k | 长文本支持 |
| GLM         | `https://open.bigmodel.cn`       | glm-4          | 国产优秀   |

**功能细节：**

- 支持自定义 API 地址（代理）
- 支持多提供商配置
- 支持切换默认提供商
- 支持自定义模型参数（temperature, max_tokens 等）

### 1.3 提示词管理模块 (Prompt Manager)

#### 内置模板

1. **标准翻译模板**

```
请将以下文本从 {sourceLang} 翻译为 {targetLang}：

{text}

请以 JSON 格式返回：
{
  "translation": "翻译结果",
  "pronunciation": "发音（日语/英语）",
  "explanations": [{"word": "原词", "meaning": "释义", "pos": "词性"}],
  "alternatives": ["替代翻译1", "替代翻译2"],
  "examples": [{"original": "例句原文", "translation": "例句翻译"}]
}
```

2. **学术翻译模板**
3. **口语化翻译模板**
4. **代码注释翻译模板**

**功能细节：**

- 支持自定义模板变量
- 支持模板导入/导出
- 支持模板分类管理
- 支持实时预览

### 1.4 结果解析模块 (Parser Engine)

**解析策略：**

- JSON 解析（首选）
- Markdown 解析（备选）
- 正则提取（兜底）

**解析内容：**
| 字段 | 说明 | 是否必需 |
|-----|------|---------|
| translation | 主要翻译结果 | 是 |
| pronunciation | 发音标注 | 否 |
| explanations | 词汇解释 | 否 |
| alternatives | 替代翻译 | 否 |
| examples | 例句 | 否 |
| confidence | 置信度 | 否 |

### 1.5 配置管理模块 (Configuration)

#### 配置项

```typescript
interface ExtensionConfig {
  // 默认设置
  defaultProvider: string;
  defaultSourceLang: 'auto' | Language;
  defaultTargetLang: Language;

  // 提供商配置
  providers: {
    qwen: { apiKey: string; model: string; baseUrl?: string };
    deepseek: { apiKey: string; model: string; baseUrl?: string };
    kimi: { apiKey: string; model: string; baseUrl?: string };
    glm: { apiKey: string; model: string; baseUrl?: string };
  };

  // 提示词配置
  promptTemplates: PromptTemplate[];
  defaultTemplate: string;

  // 显示设置
  showPronunciation: boolean;
  showExplanations: boolean;
  showAlternatives: boolean;
  showExamples: boolean;

  // 行为设置
  autoCopy: boolean;
  autoReplace: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
}
```

## 2. 辅助功能模块

### 2.1 缓存模块

- 翻译结果缓存（LRU）
- 缓存过期策略
- 手动清除缓存

### 2.2 快捷操作模块

- 悬浮按钮（hover 显示翻译图标）
- 状态栏快捷操作
- 右键菜单集成

## 3. 命令清单

| 命令 ID                               | 命令名称              | 上下文             |
| ------------------------------------- | --------------------- | ------------------ |
| `llm-translation.translate`           | Transform（智能翻译） | editorHasSelection |
| `llm-translation.translateSimple`     | Transform（简版模式） | editorHasSelection |
| `llm-translation.translateFull`       | Transform（侧边栏）   | editorHasSelection |
| `llm-translation.translateAndReplace` | 翻译并替换            | editorHasSelection |
| `llm-translation.openSettings`        | 打开设置              | -                  |
| `llm-translation.clearCache`          | 清除缓存              | -                  |
| `llm-translation.toggleDisplayMode`   | 切换显示模式          | -                  |

## 4. 配置清单

| 配置项                                            | 类型    | 默认值               | 说明                        |
| ------------------------------------------------- | ------- | -------------------- | --------------------------- |
| `llmTranslation.defaultProvider`                  | string  | 'qwen'               | 默认翻译提供商              |
| `llmTranslation.autoDetectLanguage`               | boolean | true                 | 自动检测语言并智能翻译      |
| `llmTranslation.languagePair`                     | object  | {zh: 'en', en: 'zh'} | 智能翻译语言对映射          |
| `llmTranslation.providers.*.apiKey`               | string  | ''                   | API 密钥                    |
| `llmTranslation.providers.*.model`                | string  | -                    | 模型名称                    |
| `llmTranslation.promptTemplate`                   | string  | -                    | 自定义提示词                |
| `llmTranslation.showDetails`                      | boolean | true                 | 显示详细信息                |
| `llmTranslation.autoCopy`                         | boolean | false                | 自动复制结果                |
| `llmTranslation.displayMode`                      | string  | 'simple'             | 默认显示模式: simple/normal |
| `llmTranslation.simpleMode.autoHide`              | boolean | true                 | 简版模式点击外部自动隐藏    |
| `llmTranslation.simpleMode.autoHideDelay`         | number  | 300                  | 简版模式自动隐藏延迟(ms)    |
| `llmTranslation.simpleMode.showAlternatives`      | boolean | true                 | 简版模式显示替代翻译        |
| `llmTranslation.simpleMode.maxAlternatives`       | number  | 2                    | 简版模式最多显示替代翻译数  |
| `llmTranslation.simpleMode.showPronunciation`     | boolean | false                | 简版模式显示发音            |
| `llmTranslation.simpleMode.showLanguageDirection` | boolean | false                | 简版模式显示语言方向        |
| `llmTranslation.simpleMode.showProvider`          | boolean | false                | 简版模式显示提供商          |
| `llmTranslation.simpleMode.showDuration`          | boolean | false                | 简版模式显示请求耗时        |
| `llmTranslation.simpleMode.showExpandButton`      | boolean | true                 | 简版模式显示"查看详情"按钮  |

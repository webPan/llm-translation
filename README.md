# LLM Translation

一款支持多种大语言模型的 VS Code 翻译插件，提供简洁高效的翻译体验。

## 功能特性

- 🤖 **多 LLM 支持**: 支持 DeepSeek、千问、Kimi、智谱 GLM 等主流大模型
- ⚡ **双模式显示**: 简版悬浮卡片快速翻译，正常模式完整功能
- 🎯 **快捷操作**: 右键菜单、快捷键、状态栏多种触发方式


## 快速开始

1. 安装插件
2. 配置 API Key（打开设置或运行命令 `LLM Translation: Set API Key`）
3. 选中文字，右键选择 "Translate Selection" 或使用快捷键 `Ctrl+Shift+T`

## 配置说明

### API Key 配置

在 VS Code 设置中搜索 "LLM Translation"，配置以下选项：

```json
{
  "llmTranslation.providers.deepseek.apiKey": "your-deepseek-api-key",
  "llmTranslation.providers.qwen.apiKey": "your-qwen-api-key",
  "llmTranslation.providers.kimi.apiKey": "your-kimi-api-key",
  "llmTranslation.providers.glm.apiKey": "your-glm-api-key"
}
```

### 显示模式

```json
{
  "llmTranslation.displayMode": "simple", // "simple" 或 "normal"
  "llmTranslation.simpleMode.showPronunciation": false,
  "llmTranslation.simpleMode.showAlternatives": true
}
```

## 快捷键

| 快捷键 | 功能 |
|-------|------|
| `Ctrl+Shift+T` | 翻译选中文本 |
| `Ctrl+Shift+R` | 翻译并替换 |

## 命令列表

- `LLM Translation: Translate Selection` - 翻译选中文本
- `LLM Translation: Translate to English` - 翻译为英语
- `LLM Translation: Translate to Chinese` - 翻译为中文
- `LLM Translation: Translate to Japanese` - 翻译为日语
- `LLM Translation: Translate and Replace` - 翻译并替换
- `LLM Translation: Open Settings` - 打开设置
- `LLM Translation: Set API Key` - 设置 API Key

## 开发计划

- [x] Phase 1: MVP 核心功能（已完成）
- [ ] Phase 2: 多 LLM 支持与提示词系统
- [ ] Phase 3: 正常模式面板与历史记录
- [ ] Phase 4: 优化与发布

## 反馈与支持

如有问题或建议，请在 [GitHub Issues](https://github.com/your-repo/llm-translation/issues) 中反馈。

## License

MIT

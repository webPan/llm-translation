# 开发计划文档

## 项目概述

**项目名称**: LLM Translation for VS Code
**目标**: 开发一款支持多 LLM 服务商的 VS Code 翻译插件
**预计开发周期**: 4 周
**开发模式**: 敏捷迭代

---

## 一、开发阶段划分

```
Phase 1 (Week 1-2)     Phase 2 (Week 3-4)
    MVP 核心功能           功能完善
    ├─ 基础架构            ├─ 提示词系统
    ├─ 单个 LLM 支持       ├─ 多 LLM 支持
    ├─ 简版翻译            ├─ 正常模式面板
    └─ 基础设置            ├─ 配置系统
                           └─ 错误处理
```

---

## 二、详细开发计划

### Phase 1: MVP 核心功能 (Week 1-2)

#### Week 1: 项目搭建与基础架构

| 天数 | 任务 | 输出物 | 预估工时 |
|-----|------|--------|---------|
| Day 1 | 项目初始化，搭建开发环境 | 可运行的 Hello World 插件 | 4h |
| Day 1 | 设计类型定义和接口 | `types/index.ts` | 2h |
| Day 2 | 实现 LLM Provider 基类 | `providers/base.ts` | 4h |
| Day 2 | 实现第一个 Provider (DeepSeek) | `providers/deepseek.ts` | 4h |
| Day 3 | 实现 HTTP 工具层 | `utils/http.ts` | 3h |
| Day 3 | 实现翻译服务核心 | `services/translator.ts` | 5h |
| Day 4 | 实现简版模式 UI (Lit Components) | `webview/simplePanelController.ts` | 6h |
| Day 5 | 注册基础命令 | `commands/translate.ts` | 4h |
| Day 5 | 单元测试与调试 | 测试用例 | 4h |

**Week 1 里程碑**: 
- ✅ 可以翻译选中文本
- ✅ 简版悬浮卡片显示
- ✅ 基础设置配置

#### Week 2: 设置系统与错误处理

| 天数 | 任务 | 输出物 | 预估工时 |
|-----|------|--------|---------|
| Day 6 | 实现配置管理服务 | `services/config.ts` | 4h |
| Day 6 | 设计配置 Schema | `package.json` contributes | 3h |
| Day 7 | 实现设置页面 (Lit + vscode-elements) | `webview/panels/SettingsPanelController.ts` | 6h |
| Day 8 | 添加 Provider 配置 UI | 使用 vscode-elements 组件 | 5h |
| Day 9 | 实现错误处理机制 | `utils/error.ts` | 3h |
| Day 9 | 添加通知和状态栏 | `utils/statusBar.ts` | 3h |
| Day 10 | 集成测试与 Bug 修复 | - | 6h |
| Day 10 | Week 2 代码审查 | - | 2h |

**Week 2 里程碑**:
- ✅ 完整的配置系统
- ✅ 基础错误处理
- ✅ 可配置 API Key

---

### Phase 2: 功能完善 (Week 3-4)

#### Week 3: 多 LLM 支持与提示词系统

| 天数 | 任务 | 输出物 | 预估工时 |
|-----|------|--------|---------|
| Day 11 | 实现千问 (Qwen) Provider | `providers/qwen.ts` | 4h |
| Day 11 | 实现 Kimi Provider | `providers/kimi.ts` | 4h |
| Day 12 | 实现 GLM Provider | `providers/glm.ts` | 4h |
| Day 12 | Provider 切换功能 | `providers/index.ts` | 3h |
| Day 13 | 设计提示词模板系统 | `services/promptManager.ts` | 5h |
| Day 14 | 实现内置提示词模板 | 3 个基础模板 | 4h |
| Day 14 | 实现提示词编辑器 | 设置页面模板编辑 | 4h |
| Day 15 | 正常模式面板框架 (Lit Components) | `webview/panels/FullPanelController.ts` | 6h |

**Week 3 里程碑**:
- ✅ 4 个 LLM 全部可用
- ✅ 提示词模板系统
- ✅ Provider 自动切换

#### Week 4: 正常模式面板与结果解析

| 天数 | 任务 | 输出物 | 预估工时 |
|-----|------|--------|---------|
| Day 16 | 实现结果解析引擎 | `services/parser.ts` | 6h |
| Day 17 | 正常模式 - 翻译结果显示 | 结果面板 UI | 5h |
| Day 18 | 正常模式 - 词汇详解/例句 | 折叠面板组件 | 5h |
| Day 19 | 正常模式 - 语言切换 | 语言选择器 | 3h |
| Day 19 | 正常模式 - 操作按钮 | 复制/替换 | 4h |
| Day 20 | 简版与正常模式切换 | 模式切换逻辑 | 4h |
| Day 20 | 集成测试 | - | 4h |

**Week 4 里程碑**:
- ✅ 完整正常模式面板
- ✅ JSON/Markdown 解析
- ✅ 双模式切换

---

## 三、技术栈与依赖

### 核心依赖

```json
{
  "dependencies": {
    "axios": "^1.6.0",                        // HTTP 请求
    "lodash-es": "^4.17.21",                   // 工具函数
    "lit": "^3.0.0",                           // Web Components 框架
    "@vscode-elements/elements": "^1.0.0"     // VS Code 官方 UI 组件库
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "esbuild": "^0.19.0",                      // 打包工具
    "vitest": "^1.0.0",                        // 单元测试
    "@vscode/test-cli": "^0.0.4"               // 集成测试
  }
}
```

### B. 参考资源

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

**文档版本**: v1.0  
**最后更新**: 2026-02-03  
**维护者**: Development Team

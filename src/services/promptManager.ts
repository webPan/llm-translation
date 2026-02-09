import * as vscode from 'vscode';
import { PromptTemplate, Language } from '../types';

// Built-in prompt templates
const BUILTIN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'default',
    name: '标准翻译',
    description: '通用翻译模板，提供准确自然的翻译',
    template: `请将以下文本从 {sourceLang} 翻译为 {targetLang}：

{text}

请以 JSON 格式返回：
{
  "translation": "主要翻译结果",
  "pronunciation": "发音（如适用）",
  "alternatives": ["替代翻译1", "替代翻译2"],
  "explanations": [
    {"word": "关键词", "meaning": "释义", "pos": "词性"}
  ],
  "examples": [
    {"original": "例句原文", "translation": "例句翻译"}
  ]
}`,
  },
  {
    id: 'academic',
    name: '学术翻译',
    description: '适合学术论文、技术文档的正式翻译',
    template: `你是一位专业学术翻译专家。请将以下学术文本从 {sourceLang} 翻译为 {targetLang}，保持学术严谨性和专业术语的准确性：

{text}

请以 JSON 格式返回：
{
  "translation": "学术翻译结果，使用正式术语",
  "pronunciation": "",
  "alternatives": ["备选学术表达1", "备选学术表达2"],
  "explanations": [
    {"word": "专业术语", "meaning": "术语解释", "pos": "词性"}
  ],
  "examples": []
}`,
  },
  {
    id: 'casual',
    name: '口语翻译',
    description: '适合日常对话、口语化表达的翻译',
    template: `请将以下口语化文本从 {sourceLang} 翻译为 {targetLang}，使用自然、地道的口语表达：

{text}

请以 JSON 格式返回：
{
  "translation": "口语化翻译结果",
  "pronunciation": "发音",
  "alternatives": ["更随意的说法", "更礼貌的说法"],
  "explanations": [
    {"word": "口语表达", "meaning": "解释说明", "pos": ""}
  ],
  "examples": [
    {"original": "日常例句", "translation": "中文翻译"}
  ]
}`,
  },
  {
    id: 'code',
    name: '代码注释翻译',
    description: '适合翻译代码注释和文档',
    template: `你是一位程序员。请将以下代码注释/文档从 {sourceLang} 翻译为 {targetLang}，保持技术术语准确，代码示例不翻译：

{text}

请以 JSON 格式返回：
{
  "translation": "技术翻译结果",
  "pronunciation": "",
  "alternatives": [],
  "explanations": [
    {"word": "技术术语", "meaning": "技术解释", "pos": ""}
  ],
  "examples": []
}`,
  },
  {
    id: 'abbreviation',
    name: '中译英简写',
    description: '中文转合规英文简写，支持小驼峰/全小写，字符≤12，出1-3个方案',
    template: `你是中文内容英文简写生成专家，核心职责是接收用户输入的中文内容，输出符合规范的英文简写方案。

任务与执行规范
- 命名格式要求：输出方案仅限小驼峰命名（首字母小写，其余单词首字母大写）或全小写格式。如\`springFestival\`、\`chineseNewYear\`、\`cny\`
- 简写核心原则：
  - 翻译为英文时，优先采用常见缩写 / 缩略词，确保保留原文主要字面含义；
  - 每个方案长度尽量≤12 字符，若简写后仍超 12 字符，需进一步提炼仅保留最核心含义；
  - 支持生成1-3 个可选方案，若有更短且含义准确的简写（如单词首字母组合），可作为候选项补充。

需要简写的内容
{text}

输出格式，严格执行
{
  "translation": "主要简写结果",
  "alternatives": ["替代简写1", "替代简写2"]
}`,
  },
];

export class PromptManager {
  private static readonly CUSTOM_TEMPLATES_KEY = 'llmTranslation.customPromptTemplates';
  private static readonly DEFAULT_TEMPLATE_KEY = 'llmTranslation.defaultPromptTemplate';

  // Get all available templates (built-in + custom)
  getAllTemplates(): PromptTemplate[] {
    const customTemplates = this.getCustomTemplates();
    return [...BUILTIN_TEMPLATES, ...customTemplates];
  }

  // Get built-in templates
  getBuiltinTemplates(): PromptTemplate[] {
    return [...BUILTIN_TEMPLATES];
  }

  // Get custom templates from configuration
  getCustomTemplates(): PromptTemplate[] {
    const config = vscode.workspace.getConfiguration();
    return config.get<PromptTemplate[]>(PromptManager.CUSTOM_TEMPLATES_KEY, []);
  }

  // Get default template ID
  getDefaultTemplateId(): string {
    const config = vscode.workspace.getConfiguration();
    return config.get<string>(PromptManager.DEFAULT_TEMPLATE_KEY, 'default');
  }

  // Get a template by ID
  getTemplate(id: string): PromptTemplate | undefined {
    const allTemplates = this.getAllTemplates();
    console.log('[PromptManager] Looking for template:', id);
    console.log(
      '[PromptManager] Available templates:',
      allTemplates.map((t) => ({ id: t.id, name: t.name })),
    );
    const found = allTemplates.find((t) => t.id === id);
    console.log(
      '[PromptManager] Found template:',
      found ? { id: found.id, name: found.name } : 'NOT FOUND',
    );
    return found;
  }

  // Build prompt with variables replaced
  buildPrompt(
    templateId: string,
    text: string,
    sourceLang: Language,
    targetLang: Language,
  ): string {
    console.log('[PromptManager] buildPrompt called with templateId:', templateId);
    const template = this.getTemplate(templateId);
    if (!template) {
      console.warn(
        '[PromptManager] Template not found, falling back to default. Requested:',
        templateId,
      );
      // Fallback to default template
      return this.buildPrompt('default', text, sourceLang, targetLang);
    }

    const langNames: Record<string, string> = {
      zh: '中文',
      en: '英文',
      ja: '日文',
      auto: '自动检测语言',
    };

    return template.template
      .replace(/\{text\}/g, text)
      .replace(/\{sourceLang\}/g, langNames[sourceLang] || sourceLang)
      .replace(/\{targetLang\}/g, langNames[targetLang] || targetLang);
  }

  // Add a custom template
  async addCustomTemplate(template: Omit<PromptTemplate, 'id'>): Promise<void> {
    const customTemplates = this.getCustomTemplates();
    const newTemplate: PromptTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
    };

    const config = vscode.workspace.getConfiguration();
    await config.update(
      PromptManager.CUSTOM_TEMPLATES_KEY,
      [...customTemplates, newTemplate],
      true,
    );
  }

  // Update a custom template
  async updateCustomTemplate(template: PromptTemplate): Promise<void> {
    const customTemplates = this.getCustomTemplates();
    const index = customTemplates.findIndex((t) => t.id === template.id);

    if (index === -1) {
      throw new Error('模板不存在');
    }

    customTemplates[index] = template;

    const config = vscode.workspace.getConfiguration();
    await config.update(PromptManager.CUSTOM_TEMPLATES_KEY, customTemplates, true);
  }

  // Delete a custom template
  async deleteCustomTemplate(id: string): Promise<void> {
    const customTemplates = this.getCustomTemplates();
    const filtered = customTemplates.filter((t) => t.id !== id);

    const config = vscode.workspace.getConfiguration();
    await config.update(PromptManager.CUSTOM_TEMPLATES_KEY, filtered, true);
  }

  // Set default template
  async setDefaultTemplate(id: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(PromptManager.DEFAULT_TEMPLATE_KEY, id, true);
  }

  // Export templates to JSON
  exportTemplates(options?: { includeBuiltin?: boolean }): string {
    const includeBuiltin = options?.includeBuiltin === true;
    const templates = includeBuiltin ? this.getAllTemplates() : this.getCustomTemplates();

    const payload = {
      version: 1,
      defaultId: this.getDefaultTemplateId(),
      templates,
    };

    return JSON.stringify(payload, null, 2);
  }

  // Import templates from JSON
  async importTemplates(
    json: string,
    options?: { conflictStrategy?: 'rename'; setDefault?: boolean },
  ): Promise<{ importedCount: number; defaultApplied: boolean }> {
    try {
      const parsed = JSON.parse(json);
      const payload = Array.isArray(parsed) ? { templates: parsed } : parsed;
      const templates = Array.isArray(payload?.templates) ? payload.templates : null;
      if (!templates) {
        throw new Error('导入模板失败：未找到模板数组');
      }

      const defaultId = typeof payload?.defaultId === 'string' ? payload.defaultId : undefined;
      const customTemplates = this.getCustomTemplates();
      const builtinIds = new Set(BUILTIN_TEMPLATES.map((t) => t.id));
      const existingIds = new Set(customTemplates.map((t) => t.id));
      const merged = [...customTemplates];
      const idMap = new Map<string, string>();
      let counter = 0;

      const createId = () => `custom-${Date.now()}-${counter++}`;

      for (const item of templates) {
        if (!item || typeof item !== 'object') continue;
        const name = String((item as any).name || '').trim();
        const template = String((item as any).template || '').trim();
        if (!name || !template) continue;

        let id = typeof (item as any).id === 'string' ? (item as any).id.trim() : '';
        if (!id) id = createId();
        const originalId = id;

        if (builtinIds.has(id) || existingIds.has(id)) {
          id = createId();
        }

        if (id !== originalId) {
          idMap.set(originalId, id);
        }

        const normalized: PromptTemplate = {
          id,
          name,
          description:
            typeof (item as any).description === 'string' ? (item as any).description : '',
          template,
        };

        merged.push(normalized);
        existingIds.add(id);
      }

      const config = vscode.workspace.getConfiguration();
      await config.update(PromptManager.CUSTOM_TEMPLATES_KEY, merged, true);

      let defaultApplied = false;
      if (options?.setDefault && defaultId) {
        const resolved =
          idMap.get(defaultId) ||
          (existingIds.has(defaultId) || builtinIds.has(defaultId) ? defaultId : undefined);
        if (resolved) {
          await this.setDefaultTemplate(resolved);
          defaultApplied = true;
        }
      }

      return { importedCount: merged.length - customTemplates.length, defaultApplied };
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('导入模板失败')) {
        throw error;
      }
      throw new Error('导入模板失败：无效的 JSON 格式');
    }
  }

  // Get available variables for templates
  getAvailableVariables(): { name: string; description: string }[] {
    return [
      { name: '{text}', description: '要翻译的文本' },
      { name: '{sourceLang}', description: '源语言名称' },
      { name: '{targetLang}', description: '目标语言名称' },
    ];
  }
}

// Singleton instance
let promptManager: PromptManager | undefined;

export function getPromptManager(): PromptManager {
  if (!promptManager) {
    promptManager = new PromptManager();
  }
  return promptManager;
}

export function resetPromptManager(): void {
  promptManager = undefined;
}

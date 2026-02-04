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
    return this.getAllTemplates().find(t => t.id === id);
  }
  
  // Build prompt with variables replaced
  buildPrompt(
    templateId: string,
    text: string,
    sourceLang: Language,
    targetLang: Language
  ): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      // Fallback to default template
      return this.buildPrompt('default', text, sourceLang, targetLang);
    }
    
    const langNames: Record<string, string> = {
      'zh': '中文',
      'en': '英文',
      'ja': '日文',
      'auto': '自动检测语言',
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
      true
    );
  }
  
  // Update a custom template
  async updateCustomTemplate(template: PromptTemplate): Promise<void> {
    const customTemplates = this.getCustomTemplates();
    const index = customTemplates.findIndex(t => t.id === template.id);
    
    if (index === -1) {
      throw new Error('模板不存在');
    }
    
    customTemplates[index] = template;
    
    const config = vscode.workspace.getConfiguration();
    await config.update(
      PromptManager.CUSTOM_TEMPLATES_KEY,
      customTemplates,
      true
    );
  }
  
  // Delete a custom template
  async deleteCustomTemplate(id: string): Promise<void> {
    const customTemplates = this.getCustomTemplates();
    const filtered = customTemplates.filter(t => t.id !== id);
    
    const config = vscode.workspace.getConfiguration();
    await config.update(
      PromptManager.CUSTOM_TEMPLATES_KEY,
      filtered,
      true
    );
  }
  
  // Set default template
  async setDefaultTemplate(id: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(PromptManager.DEFAULT_TEMPLATE_KEY, id, true);
  }
  
  // Export templates to JSON
  exportTemplates(): string {
    return JSON.stringify(this.getAllTemplates(), null, 2);
  }
  
  // Import templates from JSON
  async importTemplates(json: string): Promise<void> {
    try {
      const templates: PromptTemplate[] = JSON.parse(json);
      const validTemplates = templates.filter(t => 
        t.id && t.name && t.template && 
        !BUILTIN_TEMPLATES.some(bt => bt.id === t.id)
      );
      
      const config = vscode.workspace.getConfiguration();
      await config.update(
        PromptManager.CUSTOM_TEMPLATES_KEY,
        validTemplates,
        true
      );
    } catch (error) {
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

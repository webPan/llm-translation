import * as vscode from 'vscode';
import { DeepSeekProvider } from './deepseek';
import { QwenProvider } from './qwen';
import { KimiProvider } from './kimi';
import { GlmProvider } from './glm';
import { LLMProvider, ProviderId, ProviderConfig, TranslateOptions, TranslationResult } from '../types';
import { getPromptManager } from '../services/promptManager';

export class ProviderManager {
  private providers: Map<ProviderId, LLMProvider> = new Map();
  private context: vscode.ExtensionContext;
  
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.initializeProviders();
  }
  
  private initializeProviders(): void {
    const config = vscode.workspace.getConfiguration('llmTranslation');

    // Initialize DeepSeek
    const deepseekConfig: ProviderConfig = {
      id: 'deepseek',
      name: 'DeepSeek',
      apiKey: config.get('providers.deepseek.apiKey', ''),
      model: config.get('providers.deepseek.model', 'deepseek-chat'),
      baseUrl: config.get('providers.deepseek.baseUrl', 'https://api.deepseek.com'),
    };
    this.providers.set('deepseek', new DeepSeekProvider(deepseekConfig));

    // Initialize Qwen (千问)
    const qwenConfig: ProviderConfig = {
      id: 'qwen',
      name: '千问 (Qwen)',
      apiKey: config.get('providers.qwen.apiKey', ''),
      model: config.get('providers.qwen.model', 'qwen-turbo'),
      baseUrl: config.get('providers.qwen.baseUrl', 'https://dashscope.aliyuncs.com/api/v1'),
    };
    this.providers.set('qwen', new QwenProvider(qwenConfig));

    // Initialize Kimi
    const kimiConfig: ProviderConfig = {
      id: 'kimi',
      name: 'Kimi',
      apiKey: config.get('providers.kimi.apiKey', ''),
      model: config.get('providers.kimi.model', 'moonshot-v1-8k'),
      baseUrl: config.get('providers.kimi.baseUrl', 'https://api.moonshot.cn/v1'),
    };
    this.providers.set('kimi', new KimiProvider(kimiConfig));

    // Initialize GLM (智谱)
    const glmConfig: ProviderConfig = {
      id: 'glm',
      name: '智谱 GLM',
      apiKey: config.get('providers.glm.apiKey', ''),
      model: config.get('providers.glm.model', 'glm-4'),
      baseUrl: config.get('providers.glm.baseUrl', 'https://open.bigmodel.cn/api/paas/v4'),
    };
    this.providers.set('glm', new GlmProvider(glmConfig));
  }
  
  getProvider(id: ProviderId): LLMProvider | undefined {
    return this.providers.get(id);
  }
  
  getDefaultProvider(): LLMProvider {
    const config = vscode.workspace.getConfiguration('llmTranslation');
    const defaultProviderId = config.get<ProviderId>('defaultProvider', 'deepseek');
    
    const provider = this.providers.get(defaultProviderId);
    if (!provider) {
      throw new Error(`未找到 Provider: ${defaultProviderId}`);
    }
    
    return provider;
  }
  
  async translateWithDefault(
    text: string,
    options: Omit<TranslateOptions, 'text'>
  ): Promise<TranslationResult> {
    const provider = this.getDefaultProvider();
    
    if (!provider.validateConfig()) {
      const action = await vscode.window.showErrorMessage(
        `${provider.name} API Key 未配置，请先配置 API Key`,
        '打开设置'
      );
      
      if (action === '打开设置') {
        vscode.commands.executeCommand('llm-translation.openSettings');
      }
      
      throw new Error('API Key 未配置');
    }
    
    // Get the default prompt template ID
    const promptManager = getPromptManager();
    const defaultTemplateId = promptManager.getDefaultTemplateId();
    console.log('[LLM Translation] Using prompt template:', defaultTemplateId);
    
    return provider.translate(text, { 
      ...options, 
      text,
      promptTemplate: defaultTemplateId
    });
  }
  
  reloadProviders(): void {
    this.providers.clear();
    this.initializeProviders();
  }
  
  getAvailableProviders(): { id: ProviderId; name: string; configured: boolean }[] {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      name: provider.name,
      configured: provider.validateConfig(),
    }));
  }
}

// Singleton instance
let providerManager: ProviderManager | undefined;

export function getProviderManager(context: vscode.ExtensionContext): ProviderManager {
  if (!providerManager) {
    providerManager = new ProviderManager(context);
  }
  return providerManager;
}

export function resetProviderManager(): void {
  providerManager = undefined;
}

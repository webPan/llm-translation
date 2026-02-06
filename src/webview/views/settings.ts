/**
 * 设置页面入口
 *
 * 使用 Lit 和 @vscode-elements/elements 重构
 */

import { post, request } from '../core/bridge';
import { showToast } from '../core/toast';
import '../components/settings/settings-page';
import type { SettingsPage } from '../components/settings/settings-page';
import type { GeneralConfig } from '../components/settings/settings-form';
import type { ProviderConfig } from '../components/settings/provider-card';
import type { PromptTemplate } from '../components/settings/template-list';

interface AppConfig {
  general: GeneralConfig;
  providers: Record<string, ProviderConfig>;
}

async function init() {
  const app = document.getElementById('app') as SettingsPage | null;
  if (!app) {
    console.error('App element not found');
    return;
  }

  // 加载配置
  try {
    const [generalConfig, providersData, templatesData] = await Promise.all([
      request<undefined, any>('config.get'),
      request<undefined, any>('config.providers.get'),
      request<undefined, any>('config.templates.get')
    ]);

    const config: AppConfig = {
      general: {
        defaultProvider: generalConfig?.defaultProvider || 'deepseek',
        displayMode: generalConfig?.displayMode || 'simple',
        defaultTargetLang: generalConfig?.defaultTargetLang || 'zh'
      },
      providers: providersData?.providers || {}
    };

    app.setConfig(config);
    app.setTemplates(
      templatesData?.templates || [],
      templatesData?.defaultId || 'default'
    );
  } catch (error) {
    console.error('Failed to load config:', error);
    showToast('加载配置失败', { type: 'error' });
  }

  // 监听保存事件
  app.addEventListener('save-general', async (e: Event) => {
    const detail = (e as CustomEvent<GeneralConfig>).detail;
    try {
      await Promise.all([
        request('config.update', { key: 'defaultProvider', value: detail.defaultProvider }),
        request('config.update', { key: 'displayMode', value: detail.displayMode }),
        request('config.update', { key: 'defaultTargetLang', value: detail.defaultTargetLang })
      ]);
      showToast('设置已保存', { type: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败，请重试';
      showToast(message, { type: 'error' });
    }
  });

  app.addEventListener('save-provider', async (e: Event) => {
    const detail = (e as CustomEvent<ProviderConfig>).detail;
    try {
      await request('config.providers.update', {
        providerId: detail.id,
        config: {
          apiKey: detail.apiKey,
          apiEndpoint: detail.baseUrl,
          model: detail.model
        }
      });
      showToast('服务商配置已保存', { type: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败，请重试';
      showToast(message, { type: 'error' });
    }
  });

  // 模板事件
  app.addEventListener('template-save', async (e: Event) => {
    const detail = (e as CustomEvent<PromptTemplate>).detail;
    try {
      await request('config.templates.save', { template: detail });
      showToast('模板已保存', { type: 'success' });
      refreshTemplates();
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败';
      showToast(message, { type: 'error' });
    }
  });

  app.addEventListener('template-delete', async (e: Event) => {
    const detail = (e as CustomEvent<PromptTemplate>).detail;
    try {
      await request('config.templates.delete', { id: detail.id });
      showToast('模板已删除', { type: 'success' });
      refreshTemplates();
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败';
      showToast(message, { type: 'error' });
    }
  });

  app.addEventListener('template-set-default', async (e: Event) => {
    const templateId = (e as CustomEvent<string>).detail;
    try {
      await request('config.templates.setDefault', { id: templateId });
      showToast('默认模板已设置', { type: 'success' });
      refreshTemplates();
    } catch (error) {
      const message = error instanceof Error ? error.message : '设置失败';
      showToast(message, { type: 'error' });
    }
  });

  app.addEventListener('template-import', async () => {
    try {
      // 在 webview 中显示导入对话框
      const importJson = prompt('请粘贴模板 JSON：');
      if (importJson) {
        await request('config.templates.import', { json: importJson });
        showToast('模板已导入', { type: 'success' });
        refreshTemplates();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '导入失败';
      showToast(message, { type: 'error' });
    }
  });

  app.addEventListener('template-export', async () => {
    try {
      const result = await request<string, any>('config.templates.export');
      const json = result?.templates || '[]';
      // 复制到剪贴板
      await navigator.clipboard.writeText(json);
      showToast('模板 JSON 已复制到剪贴板', { type: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '导出失败';
      showToast(message, { type: 'error' });
    }
  });

  app.addEventListener('template-copy', async (e: Event) => {
    const detail = (e as CustomEvent<PromptTemplate>).detail;
    try {
      const newTemplate: PromptTemplate = {
        ...detail,
        id: `custom-${Date.now()}`,
        name: `${detail.name} (复制)`,
        isBuiltin: false
      };
      await request('config.templates.save', { template: newTemplate });
      showToast('模板已复制', { type: 'success' });
      refreshTemplates();
    } catch (error) {
      const message = error instanceof Error ? error.message : '复制失败';
      showToast(message, { type: 'error' });
    }
  });

  // 刷新模板列表
  async function refreshTemplates() {
    const templatesData = await request<undefined, any>('config.templates.get');
    const currentApp = document.getElementById('app') as SettingsPage | null;
    if (currentApp) {
      currentApp.setTemplates(
        templatesData?.templates || [],
        templatesData?.defaultId || 'default'
      );
    }
  }

  // 通知面板已就绪
  post('panel.focus');
}

// 等待 DOM 就绪
document.addEventListener('DOMContentLoaded', init);

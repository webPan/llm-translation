/**
 * 设置页面入口
 * 
 * 使用 Lit 和 @vscode-elements/elements 重构
 */

import { post, request } from '../core/bridge';
import '../components/settings/settings-page';
import type { SettingsPage } from '../components/settings/settings-page';
import type { GeneralConfig } from '../components/settings/settings-form';
import type { ProviderConfig } from '../components/settings/provider-card';

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
    const [generalConfig, providersData] = await Promise.all([
      request<undefined, any>('config.get'),
      request<undefined, any>('config.providers.get')
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
  } catch (error) {
    console.error('Failed to load config:', error);
    post('notification.show', { 
      message: '加载配置失败', 
      type: 'error' 
    });
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
      post('notification.show', { message: '设置已保存', type: 'info' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败';
      post('notification.show', { message, type: 'error' });
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
      post('notification.show', { message: '服务商配置已保存', type: 'info' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败';
      post('notification.show', { message, type: 'error' });
    }
  });

  // 通知面板已就绪
  post('panel.focus');
}

// 等待 DOM 就绪
document.addEventListener('DOMContentLoaded', init);

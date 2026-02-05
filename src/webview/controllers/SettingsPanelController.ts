import * as vscode from 'vscode';
import { ProviderManager } from '../../providers';
import { BasePanelController, BasePanelManager, type BridgeMessage } from './BasePanelController';

/**
 * 设置面板控制器
 * 
 * 职责：
 * - 管理 WebviewPanel 生命周期
 * - 提供 HTML 入口（引用 views/settings.js）
 * - 处理来自 Webview 的消息请求
 * 
 * 注意：不包含业务 UI 代码，UI 逻辑在 views/settings.ts 中
 */
export class SettingsPanelController extends BasePanelController {
  constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    extensionContext: vscode.ExtensionContext,
    private readonly providerManager: ProviderManager
  ) {
    super(panel, extensionUri, extensionContext);
  }

  protected getPanelConfig() {
    return {
      id: 'settings-panel',
      title: 'LLM Translation 设置',
      viewType: 'llmTranslation.settings',
      retainContextWhenHidden: true,
    };
  }

  /**
   * 返回 HTML 骨架，仅引用编译后的 JS
   * UI 内容由 views/settings.ts 动态创建
   */
  protected getHtmlContent(): string {
    const nonce = this.getNonce();
    const scriptUri = this.getResourceUri('views/settings.js');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <title>LLM Translation 设置</title>
  <style>
    /* 基础重置样式 */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      display: flex;
      justify-content: center;
    }

    settings-page {
      width: 100%;
    }
  </style>
</head>
<body>
  <settings-page id="app"></settings-page>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  /**
   * 注册消息处理器
   * 处理来自 Webview 的请求
   */
  protected getMessageHandlers(): Record<string, (message: BridgeMessage) => unknown | Promise<unknown>> {
    return {
      // 面板控制
      'panel.focus': () => {
        this.focus();
      },
      'panel.close': () => {
        this.dispose();
      },

      // 通知
      'notification.show': async (message) => {
        const { message: text, type } = (message.payload || {}) as any;
        if (!text) return;
        
        const msgText = String(text);
        switch (type) {
          case 'error':
            await vscode.window.showErrorMessage(msgText);
            break;
          case 'warning':
            await vscode.window.showWarningMessage(msgText);
            break;
          default:
            await vscode.window.showInformationMessage(msgText);
        }
      },

      // 配置读取
      'config.get': async (message) => {
        const { key } = (message.payload || {}) as any;
        const config = vscode.workspace.getConfiguration('llmTranslation');
        
        if (key) {
          return config.get(key);
        }

        // 返回常用配置
        return {
          defaultProvider: config.get('defaultProvider', 'deepseek'),
          displayMode: config.get('displayMode', 'simple'),
          defaultTargetLang: config.get('defaultTargetLang', 'zh'),
          defaultPromptTemplate: config.get('defaultPromptTemplate', 'default'),
        };
      },

      // 配置更新
      'config.update': async (message) => {
        const { key, value, scope = 'user' } = (message.payload || {}) as any;
        const config = vscode.workspace.getConfiguration('llmTranslation');
        const target = scope === 'workspace'
          ? vscode.ConfigurationTarget.Workspace
          : vscode.ConfigurationTarget.Global;

        await config.update(key, value, target);
        return { success: true };
      },

      // 获取服务商配置
      'config.providers.get': async () => {
        const providers = this.providerManager.getAvailableProviders();
        const config = vscode.workspace.getConfiguration('llmTranslation');
        const defaultProvider = config.get('defaultProvider', 'deepseek');

        const providersConfig: Record<string, any> = {};
        for (const p of providers) {
          const baseUrl = config.get(`providers.${p.id}.baseUrl`, '');
          providersConfig[p.id] = {
            id: p.id,
            name: p.name,
            apiKey: config.get(`providers.${p.id}.apiKey`, ''),
            model: config.get(`providers.${p.id}.model`, ''),
            baseUrl,
            apiEndpoint: baseUrl,
            configured: p.configured,
          };
        }

        return { providers: providersConfig, defaultProvider };
      },

      // 更新服务商配置
      'config.providers.update': async (message) => {
        const { providerId, config: newConfig } = (message.payload || {}) as any;
        if (!providerId) return { success: false, error: 'Missing providerId' };

        const config = vscode.workspace.getConfiguration('llmTranslation');

        if (newConfig?.apiKey !== undefined) {
          await config.update(`providers.${providerId}.apiKey`, newConfig.apiKey, true);
        }
        if (newConfig?.model !== undefined) {
          await config.update(`providers.${providerId}.model`, newConfig.model, true);
        }
        if (newConfig?.baseUrl !== undefined) {
          await config.update(`providers.${providerId}.baseUrl`, newConfig.baseUrl, true);
        }
        if (newConfig?.apiEndpoint !== undefined) {
          // 向后兼容：settings.js 使用 apiEndpoint 字段
          await config.update(`providers.${providerId}.baseUrl`, newConfig.apiEndpoint, true);
        }

        this.providerManager.reloadProviders();
        return { success: true };
      },

      // 日志
      'log.info': (message) => {
        console.log('[SettingsPanel]', (message.payload as any)?.message);
      },
      'log.error': (message) => {
        console.error('[SettingsPanel]', (message.payload as any)?.message);
      },
    };
  }

  refreshProviders(): void {
    this.sendMessage({
      type: 'config.providers.refresh',
      timestamp: Date.now(),
      payload: {},
    });
  }

  protected override onPanelVisible(): void {
    this.refreshProviders();
  }
}

/**
 * 设置面板管理器（单例）
 */
export class SettingsPanelManager extends BasePanelManager<SettingsPanelController> {
  private static instance: SettingsPanelManager | undefined;

  private constructor(private readonly providerManager: ProviderManager) {
    super();
  }

  static getInstance(providerManager: ProviderManager): SettingsPanelManager {
    if (!SettingsPanelManager.instance) {
      SettingsPanelManager.instance = new SettingsPanelManager(providerManager);
    }
    return SettingsPanelManager.instance;
  }

  static reset(): void {
    SettingsPanelManager.instance?.disposeCurrentPanel();
    SettingsPanelManager.instance = undefined;
  }

  createOrShow(extensionUri: vscode.Uri, extensionContext: vscode.ExtensionContext): SettingsPanelController {
    if (this.currentPanel) {
      this.currentPanel.show();
      return this.currentPanel;
    }

    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;

    const panel = vscode.window.createWebviewPanel(
      'llmTranslation.settings',
      'LLM Translation 设置',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'out'),
          vscode.Uri.joinPath(extensionUri, 'node_modules'),
        ],
      }
    );

    const ctrl = new SettingsPanelController(panel, extensionUri, extensionContext, this.providerManager);
    this.setCurrentPanel(ctrl);
    return ctrl;
  }

  updateProviders(): void {
    this.currentPanel?.refreshProviders();
  }
}

export function getSettingsPanelManager(providerManager: ProviderManager): SettingsPanelManager {
  return SettingsPanelManager.getInstance(providerManager);
}

export function resetSettingsPanelManager(): void {
  SettingsPanelManager.reset();
}

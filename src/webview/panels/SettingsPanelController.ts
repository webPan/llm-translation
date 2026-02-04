import * as vscode from 'vscode';
import { ProviderManager } from '../../providers';
import { BasePanelController, BasePanelManager, type BridgeMessage } from './BasePanelController';

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
    :root {
      --background: var(--vscode-editor-background);
      --foreground: var(--vscode-editor-foreground);
      --primary: var(--vscode-button-primaryBackground);
      --primary-foreground: var(--vscode-button-primaryForeground);
      --border: var(--vscode-panel-border);
      --input-background: var(--vscode-input-background);
      --input-foreground: var(--vscode-input-foreground);
      --input-border: var(--vscode-input-border);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      background: var(--background);
      color: var(--foreground);
      padding: 16px;
      overflow: auto;
    }

    .container { max-width: 800px; margin: 0 auto; }
    .header { margin-bottom: 24px; }
    .header h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
    .header p { color: var(--vscode-descriptionForeground); }

    .tabs {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
    }

    .tab {
      padding: 8px 16px;
      background: transparent;
      border: none;
      color: var(--foreground);
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }

    .tab:hover { background: var(--vscode-toolbar-hoverBackground); }
    .tab.active { border-bottom-color: var(--primary); }

    .tab-content { display: none; }
    .tab-content.active { display: block; }

    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 8px 12px;
      background: var(--input-background);
      color: var(--input-foreground);
      border: 1px solid var(--input-border);
      border-radius: 2px;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: 1px solid var(--primary);
      outline-offset: -1px;
    }

    .btn {
      padding: 8px 16px;
      background: var(--primary);
      color: var(--primary-foreground);
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 13px;
    }

    .btn:hover { opacity: 0.9; }

    .provider-list { display: flex; flex-direction: column; gap: 12px; }
    .loading { display: none; padding: 16px; text-align: center; }
    .loading.active { display: block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LLM Translation 设置</h1>
      <p>配置您的翻译插件</p>
    </div>

    <div class="tabs">
      <button class="tab active" data-tab="general">常规</button>
      <button class="tab" data-tab="providers">服务商</button>
      <button class="tab" data-tab="templates">模板</button>
    </div>

    <div class="tab-content active" id="tab-general">
      <div class="form-group">
        <label for="default-provider">默认服务商</label>
        <select id="default-provider">
          <option value="">选择服务商...</option>
          <option value="deepseek">DeepSeek</option>
          <option value="qwen">千问 (Qwen)</option>
          <option value="kimi">Kimi</option>
          <option value="glm">智谱 GLM</option>
        </select>
      </div>

      <div class="form-group">
        <label for="display-mode">显示模式</label>
        <select id="display-mode">
          <option value="simple">简单模式</option>
          <option value="normal">完整模式</option>
        </select>
      </div>

      <div class="form-group">
        <label for="target-lang">默认目标语言</label>
        <select id="target-lang">
          <option value="zh">中文</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </div>

      <button class="btn" id="save-general">保存设置</button>
    </div>

    <div class="tab-content" id="tab-providers">
      <div id="provider-list" class="provider-list"></div>
      <button class="btn" id="add-provider">添加服务商</button>
    </div>

    <div class="tab-content" id="tab-templates">
      <div id="template-list"></div>
      <button class="btn" id="add-template">添加模板</button>
    </div>

    <div class="loading" id="loading">
      <p>加载中...</p>
    </div>
  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  protected getMessageHandlers(): Record<string, (message: BridgeMessage) => unknown | Promise<unknown>> {
    return {
      'panel.focus': () => {
        this.focus();
      },
      'panel.close': () => {
        this.dispose();
      },
      'notification.show': async (message) => {
        const { message: text, type } = (message.payload || {}) as any;
        if (!text) return;
        if (type === 'error') {
          await vscode.window.showErrorMessage(String(text));
        } else if (type === 'warning') {
          await vscode.window.showWarningMessage(String(text));
        } else {
          await vscode.window.showInformationMessage(String(text));
        }
      },

      // Configuration API for settings webview (request/response)
      'config.get': async (message) => {
        const { key } = (message.payload || {}) as any;
        const config = vscode.workspace.getConfiguration('llmTranslation');
        if (key) {
          return config.get(key);
        }

        return {
          defaultProvider: config.get('defaultProvider', 'deepseek'),
          displayMode: config.get('displayMode', 'simple'),
          defaultTargetLang: config.get('defaultTargetLang', 'zh'),
          defaultPromptTemplate: config.get('defaultPromptTemplate', 'default'),
        };
      },
      'config.update': async (message) => {
        const { key, value, scope = 'user' } = (message.payload || {}) as any;
        const config = vscode.workspace.getConfiguration('llmTranslation');
        const target = scope === 'workspace'
          ? vscode.ConfigurationTarget.Workspace
          : vscode.ConfigurationTarget.Global;

        await config.update(key, value, target);
        return { success: true };
      },
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
          // Back-compat: settings.js uses apiEndpoint field
          await config.update(`providers.${providerId}.baseUrl`, newConfig.apiEndpoint, true);
        }

        this.providerManager.reloadProviders();
        return { success: true };
      },

      'log.info': (message) => {
        console.log('[SettingsPanel]', (message.payload as any)?.message);
      },
      'log.error': (message) => {
        console.error('[SettingsPanel]', (message.payload as any)?.message);
      },
    };
  }

  refreshProviders(): void {
    // Best-effort: settings view loads via sendRequest; still useful to hint refresh.
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

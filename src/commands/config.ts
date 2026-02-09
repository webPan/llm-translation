import * as vscode from 'vscode';
import { ProviderManager } from '../providers';
import { SettingsPanelManager } from '../webview/controllers/SettingsPanelController';

export function registerConfigCommands(
  context: vscode.ExtensionContext,
  providerManager: ProviderManager,
  settingsPanelManager: SettingsPanelManager,
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  disposables.push(
    vscode.commands.registerCommand('llm-translation.openSettings', () => {
      settingsPanelManager.createOrShow(context.extensionUri, context);
    }),
  );

  disposables.push(
    vscode.commands.registerCommand('llm-translation.toggleDisplayMode', async () => {
      const config = vscode.workspace.getConfiguration('llmTranslation');
      const currentMode = config.get('displayMode', 'simple');
      const newMode = currentMode === 'simple' ? 'normal' : 'simple';

      await config.update('displayMode', newMode, true);
      vscode.window.showInformationMessage(`已切换到${newMode === 'simple' ? '简版' : '正常'}模式`);
    }),
  );

  disposables.push(
    vscode.commands.registerCommand('llm-translation.switchProvider', async () => {
      const providers = providerManager.getAvailableProviders();
      const items = providers.map((p) => ({
        label: p.name,
        description: p.configured ? '已配置' : '未配置',
        detail: p.id,
        picked: false,
        configured: p.configured,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: '选择默认翻译提供商',
      });

      if (selected) {
        if (!selected.configured) {
          const apiKey = await vscode.window.showInputBox({
            prompt: `请输入 ${selected.label} 的 API Key`,
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => {
              if (!value || value.trim().length === 0) {
                return 'API Key 不能为空';
              }
              return null;
            },
          });

          if (!apiKey) return;

          const config = vscode.workspace.getConfiguration('llmTranslation');
          await config.update(`providers.${selected.detail}.apiKey`, apiKey, true);
          providerManager.reloadProviders();
          settingsPanelManager.updateProviders();
        }

        const config = vscode.workspace.getConfiguration('llmTranslation');
        await config.update('defaultProvider', selected.detail, true);
        vscode.window.showInformationMessage(`已切换到 ${selected.label}`);
      }
    }),
  );

  // Command to quickly set API key
  disposables.push(
    vscode.commands.registerCommand('llm-translation.setApiKey', async () => {
      const providers = [
        { id: 'deepseek', name: 'DeepSeek' },
        { id: 'qwen', name: '千问 (Qwen)' },
        { id: 'kimi', name: 'Kimi' },
        { id: 'glm', name: '智谱 GLM' },
      ];

      const selected = await vscode.window.showQuickPick(
        providers.map((p) => ({ label: p.name, detail: p.id })),
        { placeHolder: '选择要配置 API Key 的提供商' },
      );

      if (!selected) return;

      const apiKey = await vscode.window.showInputBox({
        prompt: `请输入 ${selected.label} 的 API Key`,
        password: true,
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'API Key 不能为空';
          }
          return null;
        },
      });

      if (apiKey) {
        const config = vscode.workspace.getConfiguration('llmTranslation');
        await config.update(`providers.${selected.detail}.apiKey`, apiKey, true);
        vscode.window.showInformationMessage(`${selected.label} API Key 已保存`);

        // Reload providers to apply new config
        providerManager.reloadProviders();

        // Update settings panel if open
        settingsPanelManager.updateProviders();
      }
    }),
  );

  return disposables;
}

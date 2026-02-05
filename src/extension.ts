import * as vscode from 'vscode';
import { getProviderManager, resetProviderManager } from './providers';
import {
  getSimplePanelManager,
  resetSimplePanelManager,
  getFullPanelManager,
  resetFullPanelManager,
  getSettingsPanelManager,
  resetSettingsPanelManager,
} from './webview/controllers';
import { registerTranslateCommands } from './commands/translate';
import { registerConfigCommands } from './commands/config';
import { resetPromptManager } from './services/promptManager';
import { resetResultParser } from './services/parser';
import { initStatusBar, resetStatusBar } from './utils/statusBar';

// 导出面板管理器以供其他模块使用
export { getSimplePanelManager, getFullPanelManager, getSettingsPanelManager } from './webview/controllers';

export function activate(context: vscode.ExtensionContext): void {
  console.log('LLM Translation extension is now active!');

  // Initialize providers
  const providerManager = getProviderManager(context);

  // Initialize status bar
  const statusBar = initStatusBar(providerManager);
  context.subscriptions.push(statusBar);

  // Initialize panel managers
  const simplePanelManager = getSimplePanelManager();
  const fullPanelManager = getFullPanelManager();
  const settingsPanelManager = getSettingsPanelManager(providerManager);

  // Register commands
  const translateDisposables = registerTranslateCommands(
    context,
    providerManager,
    simplePanelManager,
    fullPanelManager
  );

  const configDisposables = registerConfigCommands(
    context,
    providerManager,
    settingsPanelManager
  );

  // Add all disposables to context
  context.subscriptions.push(
    ...translateDisposables,
    ...configDisposables,
    {
      dispose: () => {
        resetProviderManager();
        resetSimplePanelManager();
        resetFullPanelManager();
        resetSettingsPanelManager();
        resetPromptManager();
        resetResultParser();
        resetStatusBar();
      },
    }
  );

  // Watch configuration changes
  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('llmTranslation.providers')) {
      providerManager.reloadProviders();
      statusBar.update();
      settingsPanelManager.updateProviders();
    }
    if (e.affectsConfiguration('llmTranslation.defaultProvider')) {
      statusBar.update();
    }
  });

  context.subscriptions.push(configWatcher);

  // Show welcome message on first activation
  showWelcomeMessage(context);
}

export function deactivate(): void {
  console.log('LLM Translation extension is now deactivated!');
  resetProviderManager();
  resetSimplePanelManager();
  resetFullPanelManager();
  resetSettingsPanelManager();
  resetStatusBar();
}

async function showWelcomeMessage(context: vscode.ExtensionContext): Promise<void> {
  const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome', false);
  
  if (!hasShownWelcome) {
    const result = await vscode.window.showInformationMessage(
      '欢迎使用 LLM Translation！请先配置 API Key 开始使用。',
      '配置 API Key',
      '查看文档',
      '不再提醒'
    );
    
    if (result === '配置 API Key') {
      vscode.commands.executeCommand('llm-translation.setApiKey');
    } else if (result === '查看文档') {
      vscode.env.openExternal(
        vscode.Uri.parse('https://github.com/your-repo/llm-translation#readme')
      );
    } else if (result === '不再提醒') {
      await context.globalState.update('hasShownWelcome', true);
    }
  }
}

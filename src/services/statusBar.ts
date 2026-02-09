import * as vscode from 'vscode';
import { ProviderManager } from '../providers';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private settingsButtonItem: vscode.StatusBarItem;
  private providerManager: ProviderManager;

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;

    // 主状态栏项 - 显示当前提供商
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = 'llm-translation.switchProvider';

    // 设置按钮 - 独立的齿轮图标
    this.settingsButtonItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      99,
    );
    this.settingsButtonItem.text = '$(gear)';
    this.settingsButtonItem.command = 'llm-translation.openSettings';
    this.settingsButtonItem.tooltip = '打开 LLM Translation 设置';
    this.settingsButtonItem.show();

    this.update();
  }

  update(): void {
    const providers = this.providerManager.getAvailableProviders();
    const defaultProvider = this.providerManager.getDefaultProvider();
    const configuredProviders = providers.filter((p) => p.configured);

    // Build status bar text
    const providerName = defaultProvider.name;
    const configuredCount = configuredProviders.length;

    if (configuredCount === 0) {
      this.statusBarItem.text = `$(warning) LLM 未配置`;
      this.statusBarItem.tooltip = '点击配置 API Key';
    } else {
      this.statusBarItem.text = `$(robot) LLM: ${providerName}`;
      this.statusBarItem.tooltip = `当前提供商: ${providerName}\n已配置: ${configuredCount} 个\n点击切换提供商`;
    }

    this.statusBarItem.show();
  }

  hide(): void {
    this.statusBarItem.hide();
    this.settingsButtonItem.hide();
  }

  dispose(): void {
    this.statusBarItem.dispose();
    this.settingsButtonItem.dispose();
  }
}

// Singleton instance
let statusBarManager: StatusBarManager | undefined;

export function initStatusBar(providerManager: ProviderManager): StatusBarManager {
  if (!statusBarManager) {
    statusBarManager = new StatusBarManager(providerManager);
  }
  return statusBarManager;
}

export function getStatusBar(): StatusBarManager | undefined {
  return statusBarManager;
}

export function resetStatusBar(): void {
  if (statusBarManager) {
    statusBarManager.dispose();
    statusBarManager = undefined;
  }
}

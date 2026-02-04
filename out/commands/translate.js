"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTranslateCommands = registerTranslateCommands;
const vscode = __importStar(require("vscode"));
function registerTranslateCommands(context, providerManager, simplePanelManager, fullPanelManager) {
    const disposables = [];
    // Main translate command (uses default display mode)
    disposables.push(vscode.commands.registerCommand('llm-translation.translate', async () => {
        const config = vscode.workspace.getConfiguration('llmTranslation');
        const displayMode = config.get('displayMode', 'simple');
        if (displayMode === 'simple') {
            await translateSimple(context, providerManager, simplePanelManager, fullPanelManager);
        }
        else {
            await translateFull(context, providerManager, fullPanelManager);
        }
    }));
    // Simple mode command
    disposables.push(vscode.commands.registerCommand('llm-translation.translateSimple', async () => {
        await translateSimple(context, providerManager, simplePanelManager, fullPanelManager);
    }));
    // Full mode command
    disposables.push(vscode.commands.registerCommand('llm-translation.translateFull', async () => {
        await translateFull(context, providerManager, fullPanelManager);
    }));
    // Quick translate commands
    disposables.push(vscode.commands.registerCommand('llm-translation.translateToEnglish', async () => {
        await translateSimple(context, providerManager, simplePanelManager, fullPanelManager, 'en');
    }));
    disposables.push(vscode.commands.registerCommand('llm-translation.translateToChinese', async () => {
        await translateSimple(context, providerManager, simplePanelManager, fullPanelManager, 'zh');
    }));
    disposables.push(vscode.commands.registerCommand('llm-translation.translateToJapanese', async () => {
        await translateSimple(context, providerManager, simplePanelManager, fullPanelManager, 'ja');
    }));
    // Translate and replace
    disposables.push(vscode.commands.registerCommand('llm-translation.translateAndReplace', async () => {
        await translateAndReplace(providerManager);
    }));
    return disposables;
}
async function translateSimple(context, providerManager, simplePanelManager, fullPanelManager, forceTargetLang) {
    console.log('[LLM Translation] translateSimple called');
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('请先打开一个编辑器');
        return;
    }
    const selection = editor.selection;
    const text = editor.document.getText(selection);
    if (!text.trim()) {
        vscode.window.showWarningMessage('请先选择要翻译的文本');
        return;
    }
    console.log('[LLM Translation] Text to translate:', text);
    // Show progress
    let result;
    let error;
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: '正在翻译...',
    }, async () => {
        try {
            const config = vscode.workspace.getConfiguration('llmTranslation');
            const targetLang = forceTargetLang || getAutoTargetLang(text, config.get('defaultTargetLang', 'zh'));
            console.log('[LLM Translation] Translating to:', targetLang);
            result = await providerManager.translateWithDefault(text, {
                sourceLang: 'auto',
                targetLang,
            });
            console.log('[LLM Translation] Translation result:', result);
        }
        catch (e) {
            console.error('[LLM Translation] Translation error:', e);
            error = e instanceof Error ? e : new Error('翻译失败');
        }
    });
    // Handle error
    if (error) {
        console.error('[LLM Translation] Showing error:', error.message);
        vscode.window.showErrorMessage(error.message);
        return;
    }
    // Handle success - show result
    if (result) {
        console.log('[LLM Translation] Displaying result');
        const config = vscode.workspace.getConfiguration('llmTranslation');
        const panelMode = config.get('simpleMode.panelMode', 'inline');
        // Store original text in result for reference
        if (!result.raw) {
            result.raw = {};
        }
        result.raw.originalText = text;
        if (panelMode === 'window') {
            // Show in window mode (webview panel)
            simplePanelManager.showResult(context.extensionUri, context, result, {
                onCopy: () => {
                    vscode.env.clipboard.writeText(result.translation);
                    vscode.window.showInformationMessage('已复制');
                },
                onExpand: () => {
                    const panel = fullPanelManager.createOrShow(context.extensionUri, context);
                    panel.updateResult(result, text);
                },
                onReplace: async () => {
                    await editor.edit((editBuilder) => {
                        editBuilder.replace(selection, result.translation);
                    });
                    vscode.window.showInformationMessage('已替换');
                },
                onClose: () => {
                    // Panel closed
                },
            });
        }
        else {
            // Show in inline mode (webview panel beside editor)
            simplePanelManager.showResult(context.extensionUri, context, result, {
                onCopy: () => {
                    vscode.env.clipboard.writeText(result.translation);
                    vscode.window.showInformationMessage('已复制');
                },
                onExpand: () => {
                    const panel = fullPanelManager.createOrShow(context.extensionUri, context);
                    panel.updateResult(result, text);
                },
                onClose: () => {
                    // Panel closed
                },
            });
        }
        // Show action buttons in notification (right-bottom corner)
        const action = await vscode.window.showInformationMessage(`翻译: ${result.translation}`, '复制', '详情', '替换', '关闭');
        if (action === '复制') {
            vscode.env.clipboard.writeText(result.translation);
            vscode.window.showInformationMessage('已复制');
        }
        else if (action === '详情') {
            const panel = fullPanelManager.createOrShow(context.extensionUri, context);
            panel.updateResult(result, text);
        }
        else if (action === '替换') {
            await editor.edit((editBuilder) => {
                editBuilder.replace(selection, result.translation);
            });
            vscode.window.showInformationMessage('已替换');
        }
    }
    else {
        vscode.window.showErrorMessage('翻译失败：未返回结果');
    }
}
async function translateFull(context, providerManager, fullPanelManager) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('请先打开一个编辑器');
        return;
    }
    const selection = editor.selection;
    const text = editor.document.getText(selection);
    if (!text.trim()) {
        vscode.window.showWarningMessage('请先选择要翻译的文本');
        return;
    }
    // Create or show full panel
    const panel = fullPanelManager.createOrShow(context.extensionUri, context);
    const config = vscode.workspace.getConfiguration('llmTranslation');
    const targetLang = getAutoTargetLang(text, config.get('defaultTargetLang', 'zh'));
    // Show loading state
    panel.showLoading('正在翻译...');
    try {
        const provider = providerManager.getDefaultProvider();
        if (!provider.validateConfig()) {
            const action = await vscode.window.showErrorMessage(`${provider.name} API Key 未配置，请先配置 API Key`, '打开设置');
            if (action === '打开设置') {
                vscode.commands.executeCommand('llm-translation.openSettings');
            }
            panel.dispose();
            return;
        }
        // Execute translation
        const result = await provider.translate(text, {
            text,
            sourceLang: 'auto',
            targetLang,
        });
        // Update panel with result
        panel.updateResult(result, text);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : '翻译失败';
        vscode.window.showErrorMessage(message);
        panel.showError(message);
    }
}
function getAutoTargetLang(text, fallback) {
    const zhCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const enCount = (text.match(/[A-Za-z]/g) || []).length;
    if (zhCount > enCount) {
        return 'en';
    }
    if (enCount > zhCount) {
        return 'zh';
    }
    return fallback;
}
async function translateAndReplace(providerManager) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('请先打开一个编辑器');
        return;
    }
    const selection = editor.selection;
    const text = editor.document.getText(selection);
    if (!text.trim()) {
        vscode.window.showWarningMessage('请先选择要翻译的文本');
        return;
    }
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: '正在翻译...',
    }, async () => {
        try {
            const config = vscode.workspace.getConfiguration('llmTranslation');
            const targetLang = config.get('defaultTargetLang', 'zh');
            const result = await providerManager.translateWithDefault(text, {
                sourceLang: 'auto',
                targetLang,
            });
            // Replace selected text with translation
            await editor.edit((editBuilder) => {
                editBuilder.replace(selection, result.translation);
            });
            vscode.window.showInformationMessage('翻译并替换成功');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : '翻译失败';
            vscode.window.showErrorMessage(message);
        }
    });
}
//# sourceMappingURL=translate.js.map
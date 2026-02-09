import * as vscode from 'vscode';

const DEFAULT_DURATION_MS = 6000;
let decoration: vscode.TextEditorDecorationType | null = null;
let clearTimer: NodeJS.Timeout | null = null;

export function showInlineTranslation(
  editor: vscode.TextEditor,
  selection: vscode.Selection,
  text: string,
  durationMs: number = DEFAULT_DURATION_MS,
): void {
  clearInlineTranslation();

  const short = text.length > 80 ? `${text.slice(0, 77)}...` : text;
  const range = selection.isEmpty
    ? (editor.document.getWordRangeAtPosition(selection.active) ??
      new vscode.Range(selection.end, selection.end.translate(0, 1)))
    : selection;

  decoration = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: `${short}`,
      color: new vscode.ThemeColor('editorInlayHint.foreground'),
      backgroundColor: new vscode.ThemeColor('editorInlayHint.background'),
      margin: '0 0 0 2px',
      textDecoration: 'none; border-radius: 3px; padding: 2px 4px;',
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  });

  editor.setDecorations(decoration, [
    {
      range,
      hoverMessage: buildHoverMarkdown(text),
    },
  ]);

  clearTimer = setTimeout(
    () => {
      clearInlineTranslation();
    },
    Math.max(800, durationMs),
  );
}

export function clearInlineTranslation(): void {
  if (clearTimer) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }

  if (decoration) {
    decoration.dispose();
    decoration = null;
  }
}

function buildHoverMarkdown(text: string): vscode.MarkdownString {
  const args = encodeURIComponent(JSON.stringify([text]));
  const commandUri = `command:llm-translation.copyInlineResult?${args}`;
  const md = new vscode.MarkdownString(`${text} [$(copy)](${commandUri})`);
  md.supportThemeIcons = true;
  md.isTrusted = true;
  return md;
}

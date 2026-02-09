import '@vscode-elements/elements/dist/vscode-icon';

export type ToastType = 'info' | 'error' | 'warning' | 'success';
export type ToastPosition = 'top-right' | 'bottom-right';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
}

const DEFAULT_DURATION = 3000;
const DEFAULT_POSITION: ToastPosition = 'top-right';

let currentPosition: ToastPosition = DEFAULT_POSITION;
let container: HTMLDivElement | null = null;
let stylesInjected = false;

function ensureStyles(): void {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.id = 'global-toast-styles';
  style.textContent = `
    .global-toast-container {
      position: fixed;
      right: 16px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }

    .global-toast-container[data-position="top-right"] {
      top: 16px;
    }

    .global-toast-container[data-position="bottom-right"] {
      bottom: 16px;
      flex-direction: column-reverse;
    }

    .global-toast {
      pointer-events: auto;
      min-width: 200px;
      max-width: 320px;
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid var(--vscode-notificationToast-border, var(--vscode-panel-border));
      background: var(--vscode-notifications-background, var(--vscode-editor-background));
      color: var(--vscode-notifications-foreground, var(--vscode-editor-foreground));
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
      font-size: 12px;
      line-height: 1.5;
      animation: toast-slide-in 0.18s ease-out;
      position: relative;
      overflow: hidden;
    }

    .global-toast-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .global-toast-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex: 0 0 16px;
    }

    .global-toast-icon vscode-icon {
      font-size: 16px;
    }

    .global-toast[data-type="info"] .global-toast-icon {
      color: var(--vscode-notificationsInfoIcon-foreground, var(--vscode-textLink-foreground));
    }

    .global-toast[data-type="success"] .global-toast-icon {
      color: var(--vscode-testing-iconPassed, var(--vscode-textLink-foreground));
    }

    .global-toast[data-type="warning"] .global-toast-icon {
      color: var(--vscode-notificationsWarningIcon-foreground, var(--vscode-editorWarning-foreground));
    }

    .global-toast[data-type="error"] .global-toast-icon {
      color: var(--vscode-notificationsErrorIcon-foreground, var(--vscode-errorForeground));
    }

    @keyframes toast-slide-in {
      from {
        transform: translateX(12px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes toast-slide-out {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(12px);
        opacity: 0;
      }
    }
  `;

  document.head.appendChild(style);
  stylesInjected = true;
}

function ensureContainer(): HTMLDivElement {
  if (container && document.body.contains(container)) return container;
  container = document.createElement('div');
  container.className = 'global-toast-container';
  container.dataset.position = currentPosition;
  document.body.appendChild(container);
  return container;
}

export function setToastPosition(position: ToastPosition): void {
  currentPosition = position;
  const el = ensureContainer();
  el.dataset.position = currentPosition;
}

export function showToast(message: string, options: ToastOptions = {}): void {
  if (!message) return;
  const type = options.type ?? 'info';
  const duration = Number.isFinite(options.duration)
    ? Math.max(800, options.duration as number)
    : DEFAULT_DURATION;

  if (options.position && options.position !== currentPosition) {
    setToastPosition(options.position);
  }

  ensureStyles();
  const host = ensureContainer();

  const toast = document.createElement('div');
  toast.className = 'global-toast';
  toast.dataset.type = type;
  const content = document.createElement('div');
  content.className = 'global-toast-content';

  const icon = document.createElement('vscode-icon');
  icon.setAttribute('name', getIconName(type));

  const iconWrap = document.createElement('span');
  iconWrap.className = 'global-toast-icon';
  iconWrap.appendChild(icon);

  const text = document.createElement('span');
  text.className = 'global-toast-text';
  text.textContent = message;

  content.appendChild(iconWrap);
  content.appendChild(text);
  toast.appendChild(content);

  host.appendChild(toast);

  window.setTimeout(() => {
    toast.style.animation = 'toast-slide-out 0.18s ease-in forwards';
    window.setTimeout(() => toast.remove(), 180);
  }, duration);
}

function getIconName(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'pass';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
}

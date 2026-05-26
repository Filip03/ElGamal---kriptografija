let container;

function ensureContainer() {
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

export function notify(message, type = 'info', duration = 3500) {
    const c = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `
        <span class="toast__icon">${icons[type] ?? icons.info}</span>
        <span class="toast__text">${message}</span>
    `;

    c.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    setTimeout(() => {
        toast.classList.remove('toast--visible');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

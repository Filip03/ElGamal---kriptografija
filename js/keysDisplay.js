export function createKeysDisplay(keys) {
    const { p, g, a, ga } = keys;

    const section = document.createElement('section');
    section.className = 'result-section';
    section.innerHTML = `
        <div class="section-header">
            <h3 class="section-title">Generisani ključevi</h3>
            <span class="section-badge">Klikni vrijednost da kopiraš</span>
        </div>
        <div class="keys-grid">
            ${keyCard('p', p, 'Prost broj', 'public', 'Definiše grupu nad kojom se računa')}
            ${keyCard('g', g, 'Generator grupe', 'public', 'Primitivni korijen mod p')}
            ${keyCard('a', a, 'Privatni ključ', 'private', 'Čuva ga samo Alice — potreban za dekripciju')}
            ${keyCard('g<sup>a</sup> mod p', ga, 'Javni ključ', 'public', 'Bob koristi ovaj ključ za enkripciju')}
        </div>
    `;

    section.querySelectorAll('.key-value').forEach(el => {
        el.addEventListener('click', () => {
            navigator.clipboard.writeText(el.dataset.val).then(() => {
                el.classList.add('copied');
                setTimeout(() => el.classList.remove('copied'), 1800);
            }).catch(() => {});
        });
    });

    return section;
}

function keyCard(label, value, desc, type, tooltip) {
    return `
        <div class="key-card key-card--${type}">
            <div class="key-card__top">
                <span class="key-label">${label}</span>
                <span class="key-badge key-badge--${type}">${type === 'private' ? 'Privatno' : 'Javno'}</span>
            </div>
            <div class="key-value" data-val="${escAttr(value)}">
                <span class="key-value__text">${escHtml(value)}</span>
                <span class="key-value__icon copy-icon">⧉</span>
                <span class="key-value__icon check-icon">✓</span>
            </div>
            <div class="key-desc">
                ${desc}
                <em class="field-hint">${tooltip}</em>
            </div>
        </div>
    `;
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function escAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

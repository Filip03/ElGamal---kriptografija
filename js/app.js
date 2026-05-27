import { createEncryptPanel } from './encryptPanel.js';
import { createDecryptPanel } from './decryptPanel.js';
import { checkHealth } from './api.js';
import { icons } from './icons.js';

function init() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <header class="app-header">
            <div class="header-inner">
                <div class="header-logo">
                    <span class="logo-icon">
                        ${icons['lock&key']}
                    </span>
                    <div>
                        <h1 class="header-title">ElGamal Kripto-sistem</h1>
                        <p class="header-sub">Asimetrična enkripcija i dekripcija</p>
                    </div>
                </div>
                <div class="api-status" id="api-status">
                    <span class="status-dot status-dot--checking"></span>
                    <span class="status-label">Provjera API...</span>
                </div>
            </div>
        </header>

        <main class="main-content">

            <div class="scenario-banner">
                <div class="sc-step" id="sc-1">
                    <div class="sc-avatar">A</div>
                    <div class="sc-info">
                        <span class="sc-role">Alice</span>
                        <span class="sc-action">Generiše ključeve</span>
                        <code class="sc-fn">elgam_set</code>
                    </div>
                </div>
                <div class="sc-connector" id="sc-conn-1">→</div>
                <div class="sc-step" id="sc-2">
                    <div class="sc-avatar sc-avatar--bob">B</div>
                    <div class="sc-info">
                        <span class="sc-role">Bob</span>
                        <span class="sc-action">Enkriptuje poruku</span>
                        <code class="sc-fn">elgam_enc</code>
                    </div>
                </div>
                <div class="sc-connector" id="sc-conn-2">→</div>
                <div class="sc-step" id="sc-3">
                    <div class="sc-avatar">A</div>
                    <div class="sc-info">
                        <span class="sc-role">Alice</span>
                        <span class="sc-action">Dekriptuje šifrat</span>
                        <code class="sc-fn">elgam_dec</code>
                    </div>
                </div>
            </div>
            <div class="sc-tab-hints">
                <span class="sc-tab-hint" id="sc-hint-enc">← Enkripcija tab (koraci 1 i 2)</span>
                <span class="sc-tab-hint" id="sc-hint-dec">Dekripcija tab (korak 3) →</span>
            </div>

            <nav class="tab-nav" role="tablist">
                <button class="tab-btn tab-btn--active" data-tab="enc" role="tab">${icons['lock']} Enkripcija</button>
                <button class="tab-btn" data-tab="dec" role="tab">${icons['unlock']} Dekripcija</button>
            </nav>

            <div id="tab-enc" class="tab-panel"></div>
            <div id="tab-dec" class="tab-panel" style="display:none"></div>
        </main>
    `;

    const encContainer = app.querySelector('#tab-enc');
    const decContainer = app.querySelector('#tab-dec');

    const decPanel = createDecryptPanel();
    decContainer.appendChild(decPanel);

    const encPanel = createEncryptPanel(({ cipher, p, a }) => {
        decPanel.fill({ cipher, p, a });
        switchTab('dec');
    });
    encContainer.appendChild(encPanel);

    app.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    function switchTab(tab) {
        const fab = document.querySelector('.fab-scroll-bottom');
        if (fab) fab.style.display = tab === 'enc' ? '' : 'none';

        app.querySelectorAll('.tab-btn').forEach(b =>
            b.classList.toggle('tab-btn--active', b.dataset.tab === tab)
        );
        encContainer.style.display = tab === 'enc' ? '' : 'none';
        decContainer.style.display = tab === 'dec' ? '' : 'none';

        const sc1     = app.querySelector('#sc-1');
        const sc2     = app.querySelector('#sc-2');
        const sc3     = app.querySelector('#sc-3');
        const conn1   = app.querySelector('#sc-conn-1');
        const conn2   = app.querySelector('#sc-conn-2');
        const hintEnc = app.querySelector('#sc-hint-enc');
        const hintDec = app.querySelector('#sc-hint-dec');

        if (tab === 'enc') {
            sc1.classList.add('sc-step--active');
            sc2.classList.add('sc-step--active');
            sc3.classList.remove('sc-step--active');
            conn1.classList.add('sc-connector--active');
            conn2.classList.remove('sc-connector--active');
            hintEnc.classList.add('sc-tab-hint--active');
            hintDec.classList.remove('sc-tab-hint--active');
        } else {
            sc1.classList.remove('sc-step--active');
            sc2.classList.remove('sc-step--active');
            sc3.classList.add('sc-step--active');
            conn1.classList.remove('sc-connector--active');
            conn2.classList.add('sc-connector--active');
            hintEnc.classList.remove('sc-tab-hint--active');
            hintDec.classList.add('sc-tab-hint--active');
        }
    }

    switchTab('enc');
    pingApi(app.querySelector('#api-status'));
}

async function pingApi(statusEl) {
    try {
        const ok = await checkHealth();
        statusEl.innerHTML = ok
            ? '<span class="status-dot status-dot--online"></span><span class="status-label">API aktivan</span>'
            : '<span class="status-dot status-dot--offline"></span><span class="status-label">API nedostupan</span>';
    } catch {
        statusEl.innerHTML = '<span class="status-dot status-dot--offline"></span><span class="status-label">API nedostupan</span>';
    }
}

init();

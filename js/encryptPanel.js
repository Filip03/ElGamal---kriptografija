import { encryptMessage } from './api.js';
import { pickTextFile, downloadJson } from './fileHandler.js';
import { notify } from './notification.js';
import { createKeysDisplay } from './keysDisplay.js';
import { createIterationsTable } from './iterationsTable.js';
import { icons } from './icons.js';

export function createEncryptPanel(onUseForDecrypt) {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
        <div class="card">
            <div class="panel-roles">
                <span class="role-badge role-badge--alice">Alice</span>
                <span class="role-sep">+</span>
                <span class="role-badge role-badge--bob">Bob</span>
                <span class="role-desc">Alice postavlja ElGamal sistem, Bob enkriptuje poruku</span>
            </div>

            <h2 class="panel-title">Enkripcija poruke</h2>

            <details class="help-box">
                <summary class="help-summary">ℹ Uputstvo — kako koristiti ovaj korak?</summary>
                <div class="help-body">
                    <div class="help-section">
                        <h4 class="help-section-title">Korak 1 — Alice generiše ključeve (elgam_set)</h4>
                        <p class="help-text">
                            Alice unosi željeni broj cifara <strong>k</strong>. Sistem pronalazi veliki prost broj
                            <strong>p</strong> sa k cifara (koristi Miller-Rabin test prostosti), a zatim generiše
                            generator grupe <strong>g</strong>, tajni ključ <strong>a</strong> i javni ključ
                            <strong>g<sup>a</sup> mod p</strong>. Alice dijeli javne podatke (p, g, g<sup>a</sup>)
                            s Bobom, a tajni ključ <strong>a</strong> čuva za sebe.
                        </p>
                    </div>
                    <div class="help-grid">
                        <div class="help-item">
                            <span class="help-param">k</span>
                            <span class="help-desc">Broj cifara prostog broja p. Veći k znači jači sistem, ali i sporije generisanje ključeva. Preporučeno: 6–10. Vrijednosti iznad 12 mogu potrajati nekoliko sekundi.</span>
                        </div>
                        <div class="help-item">
                            <span class="help-param">p</span>
                            <span class="help-desc">Veliki prost broj koji definiše grupu Z<sub>p</sub> nad kojom se obavlja enkripcija. <strong>Javno.</strong>.</span>
                        </div>
                        <div class="help-item">
                            <span class="help-param">g</span>
                            <span class="help-desc">Generator (primitivni korijen) grupe Z<sub>p</sub>. Odabran tako da g<sup>1</sup>, g<sup>2</sup>, ..., g<sup>p−1</sup> prolaze kroz sve elemente grupe. <strong>Javno.</strong></span>
                        </div>
                        <div class="help-item">
                            <span class="help-param">a</span>
                            <span class="help-desc">Alisin tajni ključ — nasumičan cijeli broj iz {1, ..., p−2}. Potreban je isključivo za dekripciju. <strong>Tajno!</strong></span>
                        </div>
                        <div class="help-item">
                            <span class="help-param">g<sup>a</sup> mod p</span>
                            <span class="help-desc">Alisin javni ključ, izračunat kao g na stepen a po modulu p. Bob ga koristi da enkriptuje poruku. <strong>Javno.</strong></span>
                        </div>
                    </div>
                    <div class="help-section">
                        <h4 class="help-section-title">Korak 2 — Bob enkriptuje (elgam_enc)</h4>
                        <p class="help-text">
                            Bob unosi poruku (tekst ili .txt fajl). Za svaki blok poruke sistem bira nasumičan
                            privremeni ključ k<sub>m</sub> i računa par šifrata (c<sub>1</sub>, c<sub>2</sub>).
                            Poruka se dijeli u blokove jer ElGamal radi nad brojevima manjim od p.
                        </p>
                    </div>
                    <div class="help-section help-section--warn">
                        <h4 class="help-section-title">Ograničenja</h4>
                        <ul class="help-list">
                            <li>Generisanje ključeva za k &gt; 12 može potrajati nekoliko sekundi</li>
                            <li>Poruka se dijeli u blokove veličine ⌊log<sub>256</sub>(p)⌋ bajtova — manji k = manji blokovi</li>
                            <li>Za dekripciju su neophodna ista p i a koja su generisana ovdje</li>
                        </ul>
                    </div>
                </div>
            </details>

            <div class="form-group">
                <div class="label-row">
                    <label class="form-label" for="enc-msg">Poruka</label>
                    <button class="btn btn--outline btn--sm" id="enc-upload">${icons['folder']} Učitaj .txt</button>
                </div>
                <textarea id="enc-msg" class="form-textarea"
                          placeholder="Unesite poruku za enkripciju..." rows="5"></textarea>
            </div>

            <div class="form-group">
                <label class="form-label" for="enc-k">Broj cifara (k)</label>
                <input type="number" id="enc-k" class="form-input form-input--sm"
                       value="6" min="1" step="1">
            </div>

            <button class="btn btn--primary btn--full" id="enc-submit">
                ${icons['lock']} Enkriptuj
            </button>
        </div>

        <div id="enc-results" class="results-area" style="display:none"></div>
    `;

    const textarea  = panel.querySelector('#enc-msg');
    const kInput    = panel.querySelector('#enc-k');
    const submitBtn = panel.querySelector('#enc-submit');
    const uploadBtn = panel.querySelector('#enc-upload');
    const resultsEl = panel.querySelector('#enc-results');

    uploadBtn.addEventListener('click', async () => {
        try {
            const { text, name } = await pickTextFile();
            textarea.value = text;
            notify(`Fajl "${name}" učitan`, 'success');
        } catch (e) {
            if (e.message) notify(e.message, 'error');
        }
    });

    submitBtn.addEventListener('click', async () => {
        const mssg = textarea.value.trim();
        const k    = parseInt(kInput.value);

        if (!mssg) { notify('Unesite poruku za enkripciju.', 'warning'); return; }
        if (isNaN(k) || k < 1) { notify('k mora biti pozitivan cijeli broj.', 'warning'); return; }

        setLoading(submitBtn, true, `${icons['lock']} Enkriptuj`, `${icons['hourglass']} Enkriptovanje...`);
        resultsEl.style.display = 'none';

        try {
            const data = await encryptMessage(mssg, k);
            renderResults(resultsEl, data, mssg, onUseForDecrypt);
            resultsEl.style.display = '';
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            notify('Enkripcija uspješna!', 'success');
        } catch (e) {
            notify(`Greška: ${e.message}`, 'error');
        } finally {
            setLoading(submitBtn, false, `${icons['lock']} Enkriptuj`, `${icons['hourglass']} Enkriptovanje...`);
        }
    });

    return panel;
}

function renderResults(container, data, originalMessage, onUseForDecrypt) {
    document.querySelector('.fab-scroll-bottom')?.remove();

    const { cipher, p, g, a, ga } = data;
    container.innerHTML = '';

    container.appendChild(createKeysDisplay({ p, g, a, ga }));
    container.appendChild(createIterationsTable(cipher, originalMessage, p));

    const actions = document.createElement('div');
    actions.className = 'result-actions';
    actions.innerHTML = `
        <button class="btn btn--outline" id="enc-download">${icons['save']} Sačuvaj šifrat (.json)</button>
        <button class="btn btn--accent" id="enc-use-dec">→ Koristi za dekripciju</button>
    `;
    container.appendChild(actions);

    actions.querySelector('#enc-download').addEventListener('click', () => {
        downloadJson({ cipher, p, g, a, ga }, 'sifrat.json');
        notify('Fajl preuzet.', 'success');
    });

    actions.querySelector('#enc-use-dec').addEventListener('click', () => {
        onUseForDecrypt({ cipher, p, a });
    });
}

function setLoading(btn, loading, normalText, loadingText) {
    btn.disabled = loading;
    btn.innerHTML = loading ? loadingText : normalText;
}

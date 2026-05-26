import { decryptMessage } from './api.js';
import { pickJsonFile, downloadText } from './fileHandler.js';
import { icons } from './icons.js';
import { notify } from './notification.js';

export function createDecryptPanel() {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
        <div class="card">
            <div class="panel-roles">
                <span class="role-badge role-badge--alice">Alice</span>
                <span class="role-desc">Alice dekriptuje šifrat koji je primila od Boba</span>
            </div>

            <h2 class="panel-title">Dekripcija poruke</h2>

            <details class="help-box">
                <summary class="help-summary">ℹ Uputstvo — kako koristiti ovaj korak?</summary>
                <div class="help-body">
                    <div class="help-section">
                        <h4 class="help-section-title">Korak 3 — Alice dekriptuje (elgam_dec)</h4>
                        <p class="help-text">
                            Alice prima šifrat od Boba (lista parova c<sub>1</sub>, c<sub>2</sub>) i
                            dekriptuje ga koristeći prost broj <strong>p</strong> i svoj tajni ključ
                            <strong>a</strong>. Za svaki par, Alice računa zajednički ključ
                            c<sub>1</sub><sup>a</sup> mod p, nalazi njegov inverz (mala Fermaova teorema),
                            i množenjem dobija originalni blok poruke.
                        </p>
                    </div>
                    <div class="help-grid">
                        <div class="help-item">
                            <span class="help-param">p</span>
                            <span class="help-desc">Isti prost broj koji je korišten pri enkripciji. Dogovoreno između Alice i Boba. Mora se tačno poklapati.</span>
                        </div>
                        <div class="help-item">
                            <span class="help-param">a</span>
                            <span class="help-desc">Alisin tajni ključ generisan u koraku 1. Bez njega dekripcija nije moguća. <strong>Tajno!</strong></span>
                        </div>
                        <div class="help-item">
                            <span class="help-param">Šifrat</span>
                            <span class="help-desc">Lista parova (c<sub>1</sub>, c<sub>2</sub>) u JSON formatu: <code>[["c1","c2"],...]</code>. Može se unijeti direktno, učitati iz .json fajla ili prenijeti automatski iz Enkripcija taba.</span>
                        </div>
                    </div>
                    <div class="help-section help-section--warn">
                        <h4 class="help-section-title">Ograničenja</h4>
                        <ul class="help-list">
                            <li>p i a moraju biti identični onima koji su korišteni pri enkripciji</li>
                            <li>Šifrat mora biti validan JSON niz parova — npr. <code>[["123","456"],["789","012"]]</code></li>
                            <li>Ako se učita .json fajl sačuvan iz Enkripcija taba, p i a se popunjavaju automatski</li>
                        </ul>
                    </div>
                </div>
            </details>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="dec-p">p &mdash; prost broj</label>
                    <input type="text" id="dec-p" class="form-input form-input--mono"
                           placeholder="npr. 123456789" autocomplete="off">
                </div>
                <div class="form-group">
                    <label class="form-label" for="dec-a">a &mdash; tajni ključ</label>
                    <input type="text" id="dec-a" class="form-input form-input--mono"
                           placeholder="npr. 54321" autocomplete="off">
                    <em class="field-hint">Alisin privatni ključ generisan pri enkripciji.</em>
                </div>
            </div>

            <div class="form-group">
                <div class="label-row">
                    <label class="form-label" for="dec-cipher">Šifrat (JSON niz)</label>
                    <button class="btn btn--outline btn--sm" id="dec-upload">${icons['folder']} Učitaj .json</button>
                </div>
                <textarea id="dec-cipher" class="form-textarea form-textarea--mono"
                          placeholder='[["c1_blok1", "c2_blok1"], ["c1_blok2", "c2_blok2"], ...]'
                          rows="6"></textarea>
            </div>

            <button class="btn btn--primary btn--full" id="dec-submit">
                ${icons['unlock']} Dekriptuj
            </button>
        </div>

        <div id="dec-results" class="results-area" style="display:none"></div>
    `;

    const pInput     = panel.querySelector('#dec-p');
    const aInput     = panel.querySelector('#dec-a');
    const cipherArea = panel.querySelector('#dec-cipher');
    const submitBtn  = panel.querySelector('#dec-submit');
    const uploadBtn  = panel.querySelector('#dec-upload');
    const resultsEl  = panel.querySelector('#dec-results');

    uploadBtn.addEventListener('click', async () => {
        try {
            const data = pickJsonToFields(await pickJsonFile(), pInput, aInput, cipherArea);
            notify(`JSON učitan (${data} blokova)`, 'success');
        } catch (e) {
            notify(e.message, 'error');
        }
    });

    submitBtn.addEventListener('click', async () => {
        const p = pInput.value.trim();
        const a = aInput.value.trim();
        if (!p || !a) { notify('Unesite p i tajni ključ a.', 'warning'); return; }

        let cipher;
        try {
            cipher = parseCipherInput(cipherArea.value.trim());
        } catch (e) {
            notify(e.message, 'error');
            return;
        }

        setLoading(submitBtn, true, `${icons['unlock']} Dekriptuj`, `${icons['hourglass']} Dekriptovanje...`);
        resultsEl.style.display = 'none';

        try {
            const data = await decryptMessage(cipher, p, a);
            renderResult(resultsEl, data.mssg);
            resultsEl.style.display = '';
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            notify('Dekripcija uspješna!', 'success');
        } catch (e) {
            notify(`Greška: ${e.message}`, 'error');
        } finally {
            setLoading(submitBtn, false, `${icons['unlock']} Dekriptuj`, `${icons['hourglass']} Dekriptovanje...`);
        }
    });

    panel.fill = ({ cipher, p, a }) => {
        pInput.value = p;
        aInput.value = a;
        cipherArea.value = JSON.stringify(cipher, null, 2);
    };

    return panel;
}

function parseCipherInput(raw) {
    if (!raw) throw new Error('Unesite šifrat.');
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('Šifrat nije validan JSON.');
    }
    if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.cipher)) return parsed.cipher;
    if (Array.isArray(parsed)) return parsed;
    throw new Error('Šifrat mora biti JSON niz parova [[c1, c2], ...].');
}

function pickJsonToFields(data, pInput, aInput, cipherArea) {
    const cipher = Array.isArray(data) ? data : data.cipher;
    if (!Array.isArray(cipher)) throw new Error('JSON ne sadrži validan šifrat.');
    if (data.p) pInput.value = data.p;
    if (data.a) aInput.value = data.a;
    cipherArea.value = JSON.stringify(cipher, null, 2);
    return cipher.length;
}

function renderResult(container, message) {
    container.innerHTML = '';
    const section = document.createElement('section');
    section.className = 'result-section';
    section.innerHTML = `
        <div class="section-header">
            <h3 class="section-title">Dekriptovana poruka</h3>
        </div>
        <div class="decrypted-message">${escHtml(message)}</div>
        <div class="result-actions">
            <button class="btn btn--outline" id="dec-download">${icons['save']} Sačuvaj poruku (.txt)</button>
        </div>
    `;
    section.querySelector('#dec-download').addEventListener('click', () => {
        downloadText(message, 'poruka.txt');
        notify('Fajl preuzet.', 'success');
    });
    container.appendChild(section);
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function setLoading(btn, loading, normalText, loadingText) {
    btn.disabled = loading;
    btn.innerHTML = loading ? loadingText : normalText;
}

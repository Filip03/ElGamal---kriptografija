const INITIAL_BLOCKS = 5;
const PAGE_SIZE = 20;

export function createIterationsTable(cipher, message = null, p = null) {
    const section = document.createElement('section');
    section.className = 'result-section';

    const blocks = message && p ? computeTextBlocks(message, parseInt(p)) : null;
    const showText = blocks && blocks.length === cipher.length;

    section.innerHTML = `
        <div class="section-header">
            <h3 class="section-title">Šifrat — iteracije</h3>
            <span class="section-badge">${cipher.length} blok${cipher.length === 1 ? '' : 'ova'}</span>
        </div>
        ${showText ? '<p class="table-hint">Svaki blok je dio poruke enkriptovan posebnim ključem k<sub>m</sub></p>' : ''}
        <div class="table-wrap">
            <table class="cipher-table">
                <thead>
                    <tr>
                        <th>#</th>
                        ${showText ? '<th>Tekst bloka</th>' : ''}
                        <th>c₁ = g<sup>k<sub>m</sub></sup> mod p</th>
                        <th>c₂ = m · (g<sup>a</sup>)<sup>k<sub>m</sub></sup> mod p</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;

    const tbody = section.querySelector('tbody');
    let rendered = 0;

    function renderRows(count) {
        const end = Math.min(rendered + count, cipher.length);
        for (let i = rendered; i < end; i++) {
            const [c1, c2] = cipher[i];
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="td-num">${i + 1}</td>
                ${showText ? `<td class="td-text">${escHtml(blocks[i] ?? '')}</td>` : ''}
                <td class="td-cipher">${c1}</td>
                <td class="td-cipher">${c2}</td>
            `;
            tbody.appendChild(tr);
        }
        rendered = end;
    }

    renderRows(INITIAL_BLOCKS);

    if (cipher.length > INITIAL_BLOCKS) {
        const btnWrap = document.createElement('div');
        btnWrap.className = 'iter-load-more';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn--outline btn--sm';

        const allBtn = document.createElement('button');
        allBtn.className = 'btn btn--outline btn--sm';
        allBtn.textContent = 'Prikaži sve';

        function updateLoadBtn() {
            const remaining = cipher.length - rendered;
            const next = Math.min(PAGE_SIZE, remaining);
            loadBtn.textContent = `Prikaži još ${next} (ostaje ${remaining})`;
        }

        updateLoadBtn();

        loadBtn.addEventListener('click', () => {
            renderRows(PAGE_SIZE);
            if (rendered >= cipher.length) {
                btnWrap.remove();
            } else {
                updateLoadBtn();
            }
        });

        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'fab-scroll-bottom';
        scrollBtn.title = 'Idi na dno stranice';
        scrollBtn.textContent = '↓ Dno';

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });

        allBtn.addEventListener('click', () => {
            renderRows(cipher.length);
            loadBtn.remove();
            allBtn.remove();
            btnWrap.remove();
            document.body.appendChild(scrollBtn);
        });

        btnWrap.appendChild(loadBtn);
        btnWrap.appendChild(allBtn);
        section.appendChild(btnWrap);
    }

    return section;
}

function computeTextBlocks(message, p) {
    const blockSize = Math.floor(Math.log(p) / Math.log(256));
    if (blockSize < 1) return null;

    const raw = new TextEncoder().encode(message);
    const blocks = [];
    const decoder = new TextDecoder('utf-8', { fatal: false });

    for (let i = 0; i < raw.length; i += blockSize) {
        const chunk = raw.slice(i, i + blockSize);
        blocks.push(decoder.decode(chunk));
    }
    return blocks;
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

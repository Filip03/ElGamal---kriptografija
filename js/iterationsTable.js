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
                <tbody>
                    ${cipher.map(([c1, c2], i) => `
                        <tr>
                            <td class="td-num">${i + 1}</td>
                            ${showText ? `<td class="td-text">${escHtml(blocks[i] ?? '')}</td>` : ''}
                            <td class="td-cipher">${c1}</td>
                            <td class="td-cipher">${c2}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

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

export function pickTextFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,text/plain';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => resolve({ text: ev.target.result, name: file.name });
            reader.onerror = () => reject(new Error('Greška pri čitanju fajla'));
            reader.readAsText(file, 'UTF-8');
        });
        input.click();
    });
}

export function pickJsonFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    resolve(JSON.parse(ev.target.result));
                } catch {
                    reject(new Error('Nevažeći JSON fajl'));
                }
            };
            reader.onerror = () => reject(new Error('Greška pri čitanju fajla'));
            reader.readAsText(file);
        });
        input.click();
    });
}

export function downloadJson(data, filename = 'sifrat.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    triggerDownload(blob, filename);
}

export function downloadText(text, filename = 'poruka.txt') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

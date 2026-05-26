const API_BASE = 'http://localhost:8000';

export async function encryptMessage(mssg, k) {
    const res = await fetch(`${API_BASE}/enc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mssg, k: parseInt(k) }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP greška ${res.status}`);
    }
    return res.json();
}

export async function decryptMessage(cipher, p, a) {
    const res = await fetch(`${API_BASE}/dec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cipher, p, a }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP greška ${res.status}`);
    }
    return res.json();
}

export async function checkHealth() {
    const res = await fetch(`${API_BASE}/`, {
        signal: AbortSignal.timeout(3000),
    });
    return res.ok;
}

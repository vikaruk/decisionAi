export function getStorage<T>(key: string): T | null {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
}
export function setStorage<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
}
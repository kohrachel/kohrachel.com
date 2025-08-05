export function first<T>(array: T[], n: number = 1) {
  return array.slice(0, n);
}

export function getFirstWord(text: string) {
  if (!text) return "";
  return text.trim().split(/\s+/)[0] || "";
}

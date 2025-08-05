export function first<T>(array: T[], n: number = 1) {
  return array.slice(0, n);
}

export function getFirstWord(string: string) {
  if (!string) return "";
  return string.trim().split(/\s+/)[0] || "";
}

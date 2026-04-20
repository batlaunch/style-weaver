const STORAGE_KEY = "fitted-fashion-style-usage";

type UsageMap = Record<string, number>;

function read(): UsageMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function getStyleUsage(): UsageMap {
  return read();
}

export function incrementStyleUsage(style: string) {
  if (!style || style === "any") return;
  try {
    const usage = read();
    usage[style] = (usage[style] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // ignore
  }
}

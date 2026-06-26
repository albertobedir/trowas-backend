export function normalizeLeadData(leadData: unknown): Record<string, unknown> {
  if (!leadData) return {};
  if (leadData instanceof Map) {
    return Object.fromEntries(leadData);
  }
  if (typeof leadData === "object") {
    return leadData as Record<string, unknown>;
  }
  return {};
}

const TITLE_KEYS = [
  "Full Name",
  "name",
  "Name",
  "firstName",
  "Email",
  "email",
];

const EMAIL_KEYS = ["Email", "email"];
const PHONE_KEYS = ["phone", "Phone", "phoneNumber", "Phone Number"];

function firstString(
  data: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const val = data[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return undefined;
}

export function extractLeadTitle(data: Record<string, unknown>): string {
  const fromPreferred = firstString(data, TITLE_KEYS);
  if (fromPreferred) return fromPreferred;

  for (const val of Object.values(data)) {
    if (typeof val === "string" && val.trim()) return val.trim();
  }

  return "Untitled Lead";
}

export function extractLeadEmail(
  data: Record<string, unknown>,
): string | undefined {
  return firstString(data, EMAIL_KEYS);
}

export function extractLeadPhone(
  data: Record<string, unknown>,
): string | undefined {
  return firstString(data, PHONE_KEYS);
}

export function formatLeadFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

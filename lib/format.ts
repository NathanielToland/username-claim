export function shortenAddress(address?: string | null) {
  if (!address) return "No address";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function normalizeHandle(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function isHandleValid(value: string) {
  return /^[a-z0-9.-]{2,20}$/.test(value);
}

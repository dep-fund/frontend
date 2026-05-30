export function formatUsdc(amount: bigint): string {
  return (Number(amount) / 1e6).toFixed(2);
}

export function formatToken(amount: bigint): string {
  return (Number(amount) / 1e18).toFixed(4);
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
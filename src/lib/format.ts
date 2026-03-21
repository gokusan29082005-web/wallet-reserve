export function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

export function formatRupees(paise: number): string {
  return `₹${paiseToRupees(paise)}`;
}

export function generatePin(): number {
  return Math.floor(Math.random() * 900) + 100;
}

export function getEndOfDay(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

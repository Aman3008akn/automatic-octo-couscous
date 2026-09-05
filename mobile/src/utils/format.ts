export function formatRupees(cents: number): string {
  if (cents === undefined || cents === null || isNaN(cents)) return "₹0";
  const rupees = Math.round(cents / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function formatPercent(percent?: number | null): string {
  if (!percent) return "";
  return `${Math.round(percent)}% OFF`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

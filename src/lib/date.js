export function nextMondayIST(from = new Date()) {
  const d = new Date(from);
  const day = d.getDay();
  d.setDate(d.getDate() + (((8 - day) % 7) || 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weekLabel(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
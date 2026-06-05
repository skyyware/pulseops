const formatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "short"
});

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatTimestamp(value: string) {
  return formatter.format(new Date(value));
}

export function minutesUntilSla(openedAt: string, slaMinutes: number, reference = new Date()) {
  const opened = new Date(openedAt).getTime();
  const deadline = opened + slaMinutes * 60_000;
  return Math.round((deadline - reference.getTime()) / 60_000);
}

export function formatSla(openedAt: string, slaMinutes: number, reference = new Date()) {
  const minutes = minutesUntilSla(openedAt, slaMinutes, reference);

  if (minutes <= 0) {
    return `${Math.abs(minutes)}m overdue`;
  }

  return `${minutes}m left`;
}

export function formatRelative(value: string, reference = new Date()) {
  const minutes = Math.round((new Date(value).getTime() - reference.getTime()) / 60_000);

  if (Math.abs(minutes) < 60) {
    return relativeFormatter.format(minutes, "minute");
  }

  return relativeFormatter.format(Math.round(minutes / 60), "hour");
}

export function nowIso() {
  return new Date().toISOString();
}

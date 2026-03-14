export function jsonToCSV(data: object[]): string {
  if (data.length === 0) {
    return "";
  }

  const headerSet = data.reduce<Set<string>>((set, item) => {
    Object.keys(item).forEach((key) => set.add(key));
    return set;
  }, new Set<string>());
  const headers = Array.from(headerSet);

  const escapeValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return "";
    }

    const stringValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);

    if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
      return `"${stringValue.replaceAll('"', '""')}"`;
    }

    return stringValue;
  };

  const rows = data.map((item) =>
    headers.map((header) => escapeValue((item as Record<string, unknown>)[header])).join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
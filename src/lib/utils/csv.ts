export function jsonToCSV(data: object[]): string {
  if (data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const lines = data.map((row) =>
    headers
      .map((header) => {
        const value = (row as Record<string, unknown>)[header];

        if (value === null || value === undefined) {
          return "";
        }

        const stringValue =
          typeof value === "string" ? value : JSON.stringify(value);

        return stringValue.includes(",")
          ? `"${stringValue.replaceAll('"', '""')}"`
          : stringValue;
      })
      .join(","),
  );

  return [headers.join(","), ...lines].join("\n");
}


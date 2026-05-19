export function exportRowsToCsv(rows, filenamePrefix = 'hydromonitor-live') {
  if (!rows?.length) return false;
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const text = String(value).replace(/"/g, '""');
          return /[",\n]/.test(text) ? `"${text}"` : text;
        })
        .join(',')
    )
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

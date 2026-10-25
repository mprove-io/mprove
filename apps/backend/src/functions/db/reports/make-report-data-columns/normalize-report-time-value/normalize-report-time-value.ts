export function normalizeReportTimeValue(item: { value: string }): string {
  let { value } = item;

  let match: RegExpMatchArray = value?.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d{3})?(?: UTC|Z|[+-]\d{2}(?::?\d{2})?)?$/
  );

  let normalizedValue = match
    ? `${match[1]}T${match[2]}${match[3] || '.000'}`
    : null;

  return normalizedValue;
}

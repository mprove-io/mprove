function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function unwrapErrorMessage(message: string): string {
  let text = message.replace(/^Error:\s*/, '').trim();

  let parse = (value: string): unknown => {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  };

  let read = (value: string): unknown => {
    let first = parse(value);
    if (typeof first !== 'string') return first;
    return parse(first.trim());
  };

  let json = read(text);

  if (json === undefined) {
    let start = text.indexOf('{');
    let end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      json = read(text.slice(start, end + 1));
    }
  }

  if (!isRecord(json)) return message;

  let err = isRecord(json.error) ? json.error : undefined;
  if (err) {
    let type = typeof err.type === 'string' ? err.type : undefined;
    let msg = typeof err.message === 'string' ? err.message : undefined;
    if (type && msg) return `${type}: ${msg}`;
    if (msg) return msg;
    if (type) return type;
    let code = typeof err.code === 'string' ? err.code : undefined;
    if (code) return code;
  }

  let msg = typeof json.message === 'string' ? json.message : undefined;
  if (msg) return msg;

  let reason = typeof json.error === 'string' ? json.error : undefined;
  if (reason) return reason;

  return message;
}

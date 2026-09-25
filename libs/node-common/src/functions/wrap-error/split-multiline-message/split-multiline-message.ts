export function splitMultilineMessage(item: { value: any }): any {
  let { value } = item;

  if (typeof value !== 'string') {
    let message: any = value || null;

    return message;
  }

  let message: string | string[] = value.includes('\n')
    ? value.split('\n')
    : value;

  return message;
}
